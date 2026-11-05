package com.homenest.catalog;

import com.homenest.catalog.ProductDtos.ProductSummary;
import com.homenest.user.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService recommendations;

    public RecommendationController(RecommendationService recommendations) {
        this.recommendations = recommendations;
    }

    @GetMapping
    public List<ProductSummary> recommend(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) List<Long> viewedIds,
            @RequestParam(required = false) List<Long> excludeIds,
            @RequestParam(defaultValue = "8") int limit) {
        return recommendations.recommend(user, viewedIds, excludeIds, limit);
    }

    @GetMapping("/frequently-bought-together")
    public List<ProductSummary> frequentlyBoughtTogether(
            @RequestParam long productId,
            @RequestParam(defaultValue = "4") int limit) {
        return recommendations.frequentlyBoughtTogether(productId, limit);
    }
}