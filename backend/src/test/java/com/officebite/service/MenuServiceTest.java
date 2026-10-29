package com.officebite.service;

import com.officebite.dto.CreateMenuItemRequest;
import com.officebite.dto.UpdateMenuItemRequest;
import com.officebite.exception.MenuItemInUseException;
import com.officebite.exception.ResourceNotFoundException;
import com.officebite.model.MenuItem;
import com.officebite.repository.MenuItemRepository;
import com.officebite.repository.OrderItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private MenuService menuService;

    private MenuItem sampleItem;

    @BeforeEach
    void setUp() {
        sampleItem = MenuItem.builder()
                .id("dish-1")
                .name("Deluxe North Indian Thali")
                .description("Complete meal with paneer, dal, and roti")
                .price(180.0)
                .category("indian-meals")
                .categoryName("Indian Meals")
                .imageUrl("/images/thali.jpg")
                .vegetarian(true)
                .available(true)
                .prepTime("20 mins")
                .calories("650 kcal")
                .badge("Bestseller")
                .isPopular(true)
                .build();
    }

    @Test
    @DisplayName("getAllMenuItems returns all items from repository")
    void testGetAllMenuItems() {
        when(menuItemRepository.findAll()).thenReturn(List.of(sampleItem));

        List<MenuItem> items = menuService.getAllMenuItems();

        assertEquals(1, items.size());
        assertEquals("Deluxe North Indian Thali", items.get(0).getName());
        verify(menuItemRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getMenuItemById returns item when found")
    void testGetMenuItemById_found() {
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(sampleItem));

        MenuItem found = menuService.getMenuItemById("dish-1");

        assertNotNull(found);
        assertEquals("dish-1", found.getId());
    }

    @Test
    @DisplayName("getMenuItemById returns null when missing")
    void testGetMenuItemById_notFound() {
        when(menuItemRepository.findById("dish-999")).thenReturn(Optional.empty());

        MenuItem found = menuService.getMenuItemById("dish-999");
        assertNull(found);
    }

    @Test
    @DisplayName("createMenuItem computes next sequential ID based on existing items")
    void testCreateMenuItem_computesSequentialId() {
        MenuItem item1 = MenuItem.builder().id("dish-5").name("Dish 5").build();
        MenuItem item2 = MenuItem.builder().id("dish-23").name("Dish 23").build();
        when(menuItemRepository.findAll()).thenReturn(List.of(item1, item2));

        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Kathi Roll")
                .category("snacks")
                .price(90.0)
                .vegetarian(true)
                .available(true)
                .prepTime("15 mins")
                .calories("350 kcal")
                .build();

        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MenuItem created = menuService.createMenuItem(request);

        assertNotNull(created);
        assertEquals("dish-24", created.getId());
        assertEquals("Kathi Roll", created.getName());
        assertEquals("Crispy Snacks", created.getCategoryName());
        assertEquals(90.0, created.getPrice());
        assertTrue(created.isVegetarian());
        assertTrue(created.isAvailable());
    }

    @Test
    @DisplayName("createMenuItem starts with dish-1 if repository is empty")
    void testCreateMenuItem_firstItem() {
        when(menuItemRepository.findAll()).thenReturn(List.of());
        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .name("Masala Dosa")
                .category("dosa")
                .price(70.0)
                .build();

        MenuItem created = menuService.createMenuItem(request);

        assertEquals("dish-1", created.getId());
    }

    @Test
    @DisplayName("updateMenuItem updates all item fields correctly")
    void testUpdateMenuItem_success() {
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(sampleItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateMenuItemRequest updateRequest = UpdateMenuItemRequest.builder()
                .name("Super Deluxe Thali")
                .description("Updated description with gulab jamun")
                .category("indian-meals")
                .price(210.0)
                .imageUrl("/images/updated-thali.jpg")
                .vegetarian(true)
                .available(true)
                .prepTime("25 mins")
                .calories("700 kcal")
                .badge("Chef Special")
                .isPopular(true)
                .build();

        MenuItem updated = menuService.updateMenuItem("dish-1", updateRequest);

        assertEquals("Super Deluxe Thali", updated.getName());
        assertEquals(210.0, updated.getPrice());
        assertEquals("25 mins", updated.getPrepTime());
        assertEquals("Chef Special", updated.getBadge());
    }

    @Test
    @DisplayName("toggleAvailability updates availability status")
    void testToggleAvailability_success() {
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(sampleItem));
        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MenuItem toggled = menuService.toggleAvailability("dish-1", false);

        assertFalse(toggled.isAvailable());
    }

    @Test
    @DisplayName("deleteMenuItem succeeds when item is not in any order")
    void testDeleteMenuItem_safeSuccess() {
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(sampleItem));
        when(orderItemRepository.countByMenuItemId("dish-1")).thenReturn(0L);

        menuService.deleteMenuItem("dish-1");

        verify(menuItemRepository, times(1)).delete(sampleItem);
    }

    @Test
    @DisplayName("deleteMenuItem throws MenuItemInUseException when referenced in existing orders")
    void testDeleteMenuItem_inUseThrowsConflict() {
        when(menuItemRepository.findById("dish-1")).thenReturn(Optional.of(sampleItem));
        when(orderItemRepository.countByMenuItemId("dish-1")).thenReturn(3L);

        MenuItemInUseException ex = assertThrows(MenuItemInUseException.class, () -> menuService.deleteMenuItem("dish-1"));

        assertTrue(ex.getMessage().contains("Cannot delete dish 'Deluxe North Indian Thali'"));
        assertTrue(ex.getMessage().contains("3 existing order(s)"));
        verify(menuItemRepository, never()).delete(any());
    }
}
