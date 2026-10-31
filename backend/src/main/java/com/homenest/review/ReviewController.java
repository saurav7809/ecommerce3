package com.homenest.review;

import com.homenest.catalog.Product;
import com.homenest.catalog.ProductRepository;
import com.homenest.common.PageResponse;
import com.homenest.order.OrderRepository;
import com.homenest.user.User;
import com.homenest.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/products/{slug}/reviews")
@Tag(name = "Reviews")
public class ReviewController {

    public record ReviewView(Long id, int rating, String title, String body, String author, boolean verifiedPurchase,
                             Instant createdAt) {
        static ReviewView of(Review r) {
            return of(r, r.getUser().getName());
        }

        static ReviewView of(Review r, String authorName) {
            return new ReviewView(r.getId(), r.getRating(), r.getTitle(), r.getBody(), displayName(authorName),
                    r.isVerifiedPurchase(), r.getCreatedAt());
        }

        /** "Priya Sharma" is shown as "Priya S." to protect reviewer privacy. */
        static String displayName(String name) {
            String trimmed = name.trim();
            int space = trimmed.indexOf(' ');
            return space > 0 && space + 1 < trimmed.length() ? trimmed.substring(0, space + 2) + "." : trimmed;
        }
    }

    public record ReviewSummary(double average, long count, Map<Integer, Long> histogram, PageResponse<ReviewView> reviews) { }

    public record CreateReviewRequest(@Min(1) @Max(5) int rating, @NotBlank @Size(max = 120) String title,
                                      @NotBlank @Size(max = 2000) String body) { }

    private final ReviewRepository reviews;
    private final ProductRepository products;
    private final UserRepository users;
    private final OrderRepository orders;

    public ReviewController(ReviewRepository reviews, ProductRepository products, UserRepository users, OrderRepository orders) {
        this.reviews = reviews;
        this.products = products;
        this.users = users;
        this.orders = orders;
    }

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Rating summary, star histogram and paged reviews")
    public ReviewSummary list(@PathVariable String slug, @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "5") int size) {
        Product product = product(slug);
        Map<Integer, Long> histogram = new LinkedHashMap<>();
        for (int stars = 5; stars >= 1; stars--) histogram.put(stars, 0L);
        for (Object[] row : reviews.histogram(product.getId())) histogram.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        var paged = reviews.findByProductIdOrderByCreatedAtDesc(product.getId(),
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 20)));
        return new ReviewSummary(product.getAverageRating(), product.getReviewCount(), histogram, PageResponse.of(paged, ReviewView::of));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @CacheEvict(value = {"productSearch", "productDetail", "productSimilar"}, allEntries = true)
    @Operation(summary = "Write a review (one per customer per product)")
    public ReviewView create(@AuthenticationPrincipal User user, @PathVariable String slug,
                             @Valid @RequestBody CreateReviewRequest request) {
        Product product = product(slug);
        if (reviews.existsByProductIdAndUserId(product.getId(), user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this product");
        }
        boolean verified = orders.hasPurchased(user.getId(), product.getId());
        Review saved = reviews.saveAndFlush(new Review(product, users.getReferenceById(user.getId()), request.rating(),
                request.title().trim(), request.body().trim(), verified));
        Object[] agg = reviews.aggregate(product.getId()).getFirst();
        product.applyRating(((Number) agg[0]).doubleValue(), ((Number) agg[1]).intValue());
        return ReviewView.of(saved, user.getName());
    }

    private Product product(String slug) {
        return products.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }
}
