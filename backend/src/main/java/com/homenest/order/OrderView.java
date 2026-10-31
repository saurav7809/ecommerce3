package com.homenest.order;

import com.homenest.common.AddressDetails;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderView(
        String reference, String status, String paymentStatus, String paymentMethod,
        BigDecimal subtotal, BigDecimal shippingFee, BigDecimal total, int itemCount,
        String email, AddressDetails.View shippingAddress, List<Item> items,
        Instant createdAt, List<String> allowedNextStatuses, boolean cancellable) {

    public record Item(Long productId, String slug, String name, String imageUrl, BigDecimal unitPrice, int quantity,
                       BigDecimal lineTotal) { }

    public static OrderView of(Order o) {
        List<Item> items = o.getItems().stream().map(i -> new Item(i.getProductId(), i.getProductSlug(), i.getProductName(),
                i.getImageUrl(), i.getUnitPrice(), i.getQuantity(), i.getLineTotal())).toList();
        return new OrderView(o.getReference(), o.getStatus().name(), o.getPaymentStatus().name(), o.getPaymentMethod().name(),
                o.getSubtotal(), o.getShippingFee(), o.getTotal(), items.stream().mapToInt(Item::quantity).sum(),
                o.getEmail(), o.getShippingAddress().view(), items, o.getCreatedAt(),
                o.getStatus().next().stream().map(Enum::name).sorted().toList(), o.getStatus().customerCancellable());
    }
}
