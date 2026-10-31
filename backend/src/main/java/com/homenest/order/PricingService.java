package com.homenest.order;

import com.homenest.catalog.ProductDtos.ProductSummary;
import com.homenest.catalog.ProductRepository;
import com.homenest.config.AppProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/** Single source of truth for cart totals and shipping, used by the cart page and by checkout. */
@Service
public class PricingService {
    public static final int MAX_LINES = 50;
    public static final int MAX_QUANTITY = 20;

    public record CartItem(@NotNull Long productId, @Min(1) @Max(MAX_QUANTITY) int quantity) { }

    public record QuoteRequest(@NotEmpty @Size(max = MAX_LINES) List<@Valid CartItem> items) { }

    public record QuoteLine(ProductSummary product, int quantity, BigDecimal lineTotal, boolean available, String message) { }

    public record Quote(List<QuoteLine> lines, BigDecimal subtotal, BigDecimal savings, BigDecimal shipping,
                        BigDecimal total, BigDecimal freeShippingThreshold, BigDecimal amountToFreeShipping,
                        String currency, List<Long> unknownProductIds) { }

    private final ProductRepository products;
    private final AppProperties.Shipping shipping;

    public PricingService(ProductRepository products, AppProperties properties) {
        this.products = products;
        this.shipping = properties.shipping();
    }

    /** Combines duplicate lines and orders them by product id (also the lock order at checkout). */
    public static SortedMap<Long, Integer> merge(List<CartItem> items) {
        SortedMap<Long, Integer> merged = new TreeMap<>();
        for (CartItem item : items) merged.merge(item.productId(), item.quantity(), Integer::sum);
        merged.replaceAll((id, qty) -> Math.min(qty, MAX_QUANTITY));
        return merged;
    }

    @Transactional(readOnly = true)
    public Quote quote(List<CartItem> items) {
        SortedMap<Long, Integer> merged = merge(items);
        var found = new HashMap<Long, com.homenest.catalog.Product>();
        products.findAllById(merged.keySet()).forEach(p -> found.put(p.getId(), p));

        List<QuoteLine> lines = new ArrayList<>();
        List<Long> unknown = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal savings = BigDecimal.ZERO;
        boolean allFreeShipping = true;

        for (var entry : merged.entrySet()) {
            var p = found.get(entry.getKey());
            if (p == null || !p.isActive()) { unknown.add(entry.getKey()); continue; }
            int qty = entry.getValue();
            boolean available = p.getStock() >= qty;
            BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(qty));
            String message = p.getStock() == 0 ? "Out of stock" : available ? null : "Only " + p.getStock() + " left";
            lines.add(new QuoteLine(ProductSummary.of(p), qty, lineTotal, available, message));
            if (!available) continue;
            subtotal = subtotal.add(lineTotal);
            if (p.onSale()) savings = savings.add(p.getCompareAtPrice().subtract(p.getPrice()).multiply(BigDecimal.valueOf(qty)));
            allFreeShipping &= p.isFreeShipping();
        }
        BigDecimal fee = shippingFee(subtotal, allFreeShipping);
        BigDecimal toFree = subtotal.signum() == 0 || fee.signum() == 0 ? BigDecimal.ZERO
                : shipping.freeThreshold().subtract(subtotal).max(BigDecimal.ZERO);
        return new Quote(lines, subtotal, savings, fee, subtotal.add(fee), shipping.freeThreshold(), toFree,
                shipping.currency(), unknown);
    }

    public BigDecimal shippingFee(BigDecimal subtotal, boolean allItemsShipFree) {
        if (subtotal.signum() == 0 || allItemsShipFree || subtotal.compareTo(shipping.freeThreshold()) >= 0) {
            return BigDecimal.ZERO;
        }
        return shipping.flatFee();
    }
}
