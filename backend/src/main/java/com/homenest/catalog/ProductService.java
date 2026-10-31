package com.homenest.catalog;

import com.homenest.catalog.ProductDtos.*;
import com.homenest.common.PageResponse;
import com.homenest.search.ProductSearchIndex;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ProductService {
    private static final int SEARCH_ENGINE_LIMIT = 300;

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final CategoryService categoryService;
    private final ProductSearchIndex searchIndex;
    private final EntityManager em;

    public ProductService(ProductRepository products, CategoryRepository categories, CategoryService categoryService,
                          ProductSearchIndex searchIndex, EntityManager em) {
        this.products = products;
        this.categories = categories;
        this.categoryService = categoryService;
        this.searchIndex = searchIndex;
        this.em = em;
    }

    @Cacheable(value = "productSearch", key = "#query")
    public PageResponse<ProductSummary> search(ProductQuery query) {
        List<Long> categoryIds = categoryIds(query.category());
        if (categoryIds != null && categoryIds.isEmpty()) return new PageResponse<>(List.of(), query.page(), query.size(), 0, 0);

        List<Long> rankedIds = rankedIds(query);
        Specification<Product> spec = ProductSpecifications.of(query, categoryIds, rankedIds, true);

        if (rankedIds != null && "relevance".equals(query.sort())) {
            // Keep the search engine's relevance order, then page in memory (result set is capped).
            Map<Long, Integer> rank = new HashMap<>();
            for (int i = 0; i < rankedIds.size(); i++) rank.put(rankedIds.get(i), i);
            List<ProductSummary> ordered = products.findAll(spec).stream()
                    .sorted(Comparator.comparingInt(p -> rank.getOrDefault(p.getId(), Integer.MAX_VALUE)))
                    .map(ProductSummary::of).toList();
            return PageResponse.of(ordered, query.page(), query.size());
        }

        var page = products.findAll(spec, PageRequest.of(query.page(), query.size(), sortFor(query.sort())));
        return PageResponse.of(page, ProductSummary::of);
    }

    @Cacheable(value = "productFacets", key = "#query.facetScope()")
    public ProductFacets facets(ProductQuery query) {
        List<Long> categoryIds = categoryIds(query.category());
        if (categoryIds != null && categoryIds.isEmpty()) {
            return new ProductFacets(0, null, null, List.of(), List.of(), List.of(), List.of(), List.of());
        }
        Specification<Product> spec = ProductSpecifications.of(query, categoryIds, rankedIds(query), false);

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> totals = cb.createTupleQuery();
        Root<Product> root = totals.from(Product.class);
        totals.multiselect(cb.count(root), cb.min(root.get("price")), cb.max(root.get("price")))
                .where(spec.toPredicate(root, totals, cb));
        Tuple t = em.createQuery(totals).getSingleResult();

        return new ProductFacets(t.get(0, Long.class), t.get(1, BigDecimal.class), t.get(2, BigDecimal.class),
                facet(spec, "brand"), facet(spec, "color"), facet(spec, "material"), facet(spec, "style"), facet(spec, "room"));
    }

    @Cacheable(value = "productDetail", key = "#slug")
    public ProductDetail detail(String slug) {
        Product p = products.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        var crumbs = categoryService.detail(p.getCategory().getSlug()).breadcrumbs();
        return new ProductDetail(p.getId(), p.getSku(), p.getSlug(), p.getName(), p.getBrand(), p.getDescription(),
                p.getCategory().getName(), p.getCategory().getSlug(), crumbs,
                p.getPrice(), p.onSale() ? p.getCompareAtPrice() : null, p.discountPercent(),
                List.copyOf(p.getImages()), p.getRoom(), p.getStyle(), p.getColor(), p.getMaterial(),
                new Dimensions(p.getWidthCm(), p.getDepthCm(), p.getHeightCm(), p.getWeightKg()),
                p.isAssemblyRequired(), p.isFreeShipping(), p.getStock(), p.getStock() > 0,
                p.getAverageRating(), p.getReviewCount(), p.isFeatured(),
                p.getSeller() == null ? "HomeNest" : p.getSeller().getName(), p.getUpdatedAt());
    }

    @Cacheable(value = "productSimilar", key = "#slug")
    public List<ProductSummary> similar(String slug) {
        Product p = products.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return products.findTop12ByCategoryIdAndActiveTrueAndIdNotOrderByAverageRatingDescReviewCountDesc(
                p.getCategory().getId(), p.getId()).stream().map(ProductSummary::of).toList();
    }

    /** Null means "all categories"; an empty list means the slug does not exist. */
    private List<Long> categoryIds(String slug) {
        return slug == null ? null : categories.findIdsInTree(slug);
    }

    /** Ids from Elasticsearch when it is enabled and reachable; null means "use database text search". */
    private List<Long> rankedIds(ProductQuery query) {
        if (query.q() == null) return null;
        return searchIndex.search(query.q(), SEARCH_ENGINE_LIMIT).orElse(null);
    }

    private List<FacetValue> facet(Specification<Product> spec, String attribute) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Product> root = cq.from(Product.class);
        Path<String> path = root.get(attribute);
        Expression<Long> count = cb.count(root);
        cq.multiselect(path, count)
                .where(spec.toPredicate(root, cq, cb), cb.isNotNull(path))
                .groupBy(path)
                .orderBy(cb.desc(count), cb.asc(path));
        return em.createQuery(cq).setMaxResults(30).getResultList().stream()
                .map(row -> new FacetValue(row.get(0, String.class), row.get(1, Long.class)))
                .toList();
    }

    private static Sort sortFor(String sort) {
        return switch (sort) {
            case "price_asc" -> Sort.by("price").ascending().and(Sort.by("id"));
            case "price_desc" -> Sort.by("price").descending().and(Sort.by("id"));
            case "rating" -> Sort.by(Sort.Order.desc("averageRating"), Sort.Order.desc("reviewCount"), Sort.Order.asc("id"));
            case "newest" -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
            case "discount" -> Sort.unsorted(); // ordered inside the specification
            default -> Sort.by(Sort.Order.desc("featured"), Sort.Order.desc("averageRating"), Sort.Order.desc("reviewCount"), Sort.Order.asc("id"));
        };
    }
}
