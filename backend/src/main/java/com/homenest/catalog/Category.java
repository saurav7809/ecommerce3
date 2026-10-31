package com.homenest.catalog;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/** A department (parent == null) such as "Furniture", or a sub-category such as "Sofas". */
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 300)
    private String description;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private int sortOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent")
    @OrderBy("sortOrder ASC, name ASC")
    private List<Category> children = new ArrayList<>();

    protected Category() { }

    public Category(String name, String slug, String description, String imageUrl, int sortOrder, Category parent) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.imageUrl = imageUrl;
        this.sortOrder = sortOrder;
        this.parent = parent;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public int getSortOrder() { return sortOrder; }
    public Category getParent() { return parent; }
    public List<Category> getChildren() { return children; }
}
