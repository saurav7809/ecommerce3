package com.homenest.catalog;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories")
public class CategoryController {
    private final CategoryService categories;

    public CategoryController(CategoryService categories) {
        this.categories = categories;
    }

    @GetMapping
    @Operation(summary = "Department and sub-category tree used by the mega menu")
    public List<CategoryService.CategoryNode> tree() {
        return categories.tree();
    }

    @GetMapping("/{slug}")
    @Operation(summary = "One category with breadcrumbs and sub-categories")
    public CategoryService.CategoryDetail detail(@PathVariable String slug) {
        return categories.detail(slug);
    }
}
