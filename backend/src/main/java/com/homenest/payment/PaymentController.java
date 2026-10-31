package com.homenest.payment;

import com.homenest.config.AppProperties;
import com.homenest.order.Order;
import com.homenest.order.OrderEnums.OrderStatus;
import com.homenest.order.OrderEnums.PaymentMethod;
import com.homenest.order.OrderEnums.PaymentStatus;
import com.homenest.order.OrderRepository;
import com.homenest.order.OrderView;
import com.homenest.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

/**
 * Razorpay Test Mode: the server creates the Razorpay order (amount from the database),
 * the browser opens Razorpay Checkout, and the server verifies the HMAC-SHA256 signature.
 */
@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments")
public class PaymentController {
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    public record PaymentConfig(boolean razorpayEnabled, String razorpayKeyId, boolean codEnabled, String currency) { }

    public record StartRequest(@NotBlank @Size(max = 32) String reference) { }

    public record RazorpayOrder(String razorpayOrderId, long amount, String currency, String keyId,
                                String reference, String customerName, String email, String phone) { }

    public record VerifyRequest(@NotBlank @Size(max = 32) String reference, @NotBlank @Size(max = 80) String razorpayOrderId,
                                @NotBlank @Size(max = 80) String razorpayPaymentId, @NotBlank @Size(max = 256) String razorpaySignature) { }

    public record FailureRequest(@NotBlank @Size(max = 32) String reference) { }

    private final OrderRepository orders;
    private final AppProperties.Razorpay razorpay;
    private final String currency;
    private final RestClient client;

    public PaymentController(OrderRepository orders, AppProperties properties, RestClient.Builder builder) {
        this.orders = orders;
        this.razorpay = properties.razorpay();
        this.currency = properties.shipping().currency();
        this.client = builder.baseUrl("https://api.razorpay.com/v1").build();
    }

    @GetMapping("/config")
    @Operation(summary = "Which payment methods are available (the Razorpay key id is public)")
    public PaymentConfig config() {
        return new PaymentConfig(razorpay.configured(), razorpay.configured() ? razorpay.keyId() : null, true, currency);
    }

    @PostMapping("/razorpay/order")
    @Transactional
    @Operation(summary = "Create a Razorpay order for one of your unpaid orders")
    public RazorpayOrder createRazorpayOrder(@AuthenticationPrincipal User user, @Valid @RequestBody StartRequest request) {
        requireConfigured();
        Order order = payable(user, request.reference());
        long amount = order.getTotal().movePointRight(2).longValueExact();

        if (order.getRazorpayOrderId() == null) {
            Map<?, ?> created;
            try {
                created = client.post().uri("/orders")
                        .headers(h -> h.setBasicAuth(razorpay.keyId(), razorpay.keySecret()))
                        .body(Map.of("amount", amount, "currency", currency, "receipt", order.getReference()))
                        .retrieve().body(Map.class);
            } catch (RestClientException e) {
                log.warn("Razorpay order creation failed for {}: {}", order.getReference(), e.getMessage());
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not reach the payment provider. Please try again.");
            }
            if (created == null || created.get("id") == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payment provider did not return an order");
            }
            order.setRazorpayOrderId(created.get("id").toString());
        }
        var address = order.getShippingAddress();
        return new RazorpayOrder(order.getRazorpayOrderId(), amount, currency, razorpay.keyId(), order.getReference(),
                address.getFullName(), order.getEmail(), address.getPhone());
    }

    @PostMapping("/razorpay/verify")
    @Transactional
    @Operation(summary = "Verify the Razorpay payment signature and confirm the order")
    public OrderView verify(@AuthenticationPrincipal User user, @Valid @RequestBody VerifyRequest request) {
        requireConfigured();
        Order order = owned(user, request.reference());
        if (order.getPaymentStatus() == PaymentStatus.PAID) return OrderView.of(order);
        if (order.getRazorpayOrderId() == null || !order.getRazorpayOrderId().equals(request.razorpayOrderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment does not match this order");
        }
        String expected = hmacSha256(order.getRazorpayOrderId() + "|" + request.razorpayPaymentId());
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.US_ASCII),
                request.razorpaySignature().getBytes(StandardCharsets.US_ASCII))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment signature is invalid");
        }
        order.markPaid(request.razorpayPaymentId());
        return OrderView.of(order);
    }

    @PostMapping("/razorpay/failed")
    @Transactional
    @Operation(summary = "Record that the shopper's payment attempt failed (the order stays payable)")
    public OrderView failed(@AuthenticationPrincipal User user, @Valid @RequestBody FailureRequest request) {
        Order order = owned(user, request.reference());
        order.markPaymentFailed();
        return OrderView.of(order);
    }

    private Order payable(User user, String reference) {
        Order order = owned(user, reference);
        if (order.getPaymentMethod() != PaymentMethod.RAZORPAY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is paid on delivery");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is already paid");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order was cancelled");
        }
        return order;
    }

    private Order owned(User user, String reference) {
        Order order = orders.findLockedByReference(reference)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    private void requireConfigured() {
        if (!razorpay.configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Razorpay test keys are not configured");
        }
    }

    private String hmacSha256(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpay.keySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not compute payment signature", e);
        }
    }
}
