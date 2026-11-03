package com.homenest.auth;

import com.homenest.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "otp_challenges")
public class OtpChallenge {
    public enum Purpose { EMAIL_VERIFICATION, PHONE_VERIFICATION, PASSWORD_RESET }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Purpose purpose;

    @Column(nullable = false, length = 100)
    private String codeHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private int attempts;

    @Column(nullable = false)
    private boolean consumed;

    protected OtpChallenge() { }

    public OtpChallenge(User user, Purpose purpose, String codeHash, Instant expiresAt) {
        this.user = user;
        this.purpose = purpose;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
    }

    public User getUser() { return user; }
    public Purpose getPurpose() { return purpose; }
    public String getCodeHash() { return codeHash; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public int getAttempts() { return attempts; }
    public boolean isConsumed() { return consumed; }
    public void incrementAttempts() { attempts++; }
    public void consume() { consumed = true; }
}
