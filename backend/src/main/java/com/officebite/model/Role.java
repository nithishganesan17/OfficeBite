package com.officebite.model;

/**
 * Access roles for OfficeBite user accounts.
 * - CUSTOMER: Default role for corporate employees ordering food.
 * - STAFF: Canteen kitchen staff operating the preparation dashboard.
 * - ADMIN: Canteen management overseeing menu, operations, and staff.
 */
public enum Role {
    CUSTOMER,
    STAFF,
    ADMIN;

    /**
     * Returns the Spring Security authority representation (e.g., "ROLE_CUSTOMER").
     */
    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
