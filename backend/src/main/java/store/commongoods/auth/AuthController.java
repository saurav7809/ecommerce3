package store.commongoods.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    public record RegisterRequest(@NotBlank @Size(max=100) String name, @Email @NotBlank String email, @NotBlank @Size(min=8,max=100) String password) { }
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) { }
    public record AuthResponse(String token, String name, String email) { }
    private final StoreUserRepository users; private final PasswordEncoder passwords; private final JwtService jwt; private final AuthenticationManager auth;
    public AuthController(StoreUserRepository users, PasswordEncoder passwords, JwtService jwt, AuthenticationManager auth) { this.users=users; this.passwords=passwords; this.jwt=jwt; this.auth=auth; }
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase(); if (users.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        StoreUser user = users.save(new StoreUser(request.name().trim(), email, passwords.encode(request.password()))); return response(user);
    }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request) { Authentication result = auth.authenticate(new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())); return response((StoreUser) result.getPrincipal()); }
    private AuthResponse response(StoreUser user) { return new AuthResponse(jwt.issue(user), user.getName(), user.getEmail()); }
}
