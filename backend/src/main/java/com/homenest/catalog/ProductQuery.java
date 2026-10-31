package com.homenest.catalog;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

/**
 * Browse/search parameters. Bound from query strings such as
 * {@code ?category=sofas&color=Green&color=Grey&minPrice=10000&sort=price_asc&page=0}.
 */
public record ProductQuery(
        String q,
        String category,
        List<String> brand,
        List<String> color,
        List<String> material,
        List<String> style,
        List<String> room,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Double minRating,
        Boolean freeShipping,
        Boolean inStock,
        Boolean onSale,
        Boolean featured,
        String sort,
        Integer page,
        Integer size) implements Serializable {

    public static final int MAX_PAGE_SIZE = 60;

    public ProductQuery {
        q = blankToNull(q);
        category = blankToNull(category);
        brand = clean(brand);
        color = clean(color);
        material = clean(material);
        style = clean(style);
        room = clean(room);
        sort = blankToNull(sort) == null ? (q == null ? "recommended" : "relevance") : sort.trim().toLowerCase();
        page = page == null || page < 0 ? 0 : page;
        size = size == null || size < 1 ? 24 : Math.min(size, MAX_PAGE_SIZE);
    }

    public static ProductQuery simple(String sort, int size, Boolean featured, Boolean onSale) {
        return new ProductQuery(null, null, null, null, null, null, null, null, null, null, null, null, onSale, featured, sort, 0, size);
    }

    /** The facet counts only depend on the text query and category, not on the selected filters. */
    public ProductQuery facetScope() {
        return new ProductQuery(q, category, null, null, null, null, null, null, null, null, null, null, null, null, null, 0, 1);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static List<String> clean(List<String> values) {
        if (values == null) return List.of();
        return values.stream().filter(v -> v != null && !v.isBlank()).map(String::trim).distinct().sorted().toList();
    }
}
