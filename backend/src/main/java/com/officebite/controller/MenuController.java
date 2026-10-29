package com.officebite.controller;

import com.officebite.dto.CreateMenuItemRequest;
import com.officebite.dto.UpdateMenuAvailabilityRequest;
import com.officebite.dto.UpdateMenuItemRequest;
import com.officebite.model.MenuItem;
import com.officebite.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    /**
     * GET /api/menu
     * Returns full food menu catalog as a JSON array.
     * Publicly accessible for browsing.
     */
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getMenu(
            @RequestParam(required = false) String category) {
        List<MenuItem> items = menuService.getMenuItemsByCategory(category);
        return ResponseEntity.ok(items);
    }

    /**
     * GET /api/menu/{id}
     * Returns single food item details.
     * Publicly accessible for dish detail views.
     */
    @GetMapping("/menu/{id}")
    public ResponseEntity<?> getMenuItem(@PathVariable String id) {
        MenuItem item = menuService.getMenuItemById(id);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(item);
    }

    /**
     * POST /api/menu
     * Creates a new menu item in the canteen catalog.
     * Strictly restricted to administrators.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/menu")
    public ResponseEntity<MenuItem> createMenuItem(@Valid @RequestBody CreateMenuItemRequest request) {
        MenuItem created = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/menu/{id}
     * Updates an existing menu item in the canteen catalog.
     * Strictly restricted to administrators.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/menu/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable String id,
            @Valid @RequestBody UpdateMenuItemRequest request) {
        MenuItem updated = menuService.updateMenuItem(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/menu/{id}/availability
     * Toggles a dish's in-stock / out-of-stock availability status.
     * Strictly restricted to administrators.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/menu/{id}/availability")
    public ResponseEntity<MenuItem> toggleAvailability(
            @PathVariable String id,
            @Valid @RequestBody UpdateMenuAvailabilityRequest request) {
        MenuItem updated = menuService.toggleAvailability(id, request.getAvailable());
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/menu/{id}
     * Deletes a menu item safely.
     * Fails with 409 Conflict if dish is referenced in existing customer orders.
     * Strictly restricted to administrators.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/menu/{id}")
    public ResponseEntity<Map<String, Object>> deleteMenuItem(@PathVariable String id) {
        menuService.deleteMenuItem(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Menu item deleted successfully");
        response.put("id", id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/health
     * Simple health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "OfficeBite Canteen API");
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }
}

