package com.officebite.controller;

import com.officebite.dto.CreateOrderRequest;
import com.officebite.dto.OrderResponse;
import com.officebite.dto.UpdateOrderStatusRequest;
import com.officebite.model.OrderStatus;
import com.officebite.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/orders
     * Places a new canteen order associated with the authenticated customer.
     * Prevents clients from assigning orders to other customers via request JSON.
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Principal principal) {
        OrderResponse response = (principal != null)
                ? orderService.createOrder(request, principal.getName())
                : orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Overload for direct unit tests or internal calls without Principal.
     */
    public ResponseEntity<OrderResponse> createOrder(CreateOrderRequest request) {
        return createOrder(request, null);
    }

    /**
     * GET /api/orders/{id}
     * Retrieves an order by its numeric ID or string order number (e.g., OB-8492).
     * Enforces privacy: a CUSTOMER can only retrieve their own orders.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable String id,
            Principal principal) {
        OrderResponse response = (principal != null)
                ? orderService.getOrderByIdOrNumber(id, principal.getName())
                : orderService.getOrderByIdOrNumber(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Overload for direct unit tests or internal calls without Principal.
     */
    public ResponseEntity<OrderResponse> getOrder(String id) {
        return getOrder(id, null);
    }

    /**
     * GET /api/orders
     * Lists orders, optionally filtered by status, sorted newest first.
     * A CUSTOMER sees only their own orders. STAFF or ADMIN see all orders.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            Principal principal) {
        List<OrderResponse> orders = (principal != null)
                ? orderService.getOrders(status, principal.getName())
                : orderService.getOrders(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Overload for direct unit tests or internal calls without Principal.
     */
    public ResponseEntity<List<OrderResponse>> getOrders(OrderStatus status) {
        return getOrders(status, null);
    }

    /**
     * PATCH /api/orders/{id}/status
     * Updates an order's status with transition validation.
     * Restricted to authenticated users with STAFF or ADMIN roles.
     */
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> patchOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/orders/{id}/status
     * Updates an order's status (PUT compatibility).
     * Restricted to authenticated users with STAFF or ADMIN roles.
     */
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/orders/{id}
     * Deletes an order from the database.
     * Restricted to authenticated users with STAFF or ADMIN roles.
     */
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
