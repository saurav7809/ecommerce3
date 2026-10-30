package store.commongoods.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query(value = "select p.* from products p where (:category is null or lower(p.category) = lower(:category)) and (:q is null or to_tsvector('english', p.name || ' ' || p.description) @@ plainto_tsquery('english', :q)) order by p.featured desc, p.id", nativeQuery = true)
    List<Product> search(@Param("category") String category, @Param("q") String query);
    boolean existsByName(String name);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select p from Product p where p.id = :id") Optional<Product> findLockedById(@Param("id") Long id);
}
