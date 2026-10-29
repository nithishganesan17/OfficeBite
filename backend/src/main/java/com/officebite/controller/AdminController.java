package com.officebite.controller;

import com.officebite.dto.CreateMenuItemRequest;
import com.officebite.dto.CreateUserRequest;
import com.officebite.dto.UpdateMenuAvailabilityRequest;
import com.officebite.dto.UpdateMenuItemRequest;
import com.officebite.dto.UserProfileResponse;
import com.officebite.model.MenuItem;
import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.UserRepository;
import com.officebite.service.MenuService;
import com.officebite.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller strictly reserved for administrative operations.
 * Enforces ADMIN role on all endpoints via Spring Security.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final MenuService menuService;

    public AdminController(UserService userService, UserRepository userRepository, MenuService menuService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.menuService = menuService;
    }

    /**
     * POST /api/admin/users
     * Provisions privileged user accounts (STAFF or ADMIN).
     * Strictly restricted to administrators.
     */
    @PostMapping("/users")
    public ResponseEntity<UserProfileResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User createdUser = userService.createPrivilegedUser(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getEmployeeId(),
                request.getRole()
        );

        UserProfileResponse response = UserProfileResponse.builder()
                .id(createdUser.getId())
                .name(createdUser.getName())
                .email(createdUser.getEmail())
                .role(createdUser.getRole())
                .employeeId(createdUser.getEmployeeId())
                .createdAt(createdUser.getCreatedAt())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/admin/users
     * Lists users, optionally filtered by role.
     * Strictly restricted to administrators.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getUsers(@RequestParam(required = false) Role role) {
        List<User> users = (role != null)
                ? userRepository.findByRole(role)
                : userRepository.findAll();

        List<UserProfileResponse> responses = users.stream()
                .map(u -> UserProfileResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .employeeId(u.getEmployeeId())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/admin/menu
     * Returns full menu catalog for admin management.
     */
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getAdminMenu(
            @RequestParam(required = false) String category) {
        List<MenuItem> items = menuService.getMenuItemsByCategory(category);
        return ResponseEntity.ok(items);
    }

    /**
     * POST /api/admin/menu
     * Creates a new dish in the canteen catalog.
     */
    @PostMapping("/menu")
    public ResponseEntity<MenuItem> createMenuItem(@Valid @RequestBody CreateMenuItemRequest request) {
        MenuItem created = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/admin/menu/{id}
     * Updates an existing dish's catalog details.
     */
    @PutMapping("/menu/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable String id,
            @Valid @RequestBody UpdateMenuItemRequest request) {
        MenuItem updated = menuService.updateMenuItem(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/admin/menu/{id}/availability
     * Toggles a dish's in-stock / out-of-stock availability status.
     */
    @PatchMapping("/menu/{id}/availability")
    public ResponseEntity<MenuItem> toggleAvailability(
            @PathVariable String id,
            @Valid @RequestBody UpdateMenuAvailabilityRequest request) {
        MenuItem updated = menuService.toggleAvailability(id, request.getAvailable());
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/admin/menu/{id}
     * Deletes a dish safely. Fails with 409 Conflict if referenced in existing orders.
     */
    @DeleteMapping("/menu/{id}")
    public ResponseEntity<Map<String, Object>> deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Menu item deleted successfully");
        response.put("id", id);
        return ResponseEntity.ok(response);
    }
}

