package com.homenest.auth;

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
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

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

    public record UserView(Long id, String name, String email, String role, String phone) {
        static UserView of(User u) { return new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getPhone()); }
    }

    public record AuthResponse(String token, UserView user) { }

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository users, PasswordEncoder passwords, JwtService jwt, AuthenticationManager authenticationManager) {
        this.users = users;
        this.passwords = passwords;
        this.jwt = jwt;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Create a customer or seller account and return a JWT")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        // Admin accounts are never created through public registration.
        Role role = request.accountType() == AccountType.SELLER ? Role.SELLER : Role.CUSTOMER;
        User user = new User(request.name().trim(), email, passwords.encode(request.password()), role);
        user.setPhone(request.phone());
        user = users.save(user);
        return new AuthResponse(jwt.issue(user), UserView.of(user));
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in with e-mail and password and return a JWT")
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
}
