package com.officebite.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload for toggling a menu item's availability (in stock / out of stock).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuAvailabilityRequest {

    @NotNull(message = "Availability flag is required")
    private Boolean available;
}
