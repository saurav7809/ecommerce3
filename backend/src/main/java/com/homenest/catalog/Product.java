package com.homenest.catalog;

import com.homenest.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_category", columnList = "category_id"),
        @Index(name = "idx_products_active_featured", columnList = "active, featured"),
        @Index(name = "idx_products_price", columnList = "price")
})
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String sku;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, unique = true, length = 190)
    private String slug;

    @Column(nullable = false, length = 80)
    private String brand;

    @Column(nullable = false, length = 4000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 40) private String room;
    @Column(length = 40) private String style;
    @Column(length = 40) private String color;
    @Column(length = 60) private String material;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** "Was" price shown struck through when the product is on sale. */
    @Column(precision = 12, scale = 2)
    private BigDecimal compareAtPrice;

    @Column(nullable = false)
    private int stock;

    private Double widthCm;
    private Double depthCm;
    private Double heightCm;
    private Double weightKg;

    @Column(nullable = false) private boolean assemblyRequired;
    @Column(nullable = false) private boolean freeShipping;
    @Column(nullable = false) private boolean featured;
    @Column(nullable = false) private boolean active = true;

    @Column(nullable = false) private double averageRating;
    @Column(nullable = false) private int reviewCount;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @OrderColumn(name = "position")
    @Column(name = "url", nullable = false, length = 500)
    private List<String> images = new ArrayList<>();

    /** The marketplace seller who listed the product; null for house brands managed by admins. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private Instant updatedAt = Instant.now();

    protected Product() { }

    public Product(String sku, String slug) {
        this.sku = sku;
        this.slug = slug;
    }

    @PreUpdate
    void touch() { updatedAt = Instant.now(); }

    public void reserve(int quantity) {
        if (quantity < 1 || stock < quantity) throw new IllegalArgumentException("Not enough stock for " + name);
        stock -= quantity;
    }

    public void release(int quantity) { stock += Math.max(quantity, 0); }

    public void applyRating(double average, int count) {
        this.averageRating = Math.round(average * 10.0) / 10.0;
        this.reviewCount = count;
    }

    public boolean onSale() { return compareAtPrice != null && compareAtPrice.compareTo(price) > 0; }

    public int discountPercent() {
        if (!onSale()) return 0;
        return compareAtPrice.subtract(price).multiply(BigDecimal.valueOf(100))
                .divide(compareAtPrice, 0, RoundingMode.HALF_UP).intValue();
    }

    public String primaryImage() { return images.isEmpty() ? null : images.getFirst(); }

    public Long getId() { return id; }
    public String getSku() { return sku; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getBrand() { return brand; }
    public String getDescription() { return description; }
    public Category getCategory() { return category; }
    public String getRoom() { return room; }
    public String getStyle() { return style; }
    public String getColor() { return color; }
    public String getMaterial() { return material; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getCompareAtPrice() { return compareAtPrice; }
    public int getStock() { return stock; }
    public Double getWidthCm() { return widthCm; }
    public Double getDepthCm() { return depthCm; }
    public Double getHeightCm() { return heightCm; }
    public Double getWeightKg() { return weightKg; }
    public boolean isAssemblyRequired() { return assemblyRequired; }
    public boolean isFreeShipping() { return freeShipping; }
    public boolean isFeatured() { return featured; }
    public boolean isActive() { return active; }
    public double getAverageRating() { return averageRating; }
    public int getReviewCount() { return reviewCount; }
    public List<String> getImages() { return images; }
    public User getSeller() { return seller; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setBrand(String brand) { this.brand = brand; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(Category category) { this.category = category; }
    public void setRoom(String room) { this.room = room; }
    public void setStyle(String style) { this.style = style; }
    public void setColor(String color) { this.color = color; }
    public void setMaterial(String material) { this.material = material; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setCompareAtPrice(BigDecimal compareAtPrice) { this.compareAtPrice = compareAtPrice; }
    public void setStock(int stock) { this.stock = stock; }
    public void setDimensions(Double widthCm, Double depthCm, Double heightCm) { this.widthCm = widthCm; this.depthCm = depthCm; this.heightCm = heightCm; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
    public void setAssemblyRequired(boolean assemblyRequired) { this.assemblyRequired = assemblyRequired; }
    public void setFreeShipping(boolean freeShipping) { this.freeShipping = freeShipping; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public void setActive(boolean active) { this.active = active; }
    public void setSeller(User seller) { this.seller = seller; }
    public void setImages(List<String> images) { this.images.clear(); this.images.addAll(images); }
}
