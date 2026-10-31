package com.homenest.search;

import com.homenest.catalog.Product;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Full-text product search. When Elasticsearch is disabled or unreachable, {@link #search} returns
 * {@link Optional#empty()} and the catalog falls back to database matching.
 */
public interface ProductSearchIndex {

    /** Product ids ordered by relevance, or empty when the search engine is unavailable. */
    Optional<List<Long>> search(String query, int limit);

    void index(Product product);

    void indexAll(Collection<Product> products);

    void remove(Long productId);

    boolean enabled();
}
