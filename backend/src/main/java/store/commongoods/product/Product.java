package store.commongoods.product;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products", indexes = { @Index(name = "idx_products_category", columnList = "category"), @Index(name = "idx_products_featured", columnList = "featured") })
public class Product implements java.io.Serializable {
    private static final long serialVersionUID = 1L;
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 140) private String name;
    @Column(nullable = false, length = 60) private String category;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(nullable = false, length = 500) private String imageUrl;
    @Column(nullable = false, length = 180) private String variant;
    @Column(nullable = false, length = 700) private String description;
    @Column(nullable = false) private int inventory = 25;
    @Column(nullable = false) private boolean featured;
    @Column(nullable = false) private Instant createdAt = Instant.now();

    protected Product() { }
    public Product(String name, String category, BigDecimal price, String imageUrl, String variant, String description, int inventory, boolean featured) {
        this.name = name; this.category = category; this.price = price; this.imageUrl = imageUrl;
        this.variant = variant; this.description = description; this.inventory = inventory; this.featured = featured;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public String getVariant() { return variant; }
    public String getDescription() { return description; }
    public int getInventory() { return inventory; }
    public boolean isFeatured() { return featured; }
    public void reserve(int quantity) { if (quantity < 1 || inventory < quantity) throw new IllegalArgumentException("Not enough stock"); inventory -= quantity; }
}
