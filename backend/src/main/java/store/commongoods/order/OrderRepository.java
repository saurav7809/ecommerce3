package store.commongoods.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder,Long> { Optional<CustomerOrder> findByReference(String reference); List<CustomerOrder> findTop20ByEmailIgnoreCaseOrderByCreatedAtDesc(String email); }
