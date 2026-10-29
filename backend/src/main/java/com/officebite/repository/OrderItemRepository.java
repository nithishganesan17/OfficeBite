package com.officebite.repository;

import com.officebite.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    boolean existsByMenuItemId(String menuItemId);

    long countByMenuItemId(String menuItemId);
}
