package com.officebite.exception;

/**
 * Thrown when an administrative operation cannot delete a menu item
 * because it is referenced by existing customer orders.
 */
public class MenuItemInUseException extends RuntimeException {

    public MenuItemInUseException(String message) {
        super(message);
    }
}
