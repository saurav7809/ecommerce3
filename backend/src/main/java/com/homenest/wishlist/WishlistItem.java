package com.homenest.wishlist;

import com.homenest.catalog.Product;
import com.homenest.user.User;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "wishlist_items",
        uniqueConstraints = @UniqueConstraint(name = "uk_wishlist_user_product", columnNames = {"user_id", "product_id"}))
public class WishlistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected WishlistItem() { }

    public WishlistItem(User user, Product product) {
        this.user = user;
        this.product = product;
    }

    public Product getProduct() { return product; }
}
