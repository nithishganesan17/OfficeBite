package com.officebite.service;

import com.officebite.dto.CreateOrderRequest;
import com.officebite.dto.OrderItemRequest;
import com.officebite.dto.OrderResponse;
import com.officebite.exception.InvalidOrderException;
import com.officebite.exception.InvalidStatusTransitionException;
import com.officebite.exception.ResourceNotFoundException;
import com.officebite.model.MenuItem;
import com.officebite.model.Order;
import com.officebite.model.OrderStatus;
import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.MenuItemRepository;
import com.officebite.repository.OrderRepository;
import com.officebite.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private MenuItem thali;
    private MenuItem dosa;
    private MenuItem unavailableItem;

    @BeforeEach
    void setUp() {
        thali = MenuItem.builder()
                .id("dish-1")
                .name("Deluxe North Indian Thali")
                .price(180.0)
                .category("indian-meals")
                .available(true)
                .imageUrl("https://example.com/thali.jpg")
                .build();

        dosa = MenuItem.builder()
                .id("dish-4")
                .name("Mysore Masala Dosa")
                .price(110.0)
                .category("dosa")
                .available(true)
                .imageUrl("https://example.com/dosa.jpg")
                .build();

        unavailableItem = MenuItem.builder()
                .id("dish-99")
                .name("Seasonal Mango Kulfi")
                .price(90.0)
                .category("desserts")
                .available(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully create order, calculate totals server-side, and snapshot prices")
    void testSuccessfulOrderCreation_calculatesTotalsAndSnapshotsPrices() {
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(thali));
        when(menuItemRepository.findById("dish-4")).thenReturn(Optional.of(dosa));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1L);
            return o;
        });

        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .employeeId("OB-7821")
                .deliveryType("CANTEEN_PICKUP")
                .deliveryLocation("Floor 3 Counter 2")
                .specialInstructions("Extra chutney please")
                .items(List.of(
                        new OrderItemRequest("dish-1", 2), // 2 * 180.0 = 360.0
                        new OrderItemRequest("dish-4", 1)  // 1 * 110.0 = 110.0
                ))
                .build();

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertNotNull(response.getOrderNumber());
        assertTrue(response.getOrderNumber().startsWith("OB-"));
        assertNotNull(response.getTokenNumber());
        assertTrue(response.getTokenNumber().startsWith("A-"));
        assertEquals("Rahul Sharma", response.getCustomerName());
        assertEquals("OB-7821", response.getEmployeeId());
        assertEquals(OrderStatus.PLACED, response.getStatus());

        // Subtotal and Total verification: 360 + 110 = 470.0
        assertEquals(470.0, response.getSubtotal(), 0.001);
        assertEquals(470.0, response.getTotalAmount(), 0.001);

        // Historical snapshots check
        assertEquals(2, response.getItems().size());
        assertEquals("Deluxe North Indian Thali", response.getItems().get(0).getItemName());
        assertEquals(180.0, response.getItems().get(0).getUnitPrice());
        assertEquals(2, response.getItems().get(0).getQuantity());
        assertEquals(360.0, response.getItems().get(0).getSubtotal());

        assertEquals("Mysore Masala Dosa", response.getItems().get(1).getItemName());
        assertEquals(110.0, response.getItems().get(1).getUnitPrice());
        assertEquals(1, response.getItems().get(1).getQuantity());
        assertEquals(110.0, response.getItems().get(1).getSubtotal());

        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when ordering non-existent item")
    void testCreateOrder_invalidItem_throwsResourceNotFoundException() {
        when(menuItemRepository.findById("invalid-id")).thenReturn(Optional.empty());

        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .items(List.of(new OrderItemRequest("invalid-id", 1)))
                .build();

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> orderService.createOrder(request));

        assertTrue(ex.getMessage().contains("invalid-id"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw InvalidOrderException when ordering unavailable item")
    void testCreateOrder_unavailableItem_throwsInvalidOrderException() {
        when(menuItemRepository.findById("dish-99")).thenReturn(Optional.of(unavailableItem));

        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .items(List.of(new OrderItemRequest("dish-99", 1)))
                .build();

        InvalidOrderException ex = assertThrows(InvalidOrderException.class,
                () -> orderService.createOrder(request));

        assertTrue(ex.getMessage().contains("currently unavailable"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw InvalidOrderException when item quantity is less than 1")
    void testCreateOrder_invalidQuantity_throwsInvalidOrderException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .items(List.of(new OrderItemRequest("dish-1", 0)))
                .build();

        InvalidOrderException ex = assertThrows(InvalidOrderException.class,
                () -> orderService.createOrder(request));

        assertTrue(ex.getMessage().contains("Quantity must be at least 1"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw InvalidOrderException when items list is empty")
    void testCreateOrder_emptyItems_throwsInvalidOrderException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .items(Collections.emptyList())
                .build();

        InvalidOrderException ex = assertThrows(InvalidOrderException.class,
                () -> orderService.createOrder(request));

        assertTrue(ex.getMessage().contains("Order must contain at least one item"));
    }

    @Test
    @DisplayName("Should throw InvalidOrderException when item quantity exceeds maximum limit of 50")
    void testCreateOrder_excessiveQuantity_throwsInvalidOrderException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .items(List.of(new OrderItemRequest("dish-1", 51)))
                .build();

        InvalidOrderException ex = assertThrows(InvalidOrderException.class,
                () -> orderService.createOrder(request));

        assertTrue(ex.getMessage().contains("Quantity cannot exceed 50"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should consolidate duplicate menu items in request into a single order item")
    void testCreateOrder_consolidatesDuplicateItems() {
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(thali));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(2L);
            return o;
        });

        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Rahul Sharma")
                .items(List.of(
                        new OrderItemRequest("dish-1", 2),
                        new OrderItemRequest("dish-1", 3)
                ))
                .build();

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        // Consolidated to 1 item with quantity 5 (2 + 3)
        assertEquals(1, response.getItems().size());
        assertEquals(5, response.getItems().get(0).getQuantity());
        assertEquals(900.0, response.getTotalAmount(), 0.001); // 5 * 180.0
    }

    @Test
    @DisplayName("Should validate correct status lifecycle transitions")
    void testUpdateOrderStatus_validTransitions() {
        Order order = Order.builder()
                .id(1L)
                .orderNumber("OB-1001")
                .tokenNumber("A-12")
                .customerName("Rahul Sharma")
                .status(OrderStatus.PLACED)
                .subtotal(180.0)
                .totalAmount(180.0)
                .deliveryType("CANTEEN_PICKUP")
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // PLACED -> ACCEPTED
        OrderResponse res1 = orderService.updateOrderStatus("1", OrderStatus.ACCEPTED);
        assertEquals(OrderStatus.ACCEPTED, res1.getStatus());

        // ACCEPTED -> PREPARING
        OrderResponse res2 = orderService.updateOrderStatus("1", OrderStatus.PREPARING);
        assertEquals(OrderStatus.PREPARING, res2.getStatus());

        // PREPARING -> READY
        OrderResponse res3 = orderService.updateOrderStatus("1", OrderStatus.READY);
        assertEquals(OrderStatus.READY, res3.getStatus());

        // READY -> COMPLETED
        OrderResponse res4 = orderService.updateOrderStatus("1", OrderStatus.COMPLETED);
        assertEquals(OrderStatus.COMPLETED, res4.getStatus());
    }

    @Test
    @DisplayName("Should reject invalid status transitions (e.g., COMPLETED -> PLACED)")
    void testUpdateOrderStatus_invalidTransition_throwsException() {
        Order completedOrder = Order.builder()
                .id(2L)
                .orderNumber("OB-2002")
                .tokenNumber("A-15")
                .customerName("Rahul Sharma")
                .status(OrderStatus.COMPLETED)
                .build();

        when(orderRepository.findById(2L)).thenReturn(Optional.of(completedOrder));

        InvalidStatusTransitionException ex = assertThrows(InvalidStatusTransitionException.class,
                () -> orderService.updateOrderStatus("2", OrderStatus.PLACED));

        assertTrue(ex.getMessage().contains("Invalid status transition"));
    }

    @Test
    @DisplayName("Should reject transitioning from REJECTED to any other status")
    void testUpdateOrderStatus_rejectedTerminalState_throwsException() {
        Order rejectedOrder = Order.builder()
                .id(3L)
                .orderNumber("OB-3003")
                .status(OrderStatus.REJECTED)
                .build();

        when(orderRepository.findById(3L)).thenReturn(Optional.of(rejectedOrder));

        assertThrows(InvalidStatusTransitionException.class,
                () -> orderService.updateOrderStatus("3", OrderStatus.READY));
    }

    @Test
    @DisplayName("Customer Privacy: Customer A cannot view Customer B's order")
    void testCustomerPrivacy_cannotViewOtherCustomerOrder() {
        User customerA = User.builder().id(101L).email("alice@officebite.com").role(Role.CUSTOMER).build();
        User customerB = User.builder().id(102L).email("bob@officebite.com").role(Role.CUSTOMER).build();

        Order orderOfBob = Order.builder()
                .id(1L)
                .orderNumber("OB-1111")
                .user(customerB)
                .customerEmail("bob@officebite.com")
                .status(OrderStatus.PLACED)
                .items(Collections.emptyList())
                .build();

        when(orderRepository.findByOrderNumber("OB-1111")).thenReturn(Optional.of(orderOfBob));
        when(userRepository.findByEmail("alice@officebite.com")).thenReturn(Optional.of(customerA));

        // Alice attempts to access Bob's order
        AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                () -> orderService.getOrderByIdOrNumber("OB-1111", "alice@officebite.com"));

        assertTrue(ex.getMessage().contains("Access denied"));
    }

    @Test
    @DisplayName("Customer Privacy: Customer can view their own order")
    void testCustomerPrivacy_canViewOwnOrder() {
        User customerAlice = User.builder().id(101L).email("alice@officebite.com").role(Role.CUSTOMER).build();

        Order orderOfAlice = Order.builder()
                .id(1L)
                .orderNumber("OB-1111")
                .user(customerAlice)
                .customerEmail("alice@officebite.com")
                .status(OrderStatus.PLACED)
                .items(Collections.emptyList())
                .build();

        when(orderRepository.findByOrderNumber("OB-1111")).thenReturn(Optional.of(orderOfAlice));
        when(userRepository.findByEmail("alice@officebite.com")).thenReturn(Optional.of(customerAlice));

        OrderResponse response = orderService.getOrderByIdOrNumber("OB-1111", "alice@officebite.com");

        assertNotNull(response);
        assertEquals("OB-1111", response.getOrderNumber());
        assertEquals(101L, response.getUserId());
    }

    @Test
    @DisplayName("Customer Privacy: Customer cannot view historical order without associated user")
    void testCustomerPrivacy_cannotViewHistoricalUnlinkedOrder() {
        User customerAlice = User.builder().id(101L).email("alice@officebite.com").role(Role.CUSTOMER).build();

        Order historicalOrder = Order.builder()
                .id(50L)
                .orderNumber("OB-5050")
                .user(null) // historical order placed prior to auth
                .status(OrderStatus.COMPLETED)
                .items(Collections.emptyList())
                .build();

        when(orderRepository.findByOrderNumber("OB-5050")).thenReturn(Optional.of(historicalOrder));
        when(userRepository.findByEmail("alice@officebite.com")).thenReturn(Optional.of(customerAlice));

        assertThrows(AccessDeniedException.class,
                () -> orderService.getOrderByIdOrNumber("OB-5050", "alice@officebite.com"));
    }

    @Test
    @DisplayName("Staff Permissions: Staff can view any customer order and historical order")
    void testStaffPermissions_canViewAnyOrder() {
        User staffUser = User.builder().id(201L).email("chef@officebite.com").role(Role.STAFF).build();
        User customerBob = User.builder().id(102L).email("bob@officebite.com").role(Role.CUSTOMER).build();

        Order bobOrder = Order.builder()
                .id(1L)
                .orderNumber("OB-1111")
                .user(customerBob)
                .status(OrderStatus.PREPARING)
                .items(Collections.emptyList())
                .build();

        when(orderRepository.findByOrderNumber("OB-1111")).thenReturn(Optional.of(bobOrder));
        when(userRepository.findByEmail("chef@officebite.com")).thenReturn(Optional.of(staffUser));

        OrderResponse response = orderService.getOrderByIdOrNumber("OB-1111", "chef@officebite.com");
        assertNotNull(response);
        assertEquals("OB-1111", response.getOrderNumber());
    }

    @Test
    @DisplayName("Order Creation: Prevents assigning order to another customer through request JSON")
    void testCreateOrder_ignoresClientSuppliedEmailAndBindsToAuthenticatedCustomer() {
        User authenticatedCustomer = User.builder()
                .id(101L)
                .name("Alice Real")
                .email("alice@officebite.com")
                .employeeId("EMP-101")
                .role(Role.CUSTOMER)
                .build();

        when(userRepository.findByEmail("alice@officebite.com")).thenReturn(Optional.of(authenticatedCustomer));
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(thali));
        when(orderRepository.existsByOrderNumber(any())).thenReturn(false);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Client attempts to spoof another customer's email in request body
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerName("Alice Real")
                .customerEmail("victim@officebite.com") // Spoofed email in JSON
                .employeeId("EMP-SPOOF")
                .deliveryType("CANTEEN_PICKUP")
                .items(List.of(new OrderItemRequest("dish-1", 1)))
                .build();

        OrderResponse response = orderService.createOrder(request, "alice@officebite.com");

        assertNotNull(response);
        // Ownership MUST be Alice's authenticated account
        assertEquals(101L, response.getUserId());
        assertEquals("alice@officebite.com", response.getCustomerEmail());
    }
}
