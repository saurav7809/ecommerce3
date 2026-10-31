package com.homenest.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);

    @Query("select c from Category c where c.parent is null order by c.sortOrder, c.name")
    List<Category> findDepartments();

    @Query("select c.id from Category c left join c.parent p where c.slug = :slug or p.slug = :slug")
    List<Long> findIdsInTree(String slug);
}
