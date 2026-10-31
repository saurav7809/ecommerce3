package com.homenest.order;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart")
public class CartController {
    private final PricingService pricing;

    public CartController(PricingService pricing) {
        this.pricing = pricing;
    }

    @PostMapping("/quote")
    @Operation(summary = "Price a cart with current catalog prices, stock and shipping")
    public PricingService.Quote quote(@Valid @RequestBody PricingService.QuoteRequest request) {
        return pricing.quote(request.items());
    }
}
