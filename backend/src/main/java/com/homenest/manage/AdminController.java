package com.homenest.manage;

import com.homenest.catalog.ProductRepository;
import com.homenest.common.PageResponse;
import com.homenest.order.OrderEnums.OrderStatus;
import com.homenest.order.OrderRepository;
import com.homenest.order.OrderService;
import com.homenest.order.OrderView;
import com.homenest.user.Role;
import com.homenest.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin")
public class AdminController {

    public record Stats(BigDecimal revenue, long orders, long activeProducts, long lowStockProducts,
                        long customers, long sellers, Map<String, Long> ordersByStatus, List<OrderView> recentOrders) { }

    public record StatusChange(@NotNull OrderStatus status) { }

    private final OrderRepository orders;
    private final OrderService orderService;
    private final ProductRepository products;
    private final UserRepository users;

    public AdminController(OrderRepository orders, OrderService orderService, ProductRepository products, UserRepository users) {
        this.orders = orders;
        this.orderService = orderService;
        this.products = products;
        this.users = users;
    }

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    @Operation(summary = "Dashboard numbers")
    public Stats stats() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) byStatus.put(s.name(), 0L);
        for (Object[] row : orders.countByStatus()) byStatus.put(((OrderStatus) row[0]).name(), ((Number) row[1]).longValue());
        List<OrderView> recent = orders.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5)).map(OrderView::of).getContent();
        return new Stats(orders.revenue(), orders.countByStatusNot(OrderStatus.CANCELLED), products.countByActiveTrue(),
                products.countByActiveTrueAndStockLessThan(5), users.countByRole(Role.CUSTOMER), users.countByRole(Role.SELLER),
                byStatus, recent);
    }

    @GetMapping("/orders")
    public PageResponse<OrderView> orders(@RequestParam(required = false) OrderStatus status,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return orderService.all(status, page, size);
    }

    @PatchMapping("/orders/{reference}/status")
    @Operation(summary = "Move an order through fulfilment (cancelling restocks the items)")
    public OrderView changeStatus(@PathVariable String reference, @Valid @RequestBody StatusChange change) {
        return orderService.changeStatus(reference, change.status());
    }
}
