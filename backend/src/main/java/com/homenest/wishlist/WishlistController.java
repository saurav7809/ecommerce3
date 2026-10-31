package com.homenest.wishlist;

import com.homenest.catalog.ProductDtos.ProductSummary;
import com.homenest.catalog.ProductRepository;
import com.homenest.user.User;
import com.homenest.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** "Favorites": products a signed-in shopper has saved for later. */
@RestController
@RequestMapping("/api/wishlist")
@Tag(name = "Favorites")
public class WishlistController {
    private static final int MAX_ITEMS = 200;

    private final WishlistRepository wishlist;
    private final ProductRepository products;
    private final UserRepository users;

    public WishlistController(WishlistRepository wishlist, ProductRepository products, UserRepository users) {
        this.wishlist = wishlist;
        this.products = products;
        this.users = users;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<ProductSummary> list(@AuthenticationPrincipal User user) {
        return wishlist.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(WishlistItem::getProduct).filter(p -> p.isActive()).map(ProductSummary::of).toList();
    }

    @PutMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    @Operation(summary = "Add a product to favorites (idempotent)")
    public void add(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        if (wishlist.existsByUserIdAndProductId(user.getId(), productId)) return;
        var product = products.findById(productId).filter(p -> p.isActive())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (wishlist.countByUserId(user.getId()) >= MAX_ITEMS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Your favorites list is full");
        }
        wishlist.save(new WishlistItem(users.getReferenceById(user.getId()), product));
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void remove(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        wishlist.deleteByUserIdAndProductId(user.getId(), productId);
    }
}
