package com.officebite.controller;

import com.officebite.dto.CreateUserRequest;
import com.officebite.dto.UserProfileResponse;
import com.officebite.exception.DuplicateEmailException;
import com.officebite.exception.GlobalExceptionHandler;
import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.dto.CreateMenuItemRequest;
import com.officebite.dto.UpdateMenuAvailabilityRequest;
import com.officebite.dto.UpdateMenuItemRequest;
import com.officebite.model.MenuItem;
import com.officebite.repository.UserRepository;
import com.officebite.service.MenuService;
import com.officebite.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MenuService menuService;

    @InjectMocks
    private AdminController adminController;

    private User sampleStaff;
    private User sampleAdmin;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleStaff = User.builder()
                .id(10L)
                .name("Chef Suresh")
                .email("suresh@officebite.com")
                .role(Role.STAFF)
                .employeeId("OB-S05")
                .createdAt(LocalDateTime.now())
                .build();

        sampleAdmin = User.builder()
                .id(1L)
                .name("Admin Vikram")
                .email("admin@officebite.com")
                .role(Role.ADMIN)
                .employeeId("OB-A01")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Admin: successfully provisions a STAFF user account")
    void testCreateStaffUser_success() {
        CreateUserRequest request = CreateUserRequest.builder()
                .name("Chef Suresh")
                .email("suresh@officebite.com")
                .password("StaffSecret123")
                .employeeId("OB-S05")
                .role(Role.STAFF)
                .build();

        when(userService.createPrivilegedUser("Chef Suresh", "suresh@officebite.com", "StaffSecret123", "OB-S05", Role.STAFF))
                .thenReturn(sampleStaff);

        ResponseEntity<UserProfileResponse> response = adminController.createUser(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("suresh@officebite.com", response.getBody().getEmail());
        assertEquals(Role.STAFF, response.getBody().getRole());
    }

    @Test
    @DisplayName("Admin: lists users optionally filtered by role")
    void testGetUsers_filteredByRole() {
        when(userRepository.findByRole(Role.STAFF)).thenReturn(List.of(sampleStaff));

        ResponseEntity<List<UserProfileResponse>> response = adminController.getUsers(Role.STAFF);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(Role.STAFF, response.getBody().get(0).getRole());
    }

    @Test
    @DisplayName("Admin: lists all users when role parameter is omitted")
    void testGetUsers_allUsers() {
        when(userRepository.findAll()).thenReturn(List.of(sampleAdmin, sampleStaff));

        ResponseEntity<List<UserProfileResponse>> response = adminController.getUsers(null);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    @Test
    @DisplayName("MockMvc: POST /api/admin/users rejects duplicate email with 409 Conflict")
    void testMockMvc_duplicateEmail_returns409() throws Exception {
        when(userService.createPrivilegedUser(any(), any(), any(), any(), any()))
                .thenThrow(new DuplicateEmailException("An account with email 'suresh@officebite.com' already exists."));

        String jsonPayload = """
                {
                  "name": "Chef Suresh",
                  "email": "suresh@officebite.com",
                  "password": "StaffSecret123",
                  "employeeId": "OB-S05",
                  "role": "STAFF"
                }
                """;

        mockMvc.perform(post("/api/admin/users")
                        .contentType("application/json")
                        .content(jsonPayload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("DUPLICATE_EMAIL"));
    }

    @Test
    @DisplayName("MockMvc: POST /api/admin/users rejects missing fields with 400 Bad Request")
    void testMockMvc_validationFailure_returns400() throws Exception {
        String invalidJson = """
                {
                  "name": "",
                  "email": "invalid-email",
                  "password": "123",
                  "role": null
                }
                """;

        mockMvc.perform(post("/api/admin/users")
                        .contentType("application/json")
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"));
    }

    @Test
    @DisplayName("Admin: creates menu item via /api/admin/menu")
    void testCreateMenuItem() {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Paneer Tikka Roll")
                .category("snacks")
                .price(99.0)
                .vegetarian(true)
                .available(true)
                .build();

        MenuItem created = MenuItem.builder()
                .id("dish-24")
                .name("Paneer Tikka Roll")
                .category("snacks")
                .price(99.0)
                .vegetarian(true)
                .available(true)
                .build();

        when(menuService.createMenuItem(any(CreateMenuItemRequest.class))).thenReturn(created);

        ResponseEntity<MenuItem> response = adminController.createMenuItem(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("dish-24", response.getBody().getId());
        assertEquals("Paneer Tikka Roll", response.getBody().getName());
    }

    @Test
    @DisplayName("Admin: updates menu item via /api/admin/menu/{id}")
    void testUpdateMenuItem() {
        UpdateMenuItemRequest request = UpdateMenuItemRequest.builder()
                .name("Paneer Tikka Roll Special")
                .category("snacks")
                .price(119.0)
                .vegetarian(true)
                .available(true)
                .build();

        MenuItem updated = MenuItem.builder()
                .id("dish-24")
                .name("Paneer Tikka Roll Special")
                .category("snacks")
                .price(119.0)
                .vegetarian(true)
                .available(true)
                .build();

        when(menuService.updateMenuItem(eq("dish-24"), any(UpdateMenuItemRequest.class))).thenReturn(updated);

        ResponseEntity<MenuItem> response = adminController.updateMenuItem("dish-24", request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Paneer Tikka Roll Special", response.getBody().getName());
    }

    @Test
    @DisplayName("Admin: toggles availability via /api/admin/menu/{id}/availability")
    void testToggleAvailability() {
        UpdateMenuAvailabilityRequest request = new UpdateMenuAvailabilityRequest(false);
        MenuItem toggled = MenuItem.builder()
                .id("dish-24")
                .name("Paneer Tikka Roll")
                .available(false)
                .build();

        when(menuService.toggleAvailability("dish-24", false)).thenReturn(toggled);

        ResponseEntity<MenuItem> response = adminController.toggleAvailability("dish-24", request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody().isAvailable());
    }

    @Test
    @DisplayName("Admin: deletes menu item via /api/admin/menu/{id}")
    void testDeleteMenuItem() {
        doNothing().when(menuService).deleteMenuItem("dish-24");

        ResponseEntity<java.util.Map<String, Object>> response = adminController.deleteMenuItem("dish-24");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Menu item deleted successfully", response.getBody().get("message"));
        verify(menuService, times(1)).deleteMenuItem("dish-24");
    }
}
