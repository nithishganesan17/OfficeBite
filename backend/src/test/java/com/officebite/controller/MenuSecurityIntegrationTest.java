package com.officebite.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.officebite.dto.CreateMenuItemRequest;
import com.officebite.dto.UpdateMenuAvailabilityRequest;
import com.officebite.dto.UpdateMenuItemRequest;
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

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class MenuSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MenuItem testDishInUse;
    private MenuItem testDishUnused;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Ensure users exist
        userRepository.findByEmail("customer.menu@officebite.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Customer Menu")
                        .email("customer.menu@officebite.com")
                        .passwordHash(passwordEncoder.encode("Password123"))
                        .role(Role.CUSTOMER)
                        .build()));

        userRepository.findByEmail("staff.menu@officebite.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Staff Menu")
                        .email("staff.menu@officebite.com")
                        .passwordHash(passwordEncoder.encode("Password123"))
                        .role(Role.STAFF)
                        .build()));

        userRepository.findByEmail("admin.menu@officebite.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Admin Menu")
                        .email("admin.menu@officebite.com")
                        .passwordHash(passwordEncoder.encode("Password123"))
                        .role(Role.ADMIN)
                        .build()));

        // Create dishes
        testDishInUse = menuItemRepository.findById("dish-in-use").orElseGet(() ->
                menuItemRepository.save(MenuItem.builder()
                        .id("dish-in-use")
                        .name("Popular Paneer Butter Masala")
                        .category("indian-meals")
                        .categoryName("Indian Meals")
                        .price(160.0)
                        .vegetarian(true)
                        .available(true)
                        .build()));

        testDishUnused = menuItemRepository.findById("dish-unused").orElseGet(() ->
                menuItemRepository.save(MenuItem.builder()
                        .id("dish-unused")
                        .name("Temporary Experimental Salad")
                        .category("snacks")
                        .categoryName("Snacks")
                        .price(95.0)
                        .vegetarian(true)
                        .available(true)
                        .build()));

        // Create an order referencing testDishInUse
        Order order = Order.builder()
                .orderNumber("OB-TEST-999")
                .tokenNumber("T-99")
                .customerName("Test Customer")
                .customerEmail("customer.menu@officebite.com")
                .deliveryType("CANTEEN_PICKUP")
                .status(OrderStatus.COMPLETED)
                .subtotal(160.0)
                .totalAmount(160.0)
                .build();
        order.addItem(OrderItem.builder()
                .menuItemId(testDishInUse.getId())
                .itemName(testDishInUse.getName())
                .unitPrice(160.0)
                .quantity(1)
                .subtotal(160.0)
                .build());
        orderRepository.save(order);
    }

    @Test
    @DisplayName("GET /api/menu is accessible to anonymous public users")
    void testGetMenu_anonymousAllowed() throws Exception {
        mockMvc.perform(get("/api/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }

    @Test
    @DisplayName("GET /api/menu/{id} is accessible to anonymous public users")
    void testGetMenuItem_anonymousAllowed() throws Exception {
        mockMvc.perform(get("/api/menu/" + testDishInUse.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testDishInUse.getId()))
                .andExpect(jsonPath("$.name").value("Popular Paneer Butter Masala"));
    }

    @Test
    @DisplayName("POST /api/menu returns 401 Unauthorized for anonymous user")
    void testCreateMenuItem_anonymousUnauthorized() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Cold Coffee")
                .category("coffee")
                .price(60.0)
                .build();

        mockMvc.perform(post("/api/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer.menu@officebite.com", roles = {"CUSTOMER"})
    @DisplayName("POST /api/menu returns 403 Forbidden for CUSTOMER role")
    void testCreateMenuItem_customerForbidden() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Cold Coffee")
                .category("coffee")
                .price(60.0)
                .build();

        mockMvc.perform(post("/api/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "staff.menu@officebite.com", roles = {"STAFF"})
    @DisplayName("POST /api/menu returns 403 Forbidden for STAFF role")
    void testCreateMenuItem_staffForbidden() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Cold Coffee")
                .category("coffee")
                .price(60.0)
                .build();

        mockMvc.perform(post("/api/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("POST /api/menu succeeds for ADMIN role with valid data")
    void testCreateMenuItem_adminSuccess() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Kashmiri Dum Aloo")
                .description("Spiced potatoes in rich yogurt gravy")
                .category("indian-meals")
                .price(140.0)
                .vegetarian(true)
                .available(true)
                .prepTime("15 mins")
                .calories("420 kcal")
                .badge("New")
                .isPopular(false)
                .build();

        mockMvc.perform(post("/api/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", startsWith("dish-")))
                .andExpect(jsonPath("$.name").value("Kashmiri Dum Aloo"))
                .andExpect(jsonPath("$.price").value(140.0))
                .andExpect(jsonPath("$.categoryName").value("Indian Meals"));
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("POST /api/menu creates dish with spaced category and full fields (e.g. Santhosh Masala)")
    void testCreateMenuItem_withSpacedCategory_success() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Santhosh Masala")
                .category("Indian Meals")
                .description("Enjoy your meal!")
                .price(120.0)
                .imageUrl("https://images.unsplash.com/photo-example")
                .prepTime("15 mins")
                .calories("400 kcal")
                .badge("Special")
                .vegetarian(true)
                .available(true)
                .isPopular(false)
                .build();

        mockMvc.perform(post("/api/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", startsWith("dish-")))
                .andExpect(jsonPath("$.name").value("Santhosh Masala"))
                .andExpect(jsonPath("$.category").value("indian-meals"))
                .andExpect(jsonPath("$.categoryName").value("Indian Meals"))
                .andExpect(jsonPath("$.price").value(120.0))
                .andExpect(jsonPath("$.description").value("Enjoy your meal!"));
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("POST /api/menu rejects negative price and empty name with 400 Bad Request and detailed fieldErrors")
    void testCreateMenuItem_validationErrors() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("")
                .category("indian-meals")
                .price(-10.0)
                .build();

        mockMvc.perform(post("/api/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.price").exists());
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("Unsupported HTTP method returns 405 Method Not Allowed instead of 500")
    void testMethodNotSupported_returns405() throws Exception {
        mockMvc.perform(post("/api/health"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.error").value("METHOD_NOT_ALLOWED"))
                .andExpect(jsonPath("$.message", containsString("is not supported")));
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("PUT /api/menu/{id} succeeds for ADMIN role")
    void testUpdateMenuItem_adminSuccess() throws Exception {
        UpdateMenuItemRequest request = UpdateMenuItemRequest.builder()
                .name("Updated Paneer Butter Masala")
                .description("Extra creamy version")
                .category("indian-meals")
                .price(175.0)
                .vegetarian(true)
                .available(true)
                .prepTime("18 mins")
                .calories("520 kcal")
                .badge("Popular")
                .isPopular(true)
                .build();

        mockMvc.perform(put("/api/menu/" + testDishInUse.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Paneer Butter Masala"))
                .andExpect(jsonPath("$.price").value(175.0));
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("PATCH /api/menu/{id}/availability toggles stock for ADMIN")
    void testToggleAvailability_adminSuccess() throws Exception {
        UpdateMenuAvailabilityRequest request = new UpdateMenuAvailabilityRequest(false);

        mockMvc.perform(patch("/api/menu/" + testDishInUse.getId() + "/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("DELETE /api/menu/{id} returns 409 Conflict when item is referenced in orders")
    void testDeleteMenuItem_inUseReturns409Conflict() throws Exception {
        mockMvc.perform(delete("/api/menu/" + testDishInUse.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("MENU_ITEM_IN_USE"))
                .andExpect(jsonPath("$.message", containsString("Cannot delete dish")));

        assertTrue(menuItemRepository.findById(testDishInUse.getId()).isPresent(), "Dish must not be deleted from database");
    }

    @Test
    @WithMockUser(username = "admin.menu@officebite.com", roles = {"ADMIN"})
    @DisplayName("DELETE /api/menu/{id} returns 200 OK when item is unused")
    void testDeleteMenuItem_unusedSucceeds() throws Exception {
        mockMvc.perform(delete("/api/menu/" + testDishUnused.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Menu item deleted successfully"));

        assertFalse(menuItemRepository.findById(testDishUnused.getId()).isPresent(), "Dish should be deleted from database");
    }
}
