package com.officebite.model;

import java.util.EnumSet;
import java.util.Set;

/**
 * Lifecycle states for an OfficeBite canteen order.
 */
public enum OrderStatus {
    PLACED,
    ACCEPTED,
    PREPARING,
    READY,
    COMPLETED,
    REJECTED;

    /**
     * Enforces valid status progression.
     * Prevents arbitrary or backwards status mutations.
     *
     * @param target the desired next status
     * @return true if the transition is allowed
     */
    public boolean canTransitionTo(OrderStatus target) {
        if (target == null || this == target) {
            return false;
        }
        return switch (this) {
            case PLACED -> target == ACCEPTED || target == PREPARING || target == REJECTED;
            case ACCEPTED -> target == PREPARING || target == REJECTED;
            case PREPARING -> target == READY || target == REJECTED;
            case READY -> target == COMPLETED;
            case COMPLETED, REJECTED -> false; // Terminal states cannot be changed
        };
    }

    /**
     * Returns the set of valid next states from this state.
     */
    public Set<OrderStatus> getValidNextStatuses() {
        return switch (this) {
            case PLACED -> EnumSet.of(ACCEPTED, PREPARING, REJECTED);
            case ACCEPTED -> EnumSet.of(PREPARING, REJECTED);
            case PREPARING -> EnumSet.of(READY, REJECTED);
            case READY -> EnumSet.of(COMPLETED);
            case COMPLETED, REJECTED -> EnumSet.noneOf(OrderStatus.class);
        };
    }
}
