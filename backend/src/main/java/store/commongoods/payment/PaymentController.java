package store.commongoods.payment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import store.commongoods.order.CustomerOrder;
import store.commongoods.order.OrderRepository;
import store.commongoods.product.ProductRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@RestController @RequestMapping("/api/payments/razorpay")
public class PaymentController {
    public record StartRequest(@NotBlank String reference) { }
    public record VerifyRequest(@NotBlank String reference,@NotBlank String razorpayOrderId,@NotBlank String razorpayPaymentId,@NotBlank String razorpaySignature) { }
    public record PaymentOrder(String id,long amount,String currency,String keyId) { }
    public record PaymentResult(String reference,String status,String paymentStatus) { }
    private final OrderRepository orders; private final ProductRepository products; private final RestClient rest;
    private final String keyId; private final String keySecret;
    public PaymentController(OrderRepository orders,ProductRepository products,RestClient.Builder builder,@Value("${app.razorpay.key-id}") String keyId,@Value("${app.razorpay.key-secret}") String keySecret) { this.orders=orders;this.products=products;this.rest=builder.baseUrl("https://api.razorpay.com/v1").build();this.keyId=keyId;this.keySecret=keySecret; }

    @PostMapping("/order") @Transactional public PaymentOrder createPaymentOrder(@Valid @RequestBody StartRequest request) {
        requireCredentials(); CustomerOrder order=orders.findByReference(request.reference()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Order not found"));
        if("CAPTURED".equals(order.getPaymentStatus())) throw new ResponseStatusException(HttpStatus.CONFLICT,"This order is already paid");
        long amount=order.getSubtotal().movePointRight(2).longValueExact();
        @SuppressWarnings("unchecked") Map<String,Object> created=rest.post().uri("/orders").headers(h->h.setBasicAuth(keyId,keySecret)).body(Map.of("amount",amount,"currency","INR","receipt",order.getReference())).retrieve().body(Map.class);
        if(created==null||created.get("id")==null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Payment provider did not return an order");
        String providerOrderId=created.get("id").toString(); order.setRazorpayOrderId(providerOrderId); orders.save(order);
        return new PaymentOrder(providerOrderId,amount,"INR",keyId);
    }

    @PostMapping("/verify") @Transactional public PaymentResult verify(@Valid @RequestBody VerifyRequest request) {
        requireCredentials(); CustomerOrder order=orders.findByReference(request.reference()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Order not found"));
        if(order.getRazorpayOrderId()==null||!order.getRazorpayOrderId().equals(request.razorpayOrderId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment does not match this order");
        String expected=signature(order.getRazorpayOrderId()+"|"+request.razorpayPaymentId());
        if(!MessageDigest.isEqual(expected.getBytes(StandardCharsets.US_ASCII),request.razorpaySignature().getBytes(StandardCharsets.US_ASCII))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment signature is invalid");
        if(!"CAPTURED".equals(order.getPaymentStatus())) {
            for(var line:order.getItems()) { var product=products.findLockedById(line.getProductId()).orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"A product in this order is unavailable")); if(product.getInventory()<line.getQuantity()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Inventory changed during payment. Contact support for a refund."); product.reserve(line.getQuantity()); }
            order.markPaid(); orders.save(order);
        }
        return new PaymentResult(order.getReference(),order.getStatus(),order.getPaymentStatus());
    }
    private void requireCredentials(){if(keyId.isBlank()||keySecret.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Razorpay test keys are not configured");}
    private String signature(String payload){try{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException("Could not verify payment signature",e);}}
}
