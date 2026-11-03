package com.homenest.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 190)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.CUSTOMER;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean phoneVerified;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int tokenVersion;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected User() { }

    public User(String name, String email, String passwordHash, Role role) {
        this.name = name;
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public String getPhone() { return phone; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isPhoneVerified() { return phoneVerified; }
    public int getTokenVersion() { return tokenVersion; }
    public void setName(String name) { this.name = name; }
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
        tokenVersion++;
    }
    public void setPhone(String phone) {
        if (!java.util.Objects.equals(this.phone, phone)) phoneVerified = false;
        this.phone = phone;
    }
    public void markEmailVerified() { this.emailVerified = true; }
    public void markPhoneVerified() { this.phoneVerified = true; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isAdmin() { return role == Role.ADMIN; }

    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(new SimpleGrantedAuthority("ROLE_" + role.name())); }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isEnabled() { return enabled && emailVerified; }
}
