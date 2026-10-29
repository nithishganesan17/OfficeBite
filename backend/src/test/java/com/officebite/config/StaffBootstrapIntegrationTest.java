package com.officebite.config;

import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "BOOTSTRAP_STAFF_EMAIL=envstaff@officebite.com",
    "BOOTSTRAP_STAFF_PASSWORD=StaffPass123",
    "BOOTSTRAP_STAFF_NAME=Chef Env",
    "BOOTSTRAP_STAFF_EMPLOYEE_ID=ENV-01"
})
@Transactional
class StaffBootstrapIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private StaffBootstrapInitializer initializer;

    @Test
    @DisplayName("Verify Spring Boot resolves BOOTSTRAP_STAFF_EMAIL into initializer and persists BCrypt-hashed STAFF user")
    void testBootstrapExecution() {
        Optional<User> staffUser = userRepository.findByEmail("envstaff@officebite.com");
        assertTrue(staffUser.isPresent(), "Staff account should have been created on startup by StaffBootstrapInitializer");
        assertEquals(Role.STAFF, staffUser.get().getRole());
        assertEquals("Chef Env", staffUser.get().getName());
        assertEquals("ENV-01", staffUser.get().getEmployeeId());

        // Verify password is encrypted with BCrypt and matches
        assertNotNull(staffUser.get().getPasswordHash(), "Password hash must not be null");
        assertFalse(staffUser.get().getPasswordHash().contains("StaffPass123"), "Plain text password must NEVER be persisted");
        assertTrue(passwordEncoder.matches("StaffPass123", staffUser.get().getPasswordHash()), "BCrypt password encoder must match the raw bootstrap password");
    }
}
