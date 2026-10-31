package com.homenest.address;

import com.homenest.common.AddressDetails;
import com.homenest.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "addresses", indexes = @Index(name = "idx_addresses_user", columnList = "user_id"))
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Embedded
    private AddressDetails details;

    @Column(nullable = false)
    private boolean defaultAddress;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Address() { }

    public Address(User user, AddressDetails details, boolean defaultAddress) {
        this.user = user;
        this.details = details;
        this.defaultAddress = defaultAddress;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public AddressDetails getDetails() { return details; }
    public boolean isDefaultAddress() { return defaultAddress; }
    public void setDefaultAddress(boolean value) { this.defaultAddress = value; }
}
