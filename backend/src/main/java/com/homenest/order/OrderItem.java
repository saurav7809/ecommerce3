package com.homenest.order;

import jakarta.persistence.*;

import java.math.BigDecimal;

/** Snapshot of a product at the time of purchase, so later catalog edits do not change past orders. */
@Entity
@Table(name = "order_items", indexes = @Index(name = "idx_order_items_product", columnList = "productId"))
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false) private Long productId;
    @Column(nullable = false, length = 190) private String productSlug;
    @Column(nullable = false, length = 160) private String productName;
    @Column(length = 500) private String imageUrl;
    @Column(nullable = false) private int quantity;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal lineTotal;

    protected OrderItem() { }

    public OrderItem(Long productId, String productSlug, String productName, String imageUrl, int quantity, BigDecimal unitPrice) {
        this.productId = productId;
        this.productSlug = productSlug;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    void setOrder(Order order) { this.order = order; }

    public Long getProductId() { return productId; }
    public String getProductSlug() { return productSlug; }
    public String getProductName() { return productName; }
    public String getImageUrl() { return imageUrl; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getLineTotal() { return lineTotal; }
}
