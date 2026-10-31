package com.homenest.catalog;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    public record CategoryNode(Long id, String name, String slug, String description, String imageUrl,
                               List<CategoryNode> children) implements Serializable { }

    public record Crumb(String name, String slug) implements Serializable { }

    public record CategoryDetail(Long id, String name, String slug, String description, String imageUrl,
                                 List<Crumb> breadcrumbs, List<CategoryNode> children) implements Serializable { }

    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    @Cacheable("categoryTree")
    public List<CategoryNode> tree() {
        return categories.findDepartments().stream().map(this::node).toList();
    }

    @Cacheable(value = "categoryDetail", key = "#slug")
    public CategoryDetail detail(String slug) {
        Category category = categories.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        List<Crumb> crumbs = new ArrayList<>();
        for (Category c = category; c != null; c = c.getParent()) {
            crumbs.addFirst(new Crumb(c.getName(), c.getSlug()));
        }
        return new CategoryDetail(category.getId(), category.getName(), category.getSlug(), category.getDescription(),
                category.getImageUrl(), crumbs, category.getChildren().stream().map(this::node).toList());
    }

    private CategoryNode node(Category c) {
        return new CategoryNode(c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl(),
                c.getChildren().stream().map(this::node).toList());
    }
}
