package store.commongoods.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import store.commongoods.product.Product;
import store.commongoods.product.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.LinkedHashMap;
import org.springframework.context.ApplicationEventPublisher;

@RestController @RequestMapping("/api/orders")
public class OrderController {
    public record ItemRequest(@NotNull Long productId, @Min(1) int quantity) { }
    public record CreateOrderRequest(@Email @NotBlank String email, @NotBlank @Size(max=150) String fullName, @NotBlank @Size(max=500) String deliveryAddress, @NotEmpty List<@Valid ItemRequest> items) { }
    public record OrderView(String reference,String status,String paymentStatus,BigDecimal subtotal) { }
    private final ProductRepository products; private final OrderRepository orders; private final ApplicationEventPublisher events;
    public OrderController(ProductRepository products,OrderRepository orders,ApplicationEventPublisher events){this.products=products;this.orders=orders;this.events=events;}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional public OrderView create(@Valid @RequestBody CreateOrderRequest request){
        if(request.items().size()>30) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Too many different items");
        String reference="CG-"+UUID.randomUUID().toString().replace("-", "").substring(0,12).toUpperCase();
        BigDecimal total=BigDecimal.ZERO;
        Map<Long,Integer> quantities=new LinkedHashMap<>();
        for(ItemRequest item:request.items()) quantities.merge(item.productId(),item.quantity(),Integer::sum);
        for(var entry:quantities.entrySet()) { Product product=products.findLockedById(entry.getKey()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Product not found")); if(product.getInventory()<entry.getValue()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Not enough stock for "+product.getName()); product.reserve(entry.getValue()); total=total.add(product.getPrice().multiply(BigDecimal.valueOf(entry.getValue()))); }
        CustomerOrder saved=orders.save(newOrderWithItems(request,reference,total));
        events.publishEvent(new OrderEvents.OrderPlaced(saved.getReference(),saved.getEmail()));
        return new OrderView(saved.getReference(),saved.getStatus(),saved.getPaymentStatus(),saved.getSubtotal());
    }
    @GetMapping("/{reference}") public OrderView status(@PathVariable String reference){CustomerOrder order=orders.findByReference(reference).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));return new OrderView(order.getReference(),order.getStatus(),order.getPaymentStatus(),order.getSubtotal());}
    @GetMapping public List<OrderView> myOrders(org.springframework.security.core.Authentication auth){if(auth==null||!auth.isAuthenticated())throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);return orders.findTop20ByEmailIgnoreCaseOrderByCreatedAtDesc(auth.getName()).stream().map(o->new OrderView(o.getReference(),o.getStatus(),o.getPaymentStatus(),o.getSubtotal())).toList();}
    private CustomerOrder newOrderWithItems(CreateOrderRequest r,String reference,BigDecimal total) { CustomerOrder order=new CustomerOrder(reference,r.email().trim().toLowerCase(),r.fullName().trim(),r.deliveryAddress().trim(),total); for(ItemRequest item:r.items()){Product p=products.findById(item.productId()).orElseThrow();order.addItem(new OrderLine(p.getId(),p.getName(),item.quantity(),p.getPrice()));}return order; }
}
