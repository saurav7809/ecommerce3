package com.homenest.auth;

import com.homenest.config.AppProperties;
import com.homenest.user.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(AppProperties properties) {
        byte[] secret = properties.jwt().secret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("app.jwt.secret (JWT_SECRET) must be at least 32 bytes");
        }
        this.key = Keys.hmacShaKeyFor(secret);
        this.expirationMs = properties.jwt().expirationMs();
    }

    public String issue(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("tokenVersion", user.getTokenVersion())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    /** Returns the e-mail address in a valid token; throws if the token is invalid or expired. */
    public String subject(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isCurrentFor(String token, User user) {
        Integer tokenVersion = Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
                .getPayload().get("tokenVersion", Integer.class);
        return tokenVersion == null ? user.getTokenVersion() == 0 : tokenVersion == user.getTokenVersion();
    }
}
