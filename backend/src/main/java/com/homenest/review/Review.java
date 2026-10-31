package com.homenest.review;

import com.homenest.catalog.Product;
import com.homenest.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(name = "uk_reviews_product_user", columnNames = {"product_id", "user_id"}),
        indexes = @Index(name = "idx_reviews_product_created", columnList = "product_id, createdAt"))
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false) private int rating;
    @Column(nullable = false, length = 120) private String title;
    @Column(nullable = false, length = 2000) private String body;
    @Column(nullable = false) private boolean verifiedPurchase;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();

    protected Review() { }

    public Review(Product product, User user, int rating, String title, String body, boolean verifiedPurchase) {
        this.product = product;
        this.user = user;
        this.rating = rating;
        this.title = title;
        this.body = body;
        this.verifiedPurchase = verifiedPurchase;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public User getUser() { return user; }
    public int getRating() { return rating; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public boolean isVerifiedPurchase() { return verifiedPurchase; }
    public Instant getCreatedAt() { return createdAt; }
}
