package store.commongoods.order;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="customer_orders")
public class CustomerOrder {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true, length=32) private String reference;
    @Column(nullable=false, length=190) private String email;
    @Column(nullable=false, length=150) private String fullName;
    @Column(nullable=false, length=500) private String deliveryAddress;
    @Column(nullable=false, precision=10, scale=2) private BigDecimal subtotal;
    @Column(nullable=false, length=30) private String status="PLACED";
    @Column(nullable=false, length=30) private String paymentStatus="PENDING";
    @Column(length=80) private String razorpayOrderId;
    @Column(nullable=false) private Instant createdAt=Instant.now();
    @OneToMany(mappedBy="order", cascade=CascadeType.ALL, orphanRemoval=true) private List<OrderLine> items=new ArrayList<>();
    protected CustomerOrder() { }
    public CustomerOrder(String reference,String email,String fullName,String deliveryAddress,BigDecimal subtotal) { this.reference=reference;this.email=email;this.fullName=fullName;this.deliveryAddress=deliveryAddress;this.subtotal=subtotal; }
    public void addItem(OrderLine line) { items.add(line); line.setOrder(this); }
    public Long getId(){return id;} public String getReference(){return reference;} public String getEmail(){return email;} public String getFullName(){return fullName;} public String getDeliveryAddress(){return deliveryAddress;} public BigDecimal getSubtotal(){return subtotal;} public String getStatus(){return status;} public String getPaymentStatus(){return paymentStatus;} public Instant getCreatedAt(){return createdAt;} public List<OrderLine> getItems(){return items;}
    public String getRazorpayOrderId(){return razorpayOrderId;} public void setRazorpayOrderId(String id){this.razorpayOrderId=id;} public void markPaid(){this.paymentStatus="CAPTURED";this.status="PROCESSING";}
}
