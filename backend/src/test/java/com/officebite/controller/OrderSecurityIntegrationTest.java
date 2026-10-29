package com.officebite.controller;

import com.officebite.model.*;
import com.officebite.repository.MenuItemRepository;
import com.officebite.repository.OrderRepository;
import com.officebite.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class OrderSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User customerAlice;
    private User customerBob;
    private User staffChef;
    private User adminVikram;
    private MenuItem dishThali;
    private Order orderAlice;
    private Order orderHistorical;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Create test users
        customerAlice = userRepository.findByEmail("alice@officebite.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Alice Wonderland")
                        .email("alice@officebite.com")
                        .passwordHash(passwordEncoder.encode("Password123"))
                        .role(Role.CUSTOMER)
                        .employeeId("EMP-A1")
                        .build()));

        customerBob = userRepository.findByEmail("bob@officebite.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Bob Builder")
                        .email("bob@officebite.com")
                        .passwordHash(passwordEncoder.encode("Password123"))
                        .role(Role.CUSTOMER)
                        .employeeId("EMP-B2")
                        .build()));

        staffChef = userRepository.findByEmail("staff@officebite.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Chef Ranveer")
                        .email("staff@officebite.com")
                        .passwordHash(passwordEncoder.encode("Password123"))
                        .role(Role.STAFF)
                        .employeeId("STAFF-01")
                        .build()));

        adminVikram = userRepository.findByEmail("admin@officebite.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Vikram Admin")
                        .email("admin@officebite.com")
                        .passwordHash(passwordEncoder.encode("Password123"))
                        .role(Role.ADMIN)
                        .employeeId("ADM-01")
                        .build()));

        // Ensure menu item
        dishThali = menuItemRepository.findById("dish-1").orElseGet(() ->
                menuItemRepository.save(MenuItem.builder()
                        .id("dish-1")
                        .name("Deluxe North Indian Thali")
                        .price(180.0)
                        .category("indian-meals")
                        .available(true)
                        .build()));

        // Create an order for Alice
        orderAlice = Order.builder()
                .user(customerAlice)
                .orderNumber("OB-9001")
                .tokenNumber("A-11")
                .customerName("Alice Wonderland")
                .customerEmail("alice@officebite.com")
                .deliveryType("CANTEEN_PICKUP")
                .deliveryLocation("Floor 3 Counter 1")
                .status(OrderStatus.PLACED)
                .subtotal(180.0)
                .totalAmount(180.0)
                .build();
        orderAlice.addItem(OrderItem.builder()
                .menuItemId(dishThali.getId())
                .itemName(dishThali.getName())
                .unitPrice(180.0)
                .quantity(1)
                .subtotal(180.0)
                .build());
        orderAlice = orderRepository.save(orderAlice);

        // Create a historical order without an associated user
        orderHistorical = Order.builder()
                .user(null) // Historical order
                .orderNumber("OB-8000")
                .tokenNumber("A-00")
                .customerName("Legacy User")
                .customerEmail("legacy@officebite.com")
                .deliveryType("CANTEEN_PICKUP")
                .status(OrderStatus.COMPLETED)
                .subtotal(100.0)
                .totalAmount(100.0)
                .build();
        orderHistorical = orderRepository.save(orderHistorical);
    }

    // =========================================================================
    // 1. Unauthenticated access tests (401 Unauthorized)
    // =========================================================================

    @Test
    @DisplayName("Security: Unauthenticated request to GET /api/orders returns 401")
    void testUnauthenticated_getOrders_returns401() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Security: Unauthenticated request to GET /api/orders/{id} returns 401")
    void testUnauthenticated_getOrderById_returns401() throws Exception {
        mockMvc.perform(get("/api/orders/OB-9001"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Security: Unauthenticated request to POST /api/orders returns 401")
    void testUnauthenticated_createOrder_returns401() throws Exception {
        String payload = """
                {
                  "customerName": "Guest",
                  "items": [{ "menuItemId": "dish-1", "quantity": 1 }]
                }
                """;
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Security: Unauthenticated request to PATCH /api/orders/{id}/status returns 401")
    void testUnauthenticated_patchStatus_returns401() throws Exception {
        mockMvc.perform(patch("/api/orders/OB-9001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACCEPTED\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Security: Request with invalid / malformed JWT token returns 401 Unauthorized")
    void testInvalidJwtToken_returns401() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer invalid.tampered.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Security: Request with expired JWT token returns 401 Unauthorized")
    void testExpiredJwtToken_returns401() throws Exception {
        String expiredToken = io.jsonwebtoken.Jwts.builder()
                .subject("alice@officebite.com")
                .expiration(new java.util.Date(System.currentTimeMillis() - 10000))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                        "officebite-dev-super-secure-jwt-signing-secret-key-at-least-256-bits-long-2026!".getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("UNAUTHORIZED"));
    }

    // =========================================================================
    // 2. Public endpoints continue to work without authentication
    // =========================================================================

    @Test
    @DisplayName("Public access: GET /api/menu and /api/health work without auth")
    void testPublicEndpoints_noAuthRequired() throws Exception {
        mockMvc.perform(get("/api/menu"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("Public access: Customer registration works without auth and assigns CUSTOMER role")
    void testPublicRegistration_succeeds() throws Exception {
        String registerPayload = """
                {
                  "name": "New Employee",
                  "email": "newemployee@officebite.com",
                  "password": "Password123"
                }
                """;
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.token").isString());
    }

    // =========================================================================
    // 3. Customer order privacy & ownership
    // =========================================================================

    @Test
    @WithMockUser(username = "alice@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Privacy: Customer A can view their own order details")
    void testCustomer_canViewOwnOrder() throws Exception {
        mockMvc.perform(get("/api/orders/OB-9001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("OB-9001"))
                .andExpect(jsonPath("$.customerEmail").value("alice@officebite.com"));
    }

    @Test
    @WithMockUser(username = "bob@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Privacy: Customer B CANNOT view Customer A's order (returns 403 Forbidden)")
    void testCustomer_cannotViewOtherCustomerOrder_returns403() throws Exception {
        mockMvc.perform(get("/api/orders/OB-9001"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").value(containsString("Access denied")));
    }

    @Test
    @WithMockUser(username = "bob@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Privacy: Customer B CANNOT view Customer A's order by numeric ID (returns 403)")
    void testCustomer_cannotViewOtherCustomerOrderByNumericId_returns403() throws Exception {
        mockMvc.perform(get("/api/orders/" + orderAlice.getId()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(username = "alice@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Privacy: Customer CANNOT view unlinked historical orders (returns 403)")
    void testCustomer_cannotViewHistoricalUnlinkedOrder_returns403() throws Exception {
        mockMvc.perform(get("/api/orders/OB-8000"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(username = "alice@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Privacy: GET /api/orders returns ONLY customer's own orders")
    void testCustomer_getOrders_returnsOnlyOwnOrders() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].orderNumber").value("OB-9001"))
                .andExpect(jsonPath("$[0].customerEmail").value("alice@officebite.com"));
    }

    @Test
    @WithMockUser(username = "bob@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Privacy: Customer with no orders gets an empty list, not other customers' orders")
    void testCustomer_getOrders_emptyForBob() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(username = "alice@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Privacy: POST /api/orders binds order to authenticated customer regardless of JSON")
    void testCustomer_createOrder_bindsToAuthenticatedCustomer() throws Exception {
        String payload = """
                {
                  "customerName": "Alice",
                  "customerEmail": "victim@officebite.com",
                  "deliveryType": "CANTEEN_PICKUP",
                  "items": [{ "menuItemId": "dish-1", "quantity": 1 }]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerEmail").value("alice@officebite.com"))
                .andExpect(jsonPath("$.userId").value(customerAlice.getId()));
    }

    // =========================================================================
    // 4. Staff permissions
    // =========================================================================

    @Test
    @WithMockUser(username = "alice@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Staff Permissions: Customers CANNOT change order status (returns 403 Forbidden)")
    void testCustomer_cannotChangeOrderStatus_returns403() throws Exception {
        mockMvc.perform(patch("/api/orders/OB-9001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACCEPTED\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(username = "bob@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Customer Isolation: Customer B CANNOT modify Customer A's order status (returns 403 Forbidden)")
    void testCustomerB_cannotModifyCustomerAOrderStatus_returns403() throws Exception {
        mockMvc.perform(patch("/api/orders/OB-9001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACCEPTED\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(username = "staff@officebite.com", roles = {"STAFF"})
    @DisplayName("Staff Permissions: STAFF can list all orders including historical ones")
    void testStaff_canListAllOrders() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @WithMockUser(username = "staff@officebite.com", roles = {"STAFF"})
    @DisplayName("Staff Permissions: STAFF can view any customer order")
    void testStaff_canViewAnyCustomerOrder() throws Exception {
        mockMvc.perform(get("/api/orders/OB-9001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("OB-9001"));
    }

    @Test
    @WithMockUser(username = "staff@officebite.com", roles = {"STAFF"})
    @DisplayName("Staff Permissions: STAFF can update order status with valid transition")
    void testStaff_canUpdateStatus_validTransition() throws Exception {
        mockMvc.perform(patch("/api/orders/OB-9001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACCEPTED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        Order updated = orderRepository.findByOrderNumber("OB-9001").orElseThrow();
        assertEquals(OrderStatus.ACCEPTED, updated.getStatus());
    }

    @Test
    @WithMockUser(username = "staff@officebite.com", roles = {"STAFF"})
    @DisplayName("Staff Permissions: STAFF status change validates transition lifecycle (rejects invalid)")
    void testStaff_rejectsInvalidStatusTransition() throws Exception {
        // PLACED cannot jump straight to COMPLETED
        mockMvc.perform(patch("/api/orders/OB-9001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("INVALID_STATUS_TRANSITION"));
    }

    // =========================================================================
    // 5. Admin permissions
    // =========================================================================

    @Test
    @WithMockUser(username = "alice@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("Admin Permissions: CUSTOMER rejected from admin endpoints (returns 403 Forbidden)")
    void testCustomer_adminEndpoint_rejected403() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(username = "staff@officebite.com", roles = {"STAFF"})
    @DisplayName("Admin Permissions: STAFF rejected from admin endpoints (returns 403 Forbidden)")
    void testStaff_adminEndpoint_rejected403() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("FORBIDDEN"));
    }

    @Test
    @WithMockUser(username = "admin@officebite.com", roles = {"ADMIN"})
    @DisplayName("Admin Permissions: ADMIN can access admin users list")
    void testAdmin_canAccessAdminUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(username = "admin@officebite.com", roles = {"ADMIN"})
    @DisplayName("Admin Permissions: ADMIN can provision new staff account")
    void testAdmin_canProvisionStaffAccount() throws Exception {
        String staffPayload = """
                {
                  "name": "New Chef",
                  "email": "newchef@officebite.com",
                  "password": "ChefPassword123",
                  "employeeId": "STF-99",
                  "role": "STAFF"
                }
                """;

        mockMvc.perform(post("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(staffPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.email").value("newchef@officebite.com"));
    }
}
