package com.homenest.catalog;

import com.homenest.catalog.ProductDtos.ProductDetail;
import com.homenest.catalog.ProductDtos.ProductFacets;
import com.homenest.catalog.ProductDtos.ProductSummary;
import com.homenest.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Catalog")
public class ProductController {
    private final ProductService products;

    public ProductController(ProductService products) {
        this.products = products;
    }

    @GetMapping
    @Operation(summary = "Browse and search products",
            description = "Filters: q, category (slug, includes sub-categories), brand, color, material, style, room (repeatable), "
                    + "minPrice, maxPrice, minRating, freeShipping, inStock, onSale, featured. "
                    + "sort: recommended | relevance | price_asc | price_desc | rating | newest | discount.")
    public PageResponse<ProductSummary> search(@ParameterObject ProductQuery query) {
        return products.search(query);
    }

    @GetMapping("/facets")
    @Operation(summary = "Filter options with counts for the current search text and category")
    public ProductFacets facets(@ParameterObject ProductQuery query) {
        return products.facets(query);
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Product detail page data")
    public ProductDetail detail(@PathVariable String slug) {
        return products.detail(slug);
    }

    @GetMapping("/{slug}/similar")
    @Operation(summary = "Similar products from the same category")
    public List<ProductSummary> similar(@PathVariable String slug) {
        return products.similar(slug);
    }
}
