package com.officebite.dto;

import com.officebite.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Safe public user profile response.
 * Never includes passwordHash or internal sensitive security fields.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private String employeeId;
    private LocalDateTime createdAt;
}
