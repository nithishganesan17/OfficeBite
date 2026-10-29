package com.officebite.service;

import com.officebite.exception.DuplicateEmailException;
import com.officebite.exception.ResourceNotFoundException;
import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Normalizes an email address by trimming whitespace and converting to lowercase.
     * Enforces case-insensitive uniqueness across user accounts.
     *
     * @param email Raw email string
     * @return Trimmed and lowercased email string
     * @throws IllegalArgumentException if email is null or blank
     */
    public static String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email address cannot be empty.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    /**
     * Retrieves a user by their email address using case-insensitive normalized lookup.
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        String normalized = normalizeEmail(email);
        return userRepository.findByEmail(normalized);
    }

    /**
     * Checks if a user account already exists with the given email address.
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String normalized = normalizeEmail(email);
        return userRepository.existsByEmail(normalized);
    }

    /**
     * Retrieves a user by their database ID.
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    /**
     * Creates a customer user account.
     * Strictly enforces the CUSTOMER role. Public registration cannot grant STAFF or ADMIN privileges.
     * Plain-text passwords are never stored; they are securely hashed using BCrypt.
     */
    @Transactional
    public User createCustomerUser(String name, String email, String rawPassword, String employeeId) {
        return createUserInternal(name, email, rawPassword, employeeId, Role.CUSTOMER);
    }

    /**
     * Creates a privileged user account (STAFF or ADMIN).
     * Must only be invoked through administrative/internal provisioning workflows.
     */
    @Transactional
    public User createPrivilegedUser(String name, String email, String rawPassword, String employeeId, Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Privileged role must not be null.");
        }
        return createUserInternal(name, email, rawPassword, employeeId, role);
    }

    /**
     * Verifies whether a raw password matches the stored BCrypt password hash.
     */
    public boolean verifyPassword(String rawPassword, String passwordHash) {
        if (rawPassword == null || passwordHash == null) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, passwordHash);
    }

    private User createUserInternal(String name, String email, String rawPassword, String employeeId, Role role) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("User name cannot be empty.");
        }
        if (rawPassword == null || rawPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("An account with email '" + normalizedEmail + "' already exists.");
        }

        // Hash password securely with BCrypt
        String passwordHash = passwordEncoder.encode(rawPassword);

        User user = User.builder()
                .name(name.trim())
                .email(normalizedEmail)
                .passwordHash(passwordHash)
                .role(role)
                .employeeId(employeeId != null && !employeeId.isBlank() ? employeeId.trim() : null)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created user account id={}, email={}, role={}", savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        return savedUser;
    }
}
