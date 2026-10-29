package com.officebite.service;

import com.officebite.dto.CreateMenuItemRequest;
import com.officebite.dto.UpdateMenuItemRequest;
import com.officebite.exception.MenuItemInUseException;
import com.officebite.exception.ResourceNotFoundException;
import com.officebite.model.MenuItem;
import com.officebite.repository.MenuItemRepository;
import com.officebite.repository.OrderItemRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final OrderItemRepository orderItemRepository;

    public MenuService(MenuItemRepository menuItemRepository, OrderItemRepository orderItemRepository) {
        this.menuItemRepository = menuItemRepository;
        this.orderItemRepository = orderItemRepository;
    }

    /**
     * Seeds initial 23 canteen dishes into the database only if the table is currently empty.
     * Does not overwrite existing records on subsequent startups.
     */
    @PostConstruct
    @Transactional
    public void seedInitialMenuIfEmpty() {
        long count = menuItemRepository.count();
        if (count == 0) {
            log.info("Menu table is empty. Seeding 23 initial OfficeBite canteen dishes into database...");
            List<MenuItem> initialDishes = buildInitialDishes();
            menuItemRepository.saveAll(initialDishes);
            log.info("Successfully seeded {} dishes into MySQL database.", initialDishes.size());
        } else {
            log.info("Menu table already contains {} dishes. Checking for any missing catalog items...", count);
            List<MenuItem> initialDishes = buildInitialDishes();
            int addedCount = 0;
            for (MenuItem dish : initialDishes) {
                if (!menuItemRepository.existsById(dish.getId())) {
                    menuItemRepository.save(dish);
                    addedCount++;
                    log.info("Safely inserted missing menu item: {} ({})", dish.getId(), dish.getName());
                }
            }
            if (addedCount > 0) {
                log.info("Seeded {} previously missing dishes into MySQL.", addedCount);
            }
        }
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getMenuItemsByCategory(String category) {
        if (category == null || category.equalsIgnoreCase("all")) {
            return menuItemRepository.findAll();
        }
        return menuItemRepository.findByCategoryIgnoreCase(category);
    }

    public MenuItem getMenuItemById(String id) {
        return menuItemRepository.findById(id).orElse(null);
    }

    /**
     * Creates a new menu item adhering to existing ID conventions (dish-XX).
     * Strictly restricted to administrators.
     */
    @Transactional
    public MenuItem createMenuItem(CreateMenuItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Menu item request cannot be null.");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero.");
        }

        String rawCategory = request.getCategory() != null ? request.getCategory().trim() : "";
        String category = rawCategory.toLowerCase().replaceAll("\\s+", "-");
        String categoryName = deriveCategoryName(category, request.getCategoryName());

        // Generate next sequential ID following the dish-XX convention with collision protection
        int maxSuffix = menuItemRepository.findAll().stream()
                .map(MenuItem::getId)
                .filter(id -> id != null && id.startsWith("dish-"))
                .map(id -> {
                    try {
                        return Integer.parseInt(id.substring(5));
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .max(Integer::compareTo)
                .orElse(0);

        int candidateSuffix = maxSuffix + 1;
        while (menuItemRepository.existsById("dish-" + candidateSuffix)) {
            candidateSuffix++;
        }
        String newId = "dish-" + candidateSuffix;

        MenuItem item = MenuItem.builder()
                .id(newId)
                .name(request.getName().trim())
                .category(category)
                .categoryName(categoryName)
                .description(request.getDescription() != null ? request.getDescription().trim() : "")
                .price(request.getPrice())
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank()
                        ? request.getImageUrl().trim()
                        : "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80")
                .vegetarian(request.getVegetarian() != null ? request.getVegetarian() : true)
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .prepTime(request.getPrepTime() != null && !request.getPrepTime().isBlank() ? request.getPrepTime().trim() : "10 mins")
                .calories(request.getCalories() != null && !request.getCalories().isBlank() ? request.getCalories().trim() : "400 kcal")
                .badge(request.getBadge() != null && !request.getBadge().isBlank() ? request.getBadge().trim() : null)
                .isPopular(request.getIsPopular() != null ? request.getIsPopular() : false)
                .rating(4.8)
                .reviewsCount(0)
                .build();

        MenuItem saved = menuItemRepository.save(item);
        log.info("Created new menu item: id={}, name='{}', category='{}', price=₹{}", saved.getId(), saved.getName(), saved.getCategory(), saved.getPrice());
        return saved;
    }

    /**
     * Updates an existing menu item's details.
     */
    @Transactional
    public MenuItem updateMenuItem(String id, UpdateMenuItemRequest request) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Menu item ID cannot be empty.");
        }
        if (request == null) {
            throw new IllegalArgumentException("Update request cannot be null.");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero.");
        }

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        String rawCategory = request.getCategory() != null ? request.getCategory().trim() : "";
        String category = rawCategory.toLowerCase().replaceAll("\\s+", "-");
        String categoryName = deriveCategoryName(category, request.getCategoryName());

        item.setName(request.getName().trim());
        item.setCategory(category);
        item.setCategoryName(categoryName);
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        item.setPrice(request.getPrice());

        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            item.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getVegetarian() != null) {
            item.setVegetarian(request.getVegetarian());
        }
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        if (request.getPrepTime() != null) {
            item.setPrepTime(request.getPrepTime().trim());
        }
        if (request.getCalories() != null) {
            item.setCalories(request.getCalories().trim());
        }
        item.setBadge(request.getBadge() != null && !request.getBadge().isBlank() ? request.getBadge().trim() : null);
        if (request.getIsPopular() != null) {
            item.setPopular(request.getIsPopular());
        }

        MenuItem updated = menuItemRepository.save(item);
        log.info("Updated menu item: id={}, name='{}', available={}", updated.getId(), updated.getName(), updated.isAvailable());
        return updated;
    }

    /**
     * Toggles a menu item's availability (in stock / out of stock).
     */
    @Transactional
    public MenuItem toggleAvailability(String id, boolean available) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Menu item ID cannot be empty.");
        }
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        item.setAvailable(available);
        MenuItem updated = menuItemRepository.save(item);
        log.info("Toggled availability for menu item id={}: available={}", id, available);
        return updated;
    }

    /**
     * Deletes a menu item safely.
     * Prevents deletion if the item is referenced by existing customer orders.
     */
    @Transactional
    public void deleteMenuItem(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Menu item ID cannot be empty.");
        }
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + id));

        long orderReferences = orderItemRepository.countByMenuItemId(id);
        if (orderReferences > 0) {
            log.warn("Cannot delete menu item '{}' ({}) because it is referenced in {} existing order(s).",
                    item.getName(), id, orderReferences);
            throw new MenuItemInUseException(
                    "Cannot delete dish '" + item.getName() + "' because it is referenced in " + orderReferences
                            + " existing order(s). Mark it as out of stock (unavailable) instead to preserve customer order history.");
        }

        menuItemRepository.delete(item);
        log.info("Successfully deleted menu item: id={}, name='{}'", id, item.getName());
    }

    private String deriveCategoryName(String category, String categoryName) {
        if (categoryName != null && !categoryName.isBlank()) {
            return categoryName.trim();
        }
        if (category == null || category.isBlank()) {
            return "General";
        }
        return switch (category.toLowerCase().trim()) {
            case "indian-meals" -> "Indian Meals";
            case "dosa" -> "Dosa & Crepes";
            case "idli" -> "Idli Specials";
            case "biryani" -> "Dum Biryani";
            case "rice-bowls" -> "Rice Bowls";
            case "sandwiches" -> "Sandwiches";
            case "snacks" -> "Crispy Snacks";
            case "coffee" -> "Filter Coffee & Tea";
            case "juice" -> "Fresh Juices";
            case "desserts" -> "Desserts";
            default -> {
                String[] words = category.split("[-_\\s]+");
                StringBuilder sb = new StringBuilder();
                for (String w : words) {
                    if (!w.isBlank()) {
                        sb.append(Character.toUpperCase(w.charAt(0)))
                                .append(w.substring(1).toLowerCase())
                                .append(" ");
                    }
                }
                yield sb.toString().trim();
            }
        };
    }

    private List<MenuItem> buildInitialDishes() {
        List<MenuItem> list = new ArrayList<>();

        // --- Indian Meals ---
        list.add(MenuItem.builder()
                .id("dish-1")
                .name("Deluxe North Indian Thali")
                .category("indian-meals")
                .categoryName("Indian Meals")
                .description("Slow-cooked Paneer Butter Masala, Dal Makhani, 2 Butter Rotis, fragrant Jeera Rice, Gulab Jamun, Papad & Mint Salad.")
                .price(180.0)
                .imageUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(342)
                .prepTime("15 mins")
                .calories("680 kcal")
                .badge("Bestseller")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-2")
                .name("Executive South Indian Thali")
                .category("indian-meals")
                .categoryName("Indian Meals")
                .description("Steamed Sona Masoori Rice, Madras Sambar, Pepper Rasam, Poriyal, Kootu, Curd, Crispy Appalam & Semiya Payasam.")
                .price(160.0)
                .imageUrl("https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(228)
                .prepTime("12 mins")
                .calories("590 kcal")
                .badge("Healthy Choice")
                .isPopular(false)
                .build());

        list.add(MenuItem.builder()
                .id("dish-3")
                .name("Paneer Tikka Rice Platter")
                .category("indian-meals")
                .categoryName("Indian Meals")
                .description("Char-grilled cottage cheese skewers in smoky tandoori marinade, served over spiced saffron pilaf with fresh mint raita.")
                .price(175.0)
                .imageUrl("https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.7)
                .reviewsCount(185)
                .prepTime("14 mins")
                .calories("540 kcal")
                .badge("High Protein")
                .isPopular(true)
                .build());

        // --- Dosa & Crepes ---
        list.add(MenuItem.builder()
                .id("dish-4")
                .name("Mysore Masala Dosa")
                .category("dosa")
                .categoryName("Dosa & Crepes")
                .description("Crisp golden fermented rice crepe layered with spicy red garlic-chili chutney, stuffed with tempered potato mash, served with 3 chutneys & sambar.")
                .price(110.0)
                .imageUrl("https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(412)
                .prepTime("10 mins")
                .calories("380 kcal")
                .badge("Crowd Favorite")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-5")
                .name("Ghee Roast Paper Dosa")
                .category("dosa")
                .categoryName("Dosa & Crepes")
                .description("Ultra-thin, paper-crisp golden dosa roasted with pure desi ghee, dusted with aromatic gun powder (karam podi).")
                .price(125.0)
                .imageUrl("https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(198)
                .prepTime("8 mins")
                .calories("420 kcal")
                .badge("Desi Ghee")
                .isPopular(false)
                .build());

        list.add(MenuItem.builder()
                .id("dish-6")
                .name("Paneer Bhurji Stuffed Dosa")
                .category("dosa")
                .categoryName("Dosa & Crepes")
                .description("Crunchy golden crepe stuffed with fresh crumbled paneer tossed with cumin, green chilies, onions, and fresh coriander.")
                .price(145.0)
                .imageUrl("https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.7)
                .reviewsCount(164)
                .prepTime("12 mins")
                .calories("450 kcal")
                .badge("Chef Special")
                .isPopular(false)
                .build());

        // --- Idli Specials ---
        list.add(MenuItem.builder()
                .id("dish-7")
                .name("Ghee Podi Button Idlis (14 pcs)")
                .category("idli")
                .categoryName("Idli Specials")
                .description("Bite-sized pillow-soft steamed idlis tossed generously in hot melted ghee and roasted spicy lentil gunpowder.")
                .price(95.0)
                .imageUrl("https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(310)
                .prepTime("8 mins")
                .calories("320 kcal")
                .badge("Bestseller")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-8")
                .name("Classic Steamed Idli-Vada Combo")
                .category("idli")
                .categoryName("Idli Specials")
                .description("Two fluffy steamed rice cakes paired with one crunchy golden medu vada, served with piping hot piping sambar & mint chutney.")
                .price(85.0)
                .imageUrl("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(280)
                .prepTime("7 mins")
                .calories("340 kcal")
                .badge("Morning Star")
                .isPopular(false)
                .build());

        // --- Dum Biryani ---
        list.add(MenuItem.builder()
                .id("dish-9")
                .name("Royal Veg Dum Biryani")
                .category("biryani")
                .categoryName("Dum Biryani")
                .description("Long-grain aged basmati rice slow-cooked in handi with seasonal vegetables, brown onions, saffron, and fresh mint. Served with cucumber raita.")
                .price(195.0)
                .imageUrl("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(520)
                .prepTime("15 mins")
                .calories("580 kcal")
                .badge("Chef Signature")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-10")
                .name("Paneer Makhani Biryani Bowl")
                .category("biryani")
                .categoryName("Dum Biryani")
                .description("Marinated soft paneer cubes cooked in velvet makhani gravy layered with spiced basmati biryani rice and toasted cashews.")
                .price(215.0)
                .imageUrl("https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(290)
                .prepTime("15 mins")
                .calories("640 kcal")
                .badge("Rich & Creamy")
                .isPopular(false)
                .build());

        // --- Rice Bowls ---
        list.add(MenuItem.builder()
                .id("dish-11")
                .name("Dal Makhani & Jeera Rice Bowl")
                .category("rice-bowls")
                .categoryName("Rice Bowls")
                .description("24-hour slow-simmered black urad lentils infused with butter, cream, and ginger, served alongside fluffy jeera rice and sirka onions.")
                .price(140.0)
                .imageUrl("https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(375)
                .prepTime("10 mins")
                .calories("490 kcal")
                .badge("Comfort Bowl")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-12")
                .name("Punjabi Rajma Chawal Bowl")
                .category("rice-bowls")
                .categoryName("Rice Bowls")
                .description("Homestyle red kidney beans slow-braised in a roasted onion-tomato gravy, served over steaming basmati rice with lime & green chili.")
                .price(135.0)
                .imageUrl("https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(260)
                .prepTime("10 mins")
                .calories("460 kcal")
                .badge("Classic")
                .isPopular(false)
                .build());

        list.add(MenuItem.builder()
                .id("dish-13")
                .name("Amritsari Chole Rice Bowl")
                .category("rice-bowls")
                .categoryName("Rice Bowls")
                .description("Dark, tangy chickpeas stewed with tea leaves and roasted spices, paired with fragrant basmati rice and tangy kachumber salad.")
                .price(140.0)
                .imageUrl("https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.7)
                .reviewsCount(195)
                .prepTime("10 mins")
                .calories("470 kcal")
                .badge("Spicy Delight")
                .isPopular(false)
                .build());

        // --- Sandwiches ---
        list.add(MenuItem.builder()
                .id("dish-14")
                .name("Bombay Grilled Veg Club Sandwich")
                .category("sandwiches")
                .categoryName("Sandwiches")
                .description("Triple-decker grilled sandwich packed with spiced potato masala, crisp cucumber, ripe tomatoes, Amul cheese & spicy mint chutney.")
                .price(110.0)
                .imageUrl("https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(380)
                .prepTime("10 mins")
                .calories("390 kcal")
                .badge("Office Favorite")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-15")
                .name("Paneer Tikka Focaccia Melt")
                .category("sandwiches")
                .categoryName("Sandwiches")
                .description("Artisan rosemary focaccia filled with tandoori paneer, caramelized onions, capsicum, and melted mozzarella.")
                .price(135.0)
                .imageUrl("https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(215)
                .prepTime("12 mins")
                .calories("440 kcal")
                .badge("Artisan")
                .isPopular(false)
                .build());

        // --- Snacks ---
        list.add(MenuItem.builder()
                .id("dish-16")
                .name("Punjabi Samosa Platter (2 pcs)")
                .category("snacks")
                .categoryName("Crispy Snacks")
                .description("Golden, flaky handmade pastry crust stuffed with spiced potatoes, green peas, and cashews. Served with tamarind & spicy mint dips.")
                .price(60.0)
                .imageUrl("https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(460)
                .prepTime("5 mins")
                .calories("280 kcal")
                .badge("Evening Hit")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-17")
                .name("Crispy Medu Vada (2 pcs)")
                .category("snacks")
                .categoryName("Crispy Snacks")
                .description("Crispy golden fried lentil donuts with a soft, airy center, seasoned with black pepper, curry leaves, and ginger. Served with hot sambar.")
                .price(70.0)
                .imageUrl("https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.7)
                .reviewsCount(185)
                .prepTime("6 mins")
                .calories("260 kcal")
                .badge("Crispy Gold")
                .isPopular(false)
                .build());

        // --- Coffee & Tea ---
        list.add(MenuItem.builder()
                .id("dish-18")
                .name("Madras Filter Coffee (Traditional Tumbler)")
                .category("coffee")
                .categoryName("Filter Coffee & Tea")
                .description("Authentic South Indian chicory blend decoction poured back and forth with frothy full-cream milk in a traditional stainless tumbler.")
                .price(40.0)
                .imageUrl("https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.95)
                .reviewsCount(620)
                .prepTime("4 mins")
                .calories("110 kcal")
                .badge("Top Rated")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-19")
                .name("Cold Brew Hazelnut Latte")
                .category("coffee")
                .categoryName("Filter Coffee & Tea")
                .description("16-hour slow steeped Arabica cold brew poured over ice, lightly sweetened with roasted hazelnut syrup and chilled oat milk.")
                .price(95.0)
                .imageUrl("https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(240)
                .prepTime("3 mins")
                .calories("140 kcal")
                .badge("Energizing")
                .isPopular(false)
                .build());

        // --- Fresh Juices ---
        list.add(MenuItem.builder()
                .id("dish-20")
                .name("Cold-Pressed Valencia Orange Juice")
                .category("juice")
                .categoryName("Fresh Juices")
                .description("100% natural, freshly squeezed sweet citrus juice with zero added sugar or preservatives. Rich in immunity-boosting Vitamin C.")
                .price(95.0)
                .imageUrl("https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(310)
                .prepTime("5 mins")
                .calories("110 kcal")
                .badge("100% Pure")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-21")
                .name("Watermelon Mint Hydration Cooler")
                .category("juice")
                .categoryName("Fresh Juices")
                .description("Fresh seedless watermelon crushed with garden mint leaves, a squeeze of key lime, and Himalayan pink rock salt.")
                .price(80.0)
                .imageUrl("https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.8)
                .reviewsCount(195)
                .prepTime("4 mins")
                .calories("75 kcal")
                .badge("Refreshing")
                .isPopular(false)
                .build());

        // --- Desserts ---
        list.add(MenuItem.builder()
                .id("dish-22")
                .name("Warm Shahi Gulab Jamun (2 pcs)")
                .category("desserts")
                .categoryName("Desserts")
                .description("Golden brown fried khoya dumplings soaked in fragrant green cardamom and saffron rose syrup, garnished with slivered pistachios.")
                .price(65.0)
                .imageUrl("https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(380)
                .prepTime("3 mins")
                .calories("240 kcal")
                .badge("Melt-in-Mouth")
                .isPopular(true)
                .build());

        list.add(MenuItem.builder()
                .id("dish-23")
                .name("Royal Kesar Pista Rasmalai (2 pcs)")
                .category("desserts")
                .categoryName("Desserts")
                .description("Delicate, spongy cottage cheese patties steeped in thickened saffron-infused whole milk with crushed pistachios & almonds.")
                .price(85.0)
                .imageUrl("https://images.unsplash.com/photo-1505253758473-96b46deae27c?auto=format&fit=crop&w=800&q=80")
                .vegetarian(true)
                .available(true)
                .rating(4.9)
                .reviewsCount(290)
                .prepTime("3 mins")
                .calories("210 kcal")
                .badge("Chef Choice")
                .isPopular(false)
                .build());

        return list;
    }
}
