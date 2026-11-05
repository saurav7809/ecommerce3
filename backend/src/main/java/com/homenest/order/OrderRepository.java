package com.homenest.order;

import com.homenest.order.OrderEnums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByReference(String reference);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.reference = :reference")
    Optional<Order> findLockedByReference(String reference);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    long countByStatusNot(OrderStatus status);

    /** Orders that are neither cancelled nor still waiting for online payment. */
    List<OrderStatus> NOT_COUNTED = List.of(OrderStatus.CANCELLED, OrderStatus.PENDING_PAYMENT);

    @Query("select coalesce(sum(o.total), 0) from Order o where o.status not in :excluded")
    BigDecimal revenueExcluding(Collection<OrderStatus> excluded);

    default BigDecimal revenue() { return revenueExcluding(NOT_COUNTED); }

    @Query("select count(i) > 0 from OrderItem i where i.order.user.id = :userId and i.productId = :productId "
            + "and i.order.status not in :excluded")
    boolean hasPurchasedExcluding(Long userId, Long productId, Collection<OrderStatus> excluded);

    default boolean hasPurchased(Long userId, Long productId) { return hasPurchasedExcluding(userId, productId, NOT_COUNTED); }

    @Query("select distinct i.productId from OrderItem i where i.order.user.id = :userId and i.order.status not in :excluded")
    List<Long> findPurchasedProductIds(Long userId, Collection<OrderStatus> excluded);

    @Query("select related.productId, count(distinct source.order.id) from OrderItem source, OrderItem related "
            + "where related.order = source.order and source.productId in :productIds "
            + "and related.productId not in :productIds and source.order.status not in :excluded "
            + "group by related.productId order by count(distinct source.order.id) desc, related.productId asc")
    List<Object[]> findCoPurchasedProductScores(Collection<Long> productIds, Collection<OrderStatus> excluded);

    @Query("select related.productId, count(distinct source.order.id) from OrderItem source, OrderItem related "
            + "where related.order = source.order and source.productId = :productId "
            + "and related.productId <> :productId and source.order.status not in :excluded "
            + "group by related.productId order by count(distinct source.order.id) desc, related.productId asc")
    List<Object[]> findFrequentlyBoughtTogether(Long productId, Collection<OrderStatus> excluded);

    @Query("select o.status, count(o) from Order o group by o.status")
    List<Object[]> countByStatus();
}
