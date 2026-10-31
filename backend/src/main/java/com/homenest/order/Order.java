package com.homenest.order;

import com.homenest.common.AddressDetails;
import com.homenest.order.OrderEnums.OrderStatus;
import com.homenest.order.OrderEnums.PaymentMethod;
import com.homenest.order.OrderEnums.PaymentStatus;
import com.homenest.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_user_created", columnList = "user_id, createdAt"),
        @Index(name = "idx_orders_status", columnList = "status")
})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 190)
    private String email;

    @Embedded
    private AddressDetails shippingAddress;

    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal subtotal;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal shippingFee;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal total;

    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private OrderStatus status;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private PaymentMethod paymentMethod;

    @Column(length = 80) private String razorpayOrderId;
    @Column(length = 80) private String razorpayPaymentId;

    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<OrderItem> items = new ArrayList<>();

    protected Order() { }

    public Order(String reference, User user, AddressDetails shippingAddress, PaymentMethod paymentMethod) {
        this.reference = reference;
        this.user = user;
        this.email = user.getEmail();
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.status = paymentMethod == PaymentMethod.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING_PAYMENT;
    }

    @PreUpdate
    void touch() { updatedAt = Instant.now(); }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void setTotals(BigDecimal subtotal, BigDecimal shippingFee) {
        this.subtotal = subtotal;
        this.shippingFee = shippingFee;
        this.total = subtotal.add(shippingFee);
    }

    public void markPaid(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
        this.paymentStatus = PaymentStatus.PAID;
        if (status == OrderStatus.PENDING_PAYMENT) status = OrderStatus.CONFIRMED;
    }

    public void markPaymentFailed() {
        if (paymentStatus == PaymentStatus.PENDING) paymentStatus = PaymentStatus.FAILED;
    }

    public void changeStatus(OrderStatus next) {
        this.status = next;
        if (next == OrderStatus.CANCELLED && paymentStatus == PaymentStatus.PAID) paymentStatus = PaymentStatus.REFUND_PENDING;
        if (next == OrderStatus.DELIVERED && paymentMethod == PaymentMethod.COD) paymentStatus = PaymentStatus.PAID;
    }

    public Long getId() { return id; }
    public String getReference() { return reference; }
    public User getUser() { return user; }
    public String getEmail() { return email; }
    public AddressDetails getShippingAddress() { return shippingAddress; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public BigDecimal getTotal() { return total; }
    public OrderStatus getStatus() { return status; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }
}
