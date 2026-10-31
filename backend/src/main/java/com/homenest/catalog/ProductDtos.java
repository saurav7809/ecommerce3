package com.homenest.catalog;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class ProductDtos {
    private ProductDtos() { }

    /** Card-sized product data used in grids, carousels and the cart. */
    public record ProductSummary(
            Long id, String slug, String name, String brand, String category, String categorySlug,
            BigDecimal price, BigDecimal compareAtPrice, int discountPercent,
            String imageUrl, String hoverImageUrl, double rating, int reviewCount,
            boolean freeShipping, boolean inStock, int stock, String color, boolean featured) implements Serializable {

        public static ProductSummary of(Product p) {
            List<String> images = p.getImages();
            return new ProductSummary(p.getId(), p.getSlug(), p.getName(), p.getBrand(),
                    p.getCategory().getName(), p.getCategory().getSlug(),
                    p.getPrice(), p.onSale() ? p.getCompareAtPrice() : null, p.discountPercent(),
                    p.primaryImage(), images.size() > 1 ? images.get(1) : null,
                    p.getAverageRating(), p.getReviewCount(), p.isFreeShipping(), p.getStock() > 0, p.getStock(),
                    p.getColor(), p.isFeatured());
        }
    }

    public record Dimensions(Double widthCm, Double depthCm, Double heightCm, Double weightKg) implements Serializable { }

    public record ProductDetail(
            Long id, String sku, String slug, String name, String brand, String description,
            String category, String categorySlug, List<CategoryService.Crumb> breadcrumbs,
            BigDecimal price, BigDecimal compareAtPrice, int discountPercent,
            List<String> images, String room, String style, String color, String material,
            Dimensions dimensions, boolean assemblyRequired, boolean freeShipping,
            int stock, boolean inStock, double rating, int reviewCount, boolean featured,
            String soldBy, Instant updatedAt) implements Serializable { }

    public record FacetValue(String value, long count) implements Serializable { }

    public record ProductFacets(
            long total, BigDecimal minPrice, BigDecimal maxPrice,
            List<FacetValue> brands, List<FacetValue> colors, List<FacetValue> materials,
            List<FacetValue> styles, List<FacetValue> rooms) implements Serializable { }

    /** Full product view for the admin / seller dashboard, including inactive products. */
    public record ManagedProduct(
            Long id, String sku, String slug, String name, String brand, String description,
            Long categoryId, String category, String room, String style, String color, String material,
            BigDecimal price, BigDecimal compareAtPrice, int stock,
            Double widthCm, Double depthCm, Double heightCm, Double weightKg,
            boolean assemblyRequired, boolean freeShipping, boolean featured, boolean active,
            List<String> images, double rating, int reviewCount, String sellerEmail, Instant updatedAt) {

        public static ManagedProduct of(Product p) {
            return new ManagedProduct(p.getId(), p.getSku(), p.getSlug(), p.getName(), p.getBrand(), p.getDescription(),
                    p.getCategory().getId(), p.getCategory().getName(), p.getRoom(), p.getStyle(), p.getColor(), p.getMaterial(),
                    p.getPrice(), p.getCompareAtPrice(), p.getStock(),
                    p.getWidthCm(), p.getDepthCm(), p.getHeightCm(), p.getWeightKg(),
                    p.isAssemblyRequired(), p.isFreeShipping(), p.isFeatured(), p.isActive(),
                    List.copyOf(p.getImages()), p.getAverageRating(), p.getReviewCount(),
                    p.getSeller() == null ? null : p.getSeller().getEmail(), p.getUpdatedAt());
        }
    }
}
