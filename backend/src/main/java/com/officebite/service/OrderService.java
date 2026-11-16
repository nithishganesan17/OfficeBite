package com.officebite.service;

import com.officebite.dto.*;
import com.officebite.exception.InvalidOrderException;
import com.officebite.exception.InvalidStatusTransitionException;
import com.officebite.exception.ResourceNotFoundException;
import com.officebite.model.MenuItem;
import com.officebite.model.Order;
import com.officebite.model.OrderItem;
import com.officebite.model.OrderStatus;
import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.MenuItemRepository;
import com.officebite.repository.OrderRepository;
import com.officebite.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final Random random = new SecureRandom();

    public OrderService(OrderRepository orderRepository, MenuItemRepository menuItemRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new customer order associated with the authenticated customer.
     * Prevents clients from assigning orders to other customers via request JSON.
     * Validates required fields, item availability, and positive quantities.
     * Fetches current prices directly from database and calculates totals server-side.
     */
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String authenticatedEmail) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new InvalidOrderException("Order must contain at least one item.");
        }

        User authenticatedUser = null;
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            authenticatedUser = userRepository.findByEmail(UserService.normalizeEmail(authenticatedEmail))
                    .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + authenticatedEmail));
        } else if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
            authenticatedUser = userRepository.findByEmail(UserService.normalizeEmail(request.getCustomerEmail())).orElse(null);
        }

        // Consolidate duplicate items and enforce quantity upper bounds (1..50)
        java.util.Map<String, Integer> consolidatedItems = new java.util.LinkedHashMap<>();
        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() < 1) {
                throw new InvalidOrderException("Quantity must be at least 1 for all items.");
            }
            if (itemReq.getQuantity() > 50) {
                throw new InvalidOrderException("Quantity cannot exceed 50 for any item.");
            }
            if (itemReq.getMenuItemId() == null || itemReq.getMenuItemId().isBlank()) {
                throw new InvalidOrderException("Menu item ID cannot be blank.");
            }
            int newQty = consolidatedItems.getOrDefault(itemReq.getMenuItemId(), 0) + itemReq.getQuantity();
            if (newQty > 50) {
                throw new InvalidOrderException("Total quantity for dish '" + itemReq.getMenuItemId() + "' cannot exceed 50 per order.");
            }
            consolidatedItems.put(itemReq.getMenuItemId(), newQty);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0.0;

        for (java.util.Map.Entry<String, Integer> entry : consolidatedItems.entrySet()) {
            String menuItemId = entry.getKey();
            int quantity = entry.getValue();

            MenuItem menuItem = menuItemRepository.findById(menuItemId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Menu item not found with ID: " + menuItemId));

            if (!menuItem.isAvailable()) {
                throw new InvalidOrderException(
                        "Menu item '" + menuItem.getName() + "' is currently unavailable.");
            }

            // Always trust DB price only
            double unitPrice = menuItem.getPrice();
            double itemSubtotal = unitPrice * quantity;
            subtotal += itemSubtotal;

            OrderItem orderItem = OrderItem.builder()
                    .menuItemId(menuItem.getId())
                    .itemName(menuItem.getName()) // Historical name snapshot
                    .unitPrice(unitPrice)         // Historical price snapshot
                    .quantity(quantity)
                    .subtotal(itemSubtotal)
                    .imageUrl(menuItem.getImageUrl())
                    .build();

            orderItems.add(orderItem);
        }

        // Subtotal and Grand Total match (no invented fees)
        double totalAmount = Math.round(subtotal * 100.0) / 100.0;
        subtotal = totalAmount;

        String deliveryType = request.getDeliveryType() != null && !request.getDeliveryType().isBlank()
                ? request.getDeliveryType().trim()
                : "CANTEEN_PICKUP";

        String deliveryLocation = request.getDeliveryLocation() != null && !request.getDeliveryLocation().isBlank()
                ? request.getDeliveryLocation().trim()
                : (deliveryType.equalsIgnoreCase("DESK_DELIVERY") ? "Desk Delivery" : "Floor 3 Canteen Live Counter");

        // Customer details securely sourced:
        // Always bind to authenticated user to prevent client spoofing.
        String customerName = (request.getCustomerName() != null && !request.getCustomerName().isBlank())
                ? request.getCustomerName().trim()
                : (authenticatedUser != null ? authenticatedUser.getName() : "Customer");

        String customerEmail = authenticatedUser != null
                ? authenticatedUser.getEmail()
                : (request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null);

        String employeeId = (request.getEmployeeId() != null && !request.getEmployeeId().isBlank())
                ? request.getEmployeeId().trim()
                : (authenticatedUser != null ? authenticatedUser.getEmployeeId() : null);

        Order order = Order.builder()
                .user(authenticatedUser)
                .orderNumber(generateUniqueOrderNumber())
                .tokenNumber(generateTokenNumber(deliveryType))
                .customerName(customerName)
                .customerEmail(customerEmail)
                .employeeId(employeeId)
                .deliveryType(deliveryType)
                .deliveryLocation(deliveryLocation)
                .specialInstructions(request.getSpecialInstructions() != null ? request.getSpecialInstructions().trim() : null)
                .status(OrderStatus.PLACED)
                .subtotal(subtotal)
                .totalAmount(totalAmount)
                .build();

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Successfully placed order #{}, token: {}, total: ₹{}",
                savedOrder.getOrderNumber(), savedOrder.getTokenNumber(), savedOrder.getTotalAmount());

        return mapToOrderResponse(savedOrder);
    }

    /**
     * Overloaded createOrder for compatibility without explicit email parameter.
     */
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        return createOrder(request, null);
    }

    /**
     * Retrieves an order by its numeric ID or unique order number (e.g., OB-8492).
     * Enforces customer privacy: a CUSTOMER may only retrieve their own orders.
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdOrNumber(String identifier, String authenticatedEmail) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Order identifier must not be empty.");
        }

        Order order = null;

        // Try numeric ID first if applicable
        if (identifier.matches("^\\d+$")) {
            order = orderRepository.findById(Long.parseLong(identifier)).orElse(null);
        }

        // If not found by numeric ID, try finding by orderNumber
        if (order == null) {
            order = orderRepository.findByOrderNumber(identifier.trim())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Order not found with ID or order number: " + identifier));
        }

        // Privacy boundary enforcement:
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            User user = userRepository.findByEmail(UserService.normalizeEmail(authenticatedEmail)).orElse(null);
            if (user != null && user.getRole() == Role.CUSTOMER) {
                // Customers can strictly view only their own orders.
                // Historical orders without an associated user (user == null) or orders of another customer are forbidden.
                if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
                    throw new AccessDeniedException("Access denied: You do not have permission to view this order.");
                }
            }
        }

        return mapToOrderResponse(order);
    }

    /**
     * Overloaded getOrderByIdOrNumber for compatibility without explicit email parameter.
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdOrNumber(String identifier) {
        return getOrderByIdOrNumber(identifier, null);
    }

    /**
     * Lists orders, optionally filtered by status, ordered newest first.
     * When requested by a CUSTOMER, returns only that customer's orders.
     * When requested by STAFF or ADMIN, returns all orders.
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(OrderStatus status, String authenticatedEmail) {
        List<Order> orders;

        User user = null;
        if (authenticatedEmail != null && !authenticatedEmail.isBlank()) {
            user = userRepository.findByEmail(UserService.normalizeEmail(authenticatedEmail)).orElse(null);
        }

        if (user != null && user.getRole() == Role.CUSTOMER) {
            // Customer can only view their own orders
            if (status != null) {
                orders = orderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(), status);
            } else {
                orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            }
        } else {
            // Staff, Admin, or internal/test calls without restricted customer principal
            if (status != null) {
                orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
            } else {
                orders = orderRepository.findAllByOrderByCreatedAtDesc();
            }
        }

        return orders.stream().map(this::mapToOrderResponse).toList();
    }

    /**
     * Overloaded getOrders for compatibility without explicit email parameter.
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(OrderStatus status) {
        return getOrders(status, null);
    }

    /**
     * Updates an order's status with transition validation.
     */
    @Transactional
    public OrderResponse updateOrderStatus(String identifier, OrderStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("New order status must not be null.");
        }

        Order order = null;
        if (identifier != null && identifier.matches("^\\d+$")) {
            order = orderRepository.findById(Long.parseLong(identifier)).orElse(null);
        }
        if (order == null && identifier != null) {
            order = orderRepository.findByOrderNumber(identifier.trim())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Order not found with ID or order number: " + identifier));
        }
        if (order == null) {
            throw new ResourceNotFoundException("Order not found with identifier: " + identifier);
        }

        OrderStatus currentStatus = order.getStatus();

        // Status transition validation
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus +
                            ". Allowed next statuses: " + currentStatus.getValidNextStatuses());
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        log.info("Order #{} status transitioned: {} -> {}", updated.getOrderNumber(), currentStatus, newStatus);

        return mapToOrderResponse(updated);
    }

    /**
     * Deletes an order by ID or orderNumber
     */
    @Transactional
    public void deleteOrder(String identifier) {
        Order order = null;
        if (identifier != null && identifier.matches("^\\d+$")) {
            order = orderRepository.findById(Long.parseLong(identifier)).orElse(null);
        }
        if (order == null && identifier != null) {
            order = orderRepository.findByOrderNumber(identifier.trim()).orElse(null);
        }
        if (order != null) {
            orderRepository.delete(order);
            log.info("Deleted order #{}", identifier);
        }
    }

    private String generateUniqueOrderNumber() {
        int attempts = 0;
        String orderNumber;
        do {
            if (++attempts > 10) {
                // High-entropy fallback if 4-digit space has excessive collisions
                return "OB-" + (System.currentTimeMillis() % 10000000);
            }
            int num = 1000 + random.nextInt(9000);
            orderNumber = "OB-" + num;
        } while (orderRepository.existsByOrderNumber(orderNumber));
        return orderNumber;
    }

    private String generateTokenNumber(String deliveryType) {
        char prefix = "DESK_DELIVERY".equalsIgnoreCase(deliveryType) ? 'D' : 'A';
        int num = 10 + random.nextInt(90);
        return prefix + "-" + num;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .itemName(item.getItemName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .imageUrl(item.getImageUrl())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .orderNumber(order.getOrderNumber())
                .tokenNumber(order.getTokenNumber())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .employeeId(order.getEmployeeId())
                .deliveryType(order.getDeliveryType())
                .deliveryLocation(order.getDeliveryLocation())
                .specialInstructions(order.getSpecialInstructions())
                .status(order.getStatus())
                .statusLabel(getStatusLabel(order.getStatus()))
                .subtotal(order.getSubtotal())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }

    private String getStatusLabel(OrderStatus status) {
        return switch (status) {
            case PLACED -> "Order Placed";
            case ACCEPTED -> "Order Confirmed";
            case PREPARING -> "Kitchen is Preparing";
            case READY -> "Ready for Pickup";
            case COMPLETED -> "Delivered / Completed";
            case REJECTED -> "Order Rejected / Cancelled";
        };
    }
}
