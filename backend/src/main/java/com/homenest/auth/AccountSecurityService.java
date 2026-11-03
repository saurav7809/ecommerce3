package com.homenest.auth;

import com.homenest.config.AppProperties;
import com.homenest.user.User;
import com.homenest.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Service
public class AccountSecurityService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;

    private final OtpChallengeRepository challenges;
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final OtpDeliveryService delivery;
    private final AppProperties.Otp config;

    public AccountSecurityService(OtpChallengeRepository challenges, UserRepository users, PasswordEncoder passwords,
                                  OtpDeliveryService delivery, AppProperties properties) {
        this.challenges = challenges;
        this.users = users;
        this.passwords = passwords;
        this.delivery = delivery;
        this.config = properties.auth().otp();
        if (config.expirationMinutes() < 1) {
            throw new IllegalStateException("app.auth.otp.expiration-minutes must be at least one");
        }
    }

    @Transactional
    public void requestEmailVerification(String email) {
        users.findByEmailIgnoreCase(normalize(email)).filter(user -> !user.isEmailVerified())
                .ifPresent(user -> createChallenge(user, OtpChallenge.Purpose.EMAIL_VERIFICATION, true));
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void verifyEmail(String email, String code) {
        User user = users.findByEmailIgnoreCase(normalize(email))
                .orElseThrow(() -> invalidCode());
        OtpChallenge challenge = validChallenge(user, OtpChallenge.Purpose.EMAIL_VERIFICATION, code);
        challenge.consume();
        user.markEmailVerified();
    }

    @Transactional
    public void requestPhoneVerification(User user) {
        User account = managedUser(user.getId());
        if (account.getPhone() == null || account.getPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add a phone number to your profile first");
        }
        if (!account.isPhoneVerified()) createChallenge(account, OtpChallenge.Purpose.PHONE_VERIFICATION, false);
    }

    @Transactional
    public void invalidatePhoneVerification(User user) {
        challenges.findByUserIdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(
                user.getId(), OtpChallenge.Purpose.PHONE_VERIFICATION).forEach(OtpChallenge::consume);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void verifyPhone(User user, String code) {
        User account = managedUser(user.getId());
        OtpChallenge challenge = validChallenge(account, OtpChallenge.Purpose.PHONE_VERIFICATION, code);
        challenge.consume();
        account.markPhoneVerified();
    }

    @Transactional
    public void requestPasswordReset(String email) {
        users.findByEmailIgnoreCase(normalize(email))
                .ifPresent(user -> createChallenge(user, OtpChallenge.Purpose.PASSWORD_RESET, true));
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void resetPassword(String email, String code, String newPassword) {
        User user = users.findByEmailIgnoreCase(normalize(email))
                .orElseThrow(() -> invalidCode());
        OtpChallenge challenge = validChallenge(user, OtpChallenge.Purpose.PASSWORD_RESET, code);
        challenge.consume();
        user.setPasswordHash(passwords.encode(newPassword));
    }

    private void createChallenge(User user, OtpChallenge.Purpose purpose, boolean email) {
        Instant now = Instant.now();
        challenges.findFirstByUserIdAndPurposeOrderByCreatedAtDesc(user.getId(), purpose)
                .filter(challenge -> challenge.getCreatedAt().isAfter(now.minus(1, ChronoUnit.MINUTES)))
                .ifPresent(challenge -> {
                    throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please wait before requesting another code");
                });
        challenges.findByUserIdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(user.getId(), purpose)
                .forEach(OtpChallenge::consume);
        String code = String.format(Locale.ROOT, "%06d", RANDOM.nextInt(1_000_000));
        Instant expires = now.plus(config.expirationMinutes(), ChronoUnit.MINUTES);
        challenges.save(new OtpChallenge(user, purpose, passwords.encode(code), expires));
        String purposeLabel = switch (purpose) {
            case EMAIL_VERIFICATION -> "email verification";
            case PHONE_VERIFICATION -> "phone verification";
            case PASSWORD_RESET -> "password reset";
        };
        if (email) delivery.sendEmail(user.getEmail(), code, purposeLabel);
        else delivery.sendSms(user.getPhone(), code, purposeLabel);
    }

    private OtpChallenge validChallenge(User user, OtpChallenge.Purpose purpose, String code) {
        List<OtpChallenge> active = challenges.findByUserIdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(user.getId(), purpose);
        OtpChallenge challenge = active.isEmpty() ? null : active.getFirst();
        if (challenge == null || challenge.getExpiresAt().isBefore(Instant.now()) || challenge.getAttempts() >= MAX_ATTEMPTS) {
            if (challenge != null) challenge.consume();
            throw invalidCode();
        }
        if (!passwords.matches(code, challenge.getCodeHash())) {
            challenge.incrementAttempts();
            throw invalidCode();
        }
        return challenge;
    }

    private ResponseStatusException invalidCode() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "The code is invalid or has expired");
    }

    private User managedUser(Long id) {
        return users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
