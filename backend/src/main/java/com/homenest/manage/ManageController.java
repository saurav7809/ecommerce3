package com.homenest.manage;

import com.homenest.catalog.ProductDtos.ManagedProduct;
import com.homenest.common.PageResponse;
import com.homenest.media.CloudinaryService;
import com.homenest.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/** Seller Central / admin catalog management. Requires the SELLER or ADMIN role. */
@RestController
@RequestMapping("/api/manage")
@Tag(name = "Seller & admin: products")
public class ManageController {
    private final ManageProductService products;
    private final CloudinaryService cloudinary;

    public ManageController(ManageProductService products, CloudinaryService cloudinary) {
        this.products = products;
        this.cloudinary = cloudinary;
    }

    @GetMapping("/products")
    @Operation(summary = "Admins see every product; sellers see their own listings")
    public PageResponse<ManagedProduct> list(@AuthenticationPrincipal User user,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return products.list(user, page, size);
    }

    @GetMapping("/products/{id}")
    public ManagedProduct get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return products.get(user, id);
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ManagedProduct create(@AuthenticationPrincipal User user, @Valid @RequestBody ManageProductService.ProductRequest request) {
        return products.create(user, request);
    }

    @PutMapping("/products/{id}")
    public ManagedProduct update(@AuthenticationPrincipal User user, @PathVariable Long id,
                                 @Valid @RequestBody ManageProductService.ProductRequest request) {
        return products.update(user, id, request);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Hide a product from the storefront (kept for order history)")
    public void delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        products.deactivate(user, id);
    }

    @GetMapping("/media/status")
    public Map<String, Boolean> mediaStatus() {
        return Map.of("cloudinaryEnabled", cloudinary.configured());
    }

    @PostMapping(value = "/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload a product image to Cloudinary and return its URL")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        return Map.of("url", cloudinary.upload(file));
    }
}
