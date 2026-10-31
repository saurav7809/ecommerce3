package com.homenest.manage;

import com.homenest.catalog.Category;
import com.homenest.catalog.CategoryRepository;
import com.homenest.catalog.Product;
import com.homenest.catalog.ProductDtos.ManagedProduct;
import com.homenest.catalog.ProductRepository;
import com.homenest.common.PageResponse;
import com.homenest.common.Slugs;
import com.homenest.search.ProductSearchIndex;
import com.homenest.user.User;
import com.homenest.user.UserRepository;
import jakarta.validation.constraints.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

/** Product management for admins (all products) and marketplace sellers (their own products). */
@Service
public class ManageProductService {

    public record ProductRequest(
            @NotBlank @Size(max = 160) String name,
            @NotBlank @Size(max = 80) String brand,
            @NotBlank @Size(max = 4000) String description,
            @NotNull Long categoryId,
            @Size(max = 40) String room,
            @Size(max = 40) String style,
            @Size(max = 40) String color,
            @Size(max = 60) String material,
            @NotNull @DecimalMin("1.00") @Digits(integer = 10, fraction = 2) BigDecimal price,
            @DecimalMin("1.00") @Digits(integer = 10, fraction = 2) BigDecimal compareAtPrice,
            @Min(0) @Max(100000) int stock,
            @Positive Double widthCm, @Positive Double depthCm, @Positive Double heightCm, @Positive Double weightKg,
            boolean assemblyRequired,
            boolean freeShipping,
            boolean featured,
            Boolean active,
            @NotEmpty @Size(max = 8) List<@NotBlank @Size(max = 500) @Pattern(regexp = "^https://.+", message = "must be an https URL") String> images) { }

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final ProductSearchIndex searchIndex;

    public ManageProductService(ProductRepository products, CategoryRepository categories, UserRepository users,
                                ProductSearchIndex searchIndex) {
        this.products = products;
        this.categories = categories;
        this.users = users;
        this.searchIndex = searchIndex;
    }

    @Transactional(readOnly = true)
    public PageResponse<ManagedProduct> list(User actor, int page, int size) {
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id")));
        var result = actor.isAdmin() ? products.findAllWithCategory(pageable) : products.findBySellerId(actor.getId(), pageable);
        return PageResponse.of(result, ManagedProduct::of);
    }

    @Transactional(readOnly = true)
    public ManagedProduct get(User actor, Long id) {
        return ManagedProduct.of(editable(actor, id));
    }

    @Transactional
    @CacheEvict(value = {"productSearch", "productDetail", "productFacets", "productSimilar"}, allEntries = true)
    public ManagedProduct create(User actor, ProductRequest request) {
        Product product = new Product(newSku(), uniqueSlug(request.name()));
        apply(product, request);
        if (!actor.isAdmin()) product.setSeller(users.getReferenceById(actor.getId()));
        product = products.save(product);
        searchIndex.index(product);
        return ManagedProduct.of(product);
    }

    @Transactional
    @CacheEvict(value = {"productSearch", "productDetail", "productFacets", "productSimilar"}, allEntries = true)
    public ManagedProduct update(User actor, Long id, ProductRequest request) {
        Product product = editable(actor, id);
        if (!product.getName().equals(request.name().trim())) product.setSlug(uniqueSlug(request.name()));
        apply(product, request);
        if (product.isActive()) searchIndex.index(product); else searchIndex.remove(product.getId());
        return ManagedProduct.of(product);
    }

    /** Products referenced by past orders are kept, so "delete" hides the product from the storefront. */
    @Transactional
    @CacheEvict(value = {"productSearch", "productDetail", "productFacets", "productSimilar"}, allEntries = true)
    public void deactivate(User actor, Long id) {
        Product product = editable(actor, id);
        product.setActive(false);
        searchIndex.remove(product.getId());
    }

    private void apply(Product p, ProductRequest r) {
        Category category = categories.findById(r.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
        if (category.getParent() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a sub-category, not a department");
        }
        if (r.compareAtPrice() != null && r.compareAtPrice().compareTo(r.price()) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'was' price must be higher than the selling price");
        }
        p.setName(r.name().trim());
        p.setBrand(r.brand().trim());
        p.setDescription(r.description().trim());
        p.setCategory(category);
        p.setRoom(trimToNull(r.room()));
        p.setStyle(trimToNull(r.style()));
        p.setColor(trimToNull(r.color()));
        p.setMaterial(trimToNull(r.material()));
        p.setPrice(r.price());
        p.setCompareAtPrice(r.compareAtPrice());
        p.setStock(r.stock());
        p.setDimensions(r.widthCm(), r.depthCm(), r.heightCm());
        p.setWeightKg(r.weightKg());
        p.setAssemblyRequired(r.assemblyRequired());
        p.setFreeShipping(r.freeShipping());
        p.setFeatured(r.featured());
        if (r.active() != null) p.setActive(r.active());
        p.setImages(r.images().stream().map(String::trim).toList());
    }

    private Product editable(User actor, Long id) {
        Product product = products.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        boolean owner = product.getSeller() != null && product.getSeller().getId().equals(actor.getId());
        if (!actor.isAdmin() && !owner) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        return product;
    }

    private String uniqueSlug(String name) {
        String base = Slugs.slugify(name);
        if (base.length() > 170) base = base.substring(0, 170);
        String slug = base;
        for (int i = 2; products.existsBySlug(slug); i++) slug = base + "-" + i;
        return slug;
    }

    private String newSku() {
        String sku;
        do {
            sku = "HN-" + Long.toString(ThreadLocalRandom.current().nextLong(36L * 36 * 36 * 36 * 36 * 36, 36L * 36 * 36 * 36 * 36 * 36 * 36), 36)
                    .toUpperCase(Locale.ROOT);
        } while (products.existsBySku(sku));
        return sku;
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
