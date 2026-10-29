package com.officebite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload for updating an existing menu item.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuItemRequest {

    @NotBlank(message = "Dish name is required")
    @Size(max = 150, message = "Dish name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @Size(max = 80, message = "Category display name cannot exceed 80 characters")
    private String categoryName;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private Double price;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Size(max = 1000, message = "Image URL cannot exceed 1000 characters")
    private String imageUrl;

    @NotNull(message = "Vegetarian flag is required")
    private Boolean vegetarian;

    @NotNull(message = "Availability flag is required")
    private Boolean available;

    @Size(max = 30, message = "Preparation time cannot exceed 30 characters")
    private String prepTime;

    @Size(max = 30, message = "Calories cannot exceed 30 characters")
    private String calories;

    @Size(max = 50, message = "Badge cannot exceed 50 characters")
    private String badge;

    private Boolean isPopular;
}
