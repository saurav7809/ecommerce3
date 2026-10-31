package com.homenest.search;

import com.homenest.catalog.Product;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** Used when app.search.elasticsearch.enabled=false: search runs as SQL against PostgreSQL. */
@Component
@ConditionalOnProperty(prefix = "app.search.elasticsearch", name = "enabled", havingValue = "false", matchIfMissing = true)
public class DatabaseOnlySearchIndex implements ProductSearchIndex {
    @Override public Optional<List<Long>> search(String query, int limit) { return Optional.empty(); }
    @Override public void index(Product product) { }
    @Override public void indexAll(Collection<Product> products) { }
    @Override public void remove(Long productId) { }
    @Override public boolean enabled() { return false; }
}
