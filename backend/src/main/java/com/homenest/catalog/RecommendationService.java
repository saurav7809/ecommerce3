package com.homenest.catalog;

import com.homenest.catalog.ProductDtos.ProductSummary;
import com.homenest.order.OrderRepository;
import com.homenest.order.OrderEnums.OrderStatus;
import com.homenest.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class RecommendationService {
    private static final List<OrderStatus> EXCLUDED_ORDER_STATUSES =
            List.of(OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT);

    private final ProductRepository products;
    private final OrderRepository orders;

    public RecommendationService(ProductRepository products, OrderRepository orders) {
        this.products = products;
        this.orders = orders;
    }

    public List<ProductSummary> recommend(User user, List<Long> viewedIds, List<Long> excludedIds, int requestedLimit) {
        int limit = Math.max(1, Math.min(requestedLimit, 12));
        LinkedHashSet<Long> viewed = cleanIds(viewedIds, 12);
        LinkedHashSet<Long> purchased = user == null ? new LinkedHashSet<>()
                : cleanIds(orders.findPurchasedProductIds(user.getId(), EXCLUDED_ORDER_STATUSES), 24);
        LinkedHashSet<Long> seedIds = new LinkedHashSet<>(viewed);
        seedIds.addAll(purchased);

        Map<Long, Double> seedWeights = new HashMap<>();
        int recency = 0;
        for (Long id : viewed) seedWeights.put(id, Math.max(0.8, 1.5 - recency++ * 0.05));
        purchased.forEach(id -> seedWeights.merge(id, 2.5, Math::max));

        Map<Long, Product> seedProducts = new HashMap<>();
        products.findAllById(seedIds).stream()
                .filter(Product::isActive)
                .forEach(product -> seedProducts.put(product.getId(), product));

        Map<Long, Long> coPurchaseCounts = coPurchaseCounts(seedIds);
        Set<Long> excluded = cleanIds(excludedIds, 24);
        Map<Long, Double> scores = new HashMap<>();
        List<Product> activeProducts = products.findAllActive();

        for (Product candidate : activeProducts) {
            if (excluded.contains(candidate.getId())) continue;
            double score = popularity(candidate);
            for (Map.Entry<Long, Product> seed : seedProducts.entrySet()) {
                score += contentSimilarity(candidate, seed.getValue()) * seedWeights.getOrDefault(seed.getKey(), 1.0);
            }
            long coPurchases = coPurchaseCounts.getOrDefault(candidate.getId(), 0L);
            score += Math.log1p(coPurchases) * 2.5;
            scores.put(candidate.getId(), score);
        }

        return activeProducts.stream()
                .filter(product -> scores.containsKey(product.getId()))
                .sorted(Comparator.comparingDouble((Product product) -> scores.get(product.getId())).reversed()
                        .thenComparing(Comparator.comparingDouble(Product::getAverageRating).reversed())
                        .thenComparing(Product::getId))
                .limit(limit)
                .map(ProductSummary::of)
                .toList();
    }

    public List<ProductSummary> frequentlyBoughtTogether(long productId, int requestedLimit) {
        int limit = Math.max(1, Math.min(requestedLimit, 12));
        List<Object[]> rows = orders.findFrequentlyBoughtTogether(productId, EXCLUDED_ORDER_STATUSES);
        Map<Long, Integer> rank = new HashMap<>();
        for (Object[] row : rows) rank.put((Long) row[0], rank.size());
        if (rank.isEmpty()) return List.of();

        return products.findAllById(rank.keySet()).stream()
                .filter(Product::isActive)
                .sorted(Comparator.comparingInt(product -> rank.get(product.getId())))
                .limit(limit)
                .map(ProductSummary::of)
                .toList();
    }

    private Map<Long, Long> coPurchaseCounts(Set<Long> seedIds) {
        if (seedIds.isEmpty()) return Map.of();
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : orders.findCoPurchasedProductScores(seedIds, EXCLUDED_ORDER_STATUSES)) {
            counts.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return counts;
    }

    private static LinkedHashSet<Long> cleanIds(Collection<Long> ids, int maxSize) {
        LinkedHashSet<Long> result = new LinkedHashSet<>();
        if (ids != null) {
            for (Long id : ids) {
                if (id != null && id > 0) result.add(id);
                if (result.size() == maxSize) break;
            }
        }
        return result;
    }

    private static double popularity(Product product) {
        return product.getAverageRating() * 0.08 + Math.log1p(product.getReviewCount()) * 0.08
                + (product.isFeatured() ? 0.1 : 0);
    }

    private static double contentSimilarity(Product candidate, Product seed) {
        double score = 0;
        if (candidate.getCategory().getId().equals(seed.getCategory().getId())) score += 2.5;
        score += match(candidate.getStyle(), seed.getStyle(), 1.8);
        score += match(candidate.getRoom(), seed.getRoom(), 1.4);
        score += match(candidate.getMaterial(), seed.getMaterial(), 1.2);
        score += match(candidate.getColor(), seed.getColor(), 0.7);
        score += match(candidate.getBrand(), seed.getBrand(), 0.4);
        return score;
    }

    private static double match(String left, String right, double weight) {
        return left != null && right != null && left.equalsIgnoreCase(right) ? weight : 0;
    }
}