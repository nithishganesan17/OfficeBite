package com.officebite.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "menu_items")
public class MenuItem {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    private String id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "category_name", length = 80)
    private String categoryName;

    @Column(name = "vegetarian", nullable = false)
    private boolean vegetarian;

    @Column(name = "available", nullable = false)
    private boolean available;

    @Column(name = "rating")
    private double rating;

    @Column(name = "reviews_count")
    private int reviewsCount;

    @Column(name = "prep_time", length = 30)
    private String prepTime;

    @Column(name = "calories", length = 30)
    private String calories;

    @Column(name = "badge", length = 50)
    private String badge;

    @Column(name = "is_popular")
    private boolean isPopular;

    // Compatibility getters for frontend JSON response fields
    public String getImage() {
        return imageUrl;
    }

    public boolean isVeg() {
        return vegetarian;
    }

    public boolean isAvailable() {
        return available;
    }
}
