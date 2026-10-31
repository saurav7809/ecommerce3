package com.homenest.order;

import com.homenest.address.AddressService;
import com.homenest.catalog.Product;
import com.homenest.catalog.ProductRepository;
import com.homenest.common.AddressDetails;
import com.homenest.common.PageResponse;
import com.homenest.config.AppProperties;
import com.homenest.messaging.OrderPlacedEvent;
import com.homenest.order.OrderEnums.OrderStatus;
import com.homenest.order.OrderEnums.PaymentMethod;
import com.homenest.user.User;
import com.homenest.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.homenest.order.PricingService.CartItem;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;

@Service
public class OrderService {

    public record CheckoutRequest(
            @NotEmpty @Size(max = PricingService.MAX_LINES) List<@Valid CartItem> items,
            @NotNull @Valid AddressDetails.Input shippingAddress,
            @NotNull PaymentMethod paymentMethod,
            boolean saveAddress) { }

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final char[] REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();

    private final OrderRepository orders;
    private final ProductRepository products;
    private final UserRepository users;
    private final PricingService pricing;
    private final AddressService addresses;
    private final ApplicationEventPublisher events;
    private final AppProperties properties;

    public OrderService(OrderRepository orders, ProductRepository products, UserRepository users, PricingService pricing,
                        AddressService addresses, ApplicationEventPublisher events, AppProperties properties) {
        this.orders = orders;
        this.products = products;
        this.users = users;
        this.pricing = pricing;
        this.addresses = addresses;
        this.events = events;
        this.properties = properties;
    }

    /**
     * Prices the cart from the catalog (never from the client), reserves stock under row locks
     * taken in product-id order, and saves the order.
     */
    @Transactional
    @CacheEvict(value = {"productSearch", "productDetail", "productSimilar"}, allEntries = true)
    public OrderView place(Long userId, CheckoutRequest request) {
        if (request.paymentMethod() == PaymentMethod.RAZORPAY && !properties.razorpay().configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Online payment is not configured. Choose Cash on Delivery or set the Razorpay test keys.");
        }
        User user = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Order order = new Order(newReference(), user, request.shippingAddress().toEmbeddable(), request.paymentMethod());

        BigDecimal subtotal = BigDecimal.ZERO;
        boolean allFreeShipping = true;
        for (var entry : PricingService.merge(request.items()).entrySet()) {
            Product product = products.findLockedById(entry.getKey())
                    .filter(Product::isActive)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "A product in your cart is no longer available"));
            int quantity = entry.getValue();
            if (product.getStock() < quantity) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, product.getStock() == 0
                        ? product.getName() + " is out of stock"
                        : "Only " + product.getStock() + " left of " + product.getName());
            }
            product.reserve(quantity);
            order.addItem(new OrderItem(product.getId(), product.getSlug(), product.getName(), product.primaryImage(),
                    quantity, product.getPrice()));
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
            allFreeShipping &= product.isFreeShipping();
        }
        order.setTotals(subtotal, pricing.shippingFee(subtotal, allFreeShipping));
        Order saved = orders.save(order);

        if (request.saveAddress()) addresses.save(userId, request.shippingAddress(), false);

        events.publishEvent(new OrderPlacedEvent(saved.getReference(), saved.getEmail(), user.getName(), saved.getTotal(),
                saved.getItems().stream().mapToInt(OrderItem::getQuantity).sum(), saved.getPaymentMethod().name()));
        return OrderView.of(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderView> mine(Long userId, int page, int size) {
        return PageResponse.of(orders.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(Math.max(page, 0), clamp(size))), OrderView::of);
    }

    @Transactional(readOnly = true)
    public OrderView get(User requester, String reference) {
        return OrderView.of(owned(requester, orders.findByReference(reference)));
    }

    @Transactional
    @CacheEvict(value = {"productSearch", "productDetail", "productSimilar"}, allEntries = true)
    public OrderView cancel(User requester, String reference) {
        Order order = owned(requester, orders.findLockedByReference(reference));
        if (!order.getStatus().customerCancellable()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order can no longer be cancelled");
        }
        cancelAndRestock(order);
        return OrderView.of(order);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<OrderView> all(OrderStatus status, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), clamp(size));
        var result = status == null ? orders.findAllByOrderByCreatedAtDesc(pageable) : orders.findByStatusOrderByCreatedAtDesc(status, pageable);
        return PageResponse.of(result, OrderView::of);
    }

    @Transactional
    @CacheEvict(value = {"productSearch", "productDetail", "productSimilar"}, allEntries = true)
    public OrderView changeStatus(String reference, OrderStatus next) {
        Order order = orders.findLockedByReference(reference)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getStatus().next().contains(next)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot change an order from " + order.getStatus() + " to " + next);
        }
        if (next == OrderStatus.CANCELLED) cancelAndRestock(order);
        else order.changeStatus(next);
        return OrderView.of(order);
    }

    private void cancelAndRestock(Order order) {
        for (OrderItem item : order.getItems()) {
            products.findLockedById(item.getProductId()).ifPresent(p -> p.release(item.getQuantity()));
        }
        order.changeStatus(OrderStatus.CANCELLED);
    }

    private Order owned(User requester, java.util.Optional<Order> found) {
        Order order = found.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!requester.isAdmin() && !order.getUser().getId().equals(requester.getId())) {
            // Same response as a missing order, so references cannot be probed.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    private static int clamp(int size) {
        return Math.min(Math.max(size, 1), 50);
    }

    private static String newReference() {
        StringBuilder sb = new StringBuilder("HN-");
        for (int i = 0; i < 10; i++) sb.append(REF_CHARS[RANDOM.nextInt(REF_CHARS.length)]);
        return sb.toString();
    }
}
