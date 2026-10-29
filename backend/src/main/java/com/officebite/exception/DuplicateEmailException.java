package com.officebite.exception;

/**
 * Thrown when attempting to register or create an account with an email that already exists.
 */
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
