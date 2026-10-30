package store.commongoods.product;

import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.Cacheable;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository products;
    public ProductController(ProductRepository products) { this.products = products; }
    @GetMapping @Cacheable(value="products", key="(#category == null ? '' : #category) + ':' + (#query == null ? '' : #query)") public List<Product> list(@RequestParam(required = false) String category, @RequestParam(required = false, name = "q") String query) { return products.search(blankToNull(category), blankToNull(query)); }
    @GetMapping("/{id}") public Product get(@PathVariable Long id) { return products.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND)); }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
