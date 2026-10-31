package com.homenest.order;

import com.homenest.common.PageResponse;
import com.homenest.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders")
public class OrderController {
    private final OrderService orders;

    public OrderController(OrderService orders) {
        this.orders = orders;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Checkout: create an order from the cart (prices and stock are validated on the server)")
    public OrderView place(@AuthenticationPrincipal User user, @Valid @RequestBody OrderService.CheckoutRequest request) {
        return orders.place(user.getId(), request);
    }

    @GetMapping
    @Operation(summary = "Order history of the signed-in customer")
    public PageResponse<OrderView> mine(@AuthenticationPrincipal User user,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size) {
        return orders.mine(user.getId(), page, size);
    }

    @GetMapping("/{reference}")
    public OrderView get(@AuthenticationPrincipal User user, @PathVariable String reference) {
        return orders.get(user, reference);
    }

    @PostMapping("/{reference}/cancel")
    @Operation(summary = "Cancel an order that has not shipped; reserved stock is released")
    public OrderView cancel(@AuthenticationPrincipal User user, @PathVariable String reference) {
        return orders.cancel(user, reference);
    }
}
