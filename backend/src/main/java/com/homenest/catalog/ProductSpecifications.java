package com.homenest.catalog;

import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

/** Builds the JPA criteria for catalog browsing and search filters. */
final class ProductSpecifications {
    private ProductSpecifications() { }

    /**
     * @param categoryIds category plus its sub-categories, or null for all categories
     * @param idFilter    ids returned by the search engine, or null to use database text matching
     * @param withFilters false when computing facet counts (only the text query and category apply)
     */
    static Specification<Product> of(ProductQuery query, List<Long> categoryIds, Collection<Long> idFilter, boolean withFilters) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("active")));

            if (categoryIds != null) predicates.add(root.get("category").get("id").in(categoryIds));

            if (idFilter != null) {
                predicates.add(idFilter.isEmpty() ? cb.disjunction() : root.get("id").in(idFilter));
            } else if (query.q() != null) {
                Join<Product, Category> category = root.join("category", JoinType.INNER);
                for (String token : query.q().toLowerCase(Locale.ROOT).split("\\s+")) {
                    if (token.length() < 2) continue;
                    String like = "%" + escape(token) + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("name")), like, '\\'),
                            cb.like(cb.lower(root.get("brand")), like, '\\'),
                            cb.like(cb.lower(root.get("description")), like, '\\'),
                            cb.like(cb.lower(root.get("style")), like, '\\'),
                            cb.like(cb.lower(root.get("room")), like, '\\'),
                            cb.like(cb.lower(root.get("color")), like, '\\'),
                            cb.like(cb.lower(root.get("material")), like, '\\'),
                            cb.like(cb.lower(category.get("name")), like, '\\')));
                }
            }

            if (withFilters) {
                in(predicates, cb, root.get("brand"), query.brand());
                in(predicates, cb, root.get("color"), query.color());
                in(predicates, cb, root.get("material"), query.material());
                in(predicates, cb, root.get("style"), query.style());
                in(predicates, cb, root.get("room"), query.room());
                if (query.minPrice() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), query.minPrice()));
                if (query.maxPrice() != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), query.maxPrice()));
                if (query.minRating() != null) predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), query.minRating()));
                if (Boolean.TRUE.equals(query.freeShipping())) predicates.add(cb.isTrue(root.get("freeShipping")));
                if (Boolean.TRUE.equals(query.inStock())) predicates.add(cb.greaterThan(root.get("stock"), 0));
                if (Boolean.TRUE.equals(query.featured())) predicates.add(cb.isTrue(root.get("featured")));
                if (Boolean.TRUE.equals(query.onSale())) {
                    predicates.add(cb.isNotNull(root.get("compareAtPrice")));
                    predicates.add(cb.greaterThan(root.get("compareAtPrice"), root.<BigDecimal>get("price")));
                }
            }

            // "Biggest savings" cannot be expressed as a Spring Data Sort, so it is ordered here.
            // Count queries are skipped: ORDER BY is not allowed alongside the aggregate.
            if ("discount".equals(query.sort()) && cq != null && !Long.class.equals(cq.getResultType())) {
                Expression<BigDecimal> compareAt = root.get("compareAtPrice");
                Expression<BigDecimal> price = root.get("price");
                Expression<Number> ratio = cb.quot(cb.diff(compareAt, price), compareAt);
                cq.orderBy(cb.desc(cb.coalesce(ratio, 0)), cb.desc(root.get("id")));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static void in(List<Predicate> predicates, CriteriaBuilder cb, Path<String> path, List<String> values) {
        if (values == null || values.isEmpty()) return;
        predicates.add(cb.lower(path).in(values.stream().map(v -> v.toLowerCase(Locale.ROOT)).toList()));
    }

    private static String escape(String token) {
        return token.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
