package com.homenest.catalog;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = "category")
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @EntityGraph(attributePaths = "category")
    List<Product> findAll(Specification<Product> spec);

    @EntityGraph(attributePaths = {"category", "category.parent", "seller"})
    Optional<Product> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySku(String sku);

    @EntityGraph(attributePaths = "category")
    List<Product> findTop12ByCategoryIdAndActiveTrueAndIdNotOrderByAverageRatingDescReviewCountDesc(Long categoryId, Long excludedId);

    @EntityGraph(attributePaths = "category")
    @Query("select p from Product p where p.active = true")
    List<Product> findAllActive();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findLockedById(Long id);

    @EntityGraph(attributePaths = "category")
    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    @EntityGraph(attributePaths = "category")
    @Query("select p from Product p")
    Page<Product> findAllWithCategory(Pageable pageable);

    long countByActiveTrue();

    long countByActiveTrueAndStockLessThan(int threshold);
}
