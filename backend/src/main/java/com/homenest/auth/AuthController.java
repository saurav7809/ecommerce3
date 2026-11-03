package com.homenest.auth;

import com.homenest.config.AppProperties;
import com.homenest.user.Role;
import com.homenest.user.User;
import com.homenest.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    public enum AccountType { CUSTOMER, SELLER }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @Pattern(regexp = "^[0-9+ -]{7,20}$", message = "must be a valid phone number") String phone,
            AccountType accountType) { }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) { }

    public record UserView(Long id, String fullName, String email, String role, String phone,
                           boolean emailVerified, boolean phoneVerified, Instant createdAt) {
        static UserView of(User u) {
            return new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getPhone(),
                    u.isEmailVerified(), u.isPhoneVerified(), u.getCreatedAt());
        }
    }

    public record AuthResponse(String token, UserView user) { }
    public record RegistrationResponse(String email, String message) { }
    public record ProfileUpdateRequest(@NotBlank @Size(max = 100) String fullName,
                                       @Pattern(regexp = "^[0-9+ -]{7,20}$", message = "must be a valid phone number") String phone) { }
    public record EmailRequest(@NotBlank @Email @Size(max = 190) String email) { }
    public record VerificationRequest(@NotBlank @Email @Size(max = 190) String email,
                                      @NotBlank @Pattern(regexp = "^[0-9]{6}$") String code) { }
    public record PhoneVerificationRequest(@NotBlank @Pattern(regexp = "^[0-9]{6}$") String code) { }
    public record PasswordResetRequest(@NotBlank @Email @Size(max = 190) String email,
                                       @NotBlank @Pattern(regexp = "^[0-9]{6}$") String code,
                                       @NotBlank @Size(min = 8, max = 100) String newPassword) { }
    public record GoogleRequest(@NotBlank @Size(max = 4096) String idToken) { }
    public record MessageResponse(String message) { }

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    private final AuthenticationManager authenticationManager;
    private final AccountSecurityService accountSecurity;
    private final AppProperties.Auth authProperties;
    private final RestClient googleClient;

    public AuthController(UserRepository users, PasswordEncoder passwords, JwtService jwt,
                          AuthenticationManager authenticationManager, AccountSecurityService accountSecurity,
                          AppProperties properties, RestClient.Builder builder) {
        this.users = users;
        this.passwords = passwords;
        this.jwt = jwt;
        this.authenticationManager = authenticationManager;
        this.accountSecurity = accountSecurity;
        this.authProperties = properties.auth();
        this.googleClient = builder.baseUrl("https://oauth2.googleapis.com").build();
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Create a customer or seller account; verify the email before signing in")
    public RegistrationResponse register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        Role role = request.accountType() == AccountType.SELLER ? Role.SELLER : Role.CUSTOMER;
        User user = new User(request.name().trim(), email, passwords.encode(request.password()), role);
        user.setPhone(request.phone());
        users.save(user);
        return new RegistrationResponse(email, "Account created. Request an email verification code before signing in.");
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in with verified e-mail and password and return a JWT")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        var result = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.email().trim().toLowerCase(Locale.ROOT), request.password()));
        User user = (User) result.getPrincipal();
        return new AuthResponse(jwt.issue(user), UserView.of(user));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Current signed-in account")
    public UserView me(@AuthenticationPrincipal User user) {
        return UserView.of(user);
    }

    @PatchMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Transactional
    @Operation(summary = "Update your display name and phone number")
    public UserView updateProfile(@AuthenticationPrincipal User user, @Valid @RequestBody ProfileUpdateRequest request) {
        User account = users.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        account.setName(request.fullName().trim());
        String phone = request.phone() == null || request.phone().isBlank() ? null : request.phone().trim();
        if (!Objects.equals(account.getPhone(), phone)) accountSecurity.invalidatePhoneVerification(account);
        account.setPhone(phone);
        return UserView.of(account);
    }

    @PostMapping("/email-verification/request")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public MessageResponse requestEmailVerification(@Valid @RequestBody EmailRequest request) {
        accountSecurity.requestEmailVerification(request.email());
        return new MessageResponse("If the account exists and needs verification, a code has been sent.");
    }

    @PostMapping("/email-verification/verify")
    public MessageResponse verifyEmail(@Valid @RequestBody VerificationRequest request) {
        accountSecurity.verifyEmail(request.email(), request.code());
        return new MessageResponse("Email verified. You can now sign in.");
    }

    @PostMapping("/phone-verification/request")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @SecurityRequirement(name = "bearerAuth")
    public MessageResponse requestPhoneVerification(@AuthenticationPrincipal User user) {
        accountSecurity.requestPhoneVerification(user);
        return new MessageResponse("A verification code has been sent to your phone.");
    }

    @PostMapping("/phone-verification/verify")
    @SecurityRequirement(name = "bearerAuth")
    public MessageResponse verifyPhone(@AuthenticationPrincipal User user, @Valid @RequestBody PhoneVerificationRequest request) {
        accountSecurity.verifyPhone(user, request.code());
        return new MessageResponse("Phone number verified.");
    }

    @PostMapping("/password-reset/request")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public MessageResponse requestPasswordReset(@Valid @RequestBody EmailRequest request) {
        accountSecurity.requestPasswordReset(request.email());
        return new MessageResponse("If the account exists, a password reset code has been sent.");
    }

    @PostMapping("/password-reset")
    public MessageResponse resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        accountSecurity.resetPassword(request.email(), request.code(), request.newPassword());
        return new MessageResponse("Password updated. You can now sign in.");
    }

    @PostMapping("/google")
    @Transactional
    @Operation(summary = "Sign in with a Google Identity Services ID token")
    public AuthResponse google(@Valid @RequestBody GoogleRequest request) {
        String clientId = authProperties.googleClientId();
        if (clientId == null || clientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured");
        }

        Map<?, ?> claims;
        try {
            claims = googleClient.get()
                    .uri(uri -> uri.path("/tokeninfo").queryParam("id_token", request.idToken()).build())
                    .retrieve().body(Map.class);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google credential could not be verified");
        }
        if (claims == null || !clientId.equals(claims.get("aud"))
                || !Boolean.parseBoolean(String.valueOf(claims.get("email_verified")))
                || !(claims.get("email") instanceof String googleEmail)
                || googleEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google credential is invalid");
        }

        String email = googleEmail.trim().toLowerCase(Locale.ROOT);
        User user = users.findByEmailIgnoreCase(email).orElseGet(() -> {
            String name = claims.get("name") instanceof String value && !value.isBlank() ? value : email;
            User created = new User(name, email, passwords.encode(UUID.randomUUID().toString()), Role.CUSTOMER);
            created.markEmailVerified();
            return users.save(created);
        });
        if (!user.isEmailVerified()) user.markEmailVerified();
        return new AuthResponse(jwt.issue(user), UserView.of(user));
    }
}
