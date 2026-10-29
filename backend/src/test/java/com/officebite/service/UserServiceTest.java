package com.officebite.service;

import com.officebite.exception.DuplicateEmailException;
import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Email normalization: trims whitespace and converts to lowercase")
    void testNormalizeEmail_trimsAndLowercases() {
        assertEquals("rahul.sharma@officebite.com",
                UserService.normalizeEmail("  Rahul.Sharma@OfficeBite.COM  "));
        assertEquals("user@domain.com",
                UserService.normalizeEmail("USER@DOMAIN.COM"));
        assertEquals("test.user@company.co.in",
                UserService.normalizeEmail(" test.user@company.co.in "));
    }

    @Test
    @DisplayName("Email normalization: null or blank email throws IllegalArgumentException")
    void testNormalizeEmail_nullOrBlankThrows() {
        assertThrows(IllegalArgumentException.class, () -> UserService.normalizeEmail(null));
        assertThrows(IllegalArgumentException.class, () -> UserService.normalizeEmail(""));
        assertThrows(IllegalArgumentException.class, () -> UserService.normalizeEmail("   "));
    }

    @Test
    @DisplayName("Password hashing: raw password is encrypted with BCrypt and matches verification")
    void testPasswordHashing_hashesAndMatches() {
        when(userRepository.existsByEmail("priya@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        User user = userService.createCustomerUser("Priya Nair", "Priya@Example.COM", "SecurePass123!", "OB-4512");

        assertNotNull(user);
        assertEquals("priya@example.com", user.getEmail());
        assertEquals(Role.CUSTOMER, user.getRole());

        // Password hash must NOT be plain text
        assertNotEquals("SecurePass123!", user.getPasswordHash());
        assertTrue(user.getPasswordHash().startsWith("$2a$") || user.getPasswordHash().startsWith("$2b$"));

        // Must verify against raw password
        assertTrue(userService.verifyPassword("SecurePass123!", user.getPasswordHash()));
        assertFalse(userService.verifyPassword("WrongPassword", user.getPasswordHash()));
    }

    @Test
    @DisplayName("Duplicate email handling: duplicate registration throws DuplicateEmailException")
    void testDuplicateEmail_throwsDuplicateEmailException() {
        when(userRepository.existsByEmail("rahul@example.com")).thenReturn(true);

        DuplicateEmailException ex = assertThrows(DuplicateEmailException.class, () ->
                userService.createCustomerUser("Rahul Sharma", "rahul@example.com", "Password123", "OB-7821"));

        assertTrue(ex.getMessage().contains("already exists"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Duplicate email handling: case-insensitive duplicate correctly detected")
    void testCaseInsensitiveDuplicateEmail_throwsDuplicateEmailException() {
        when(userRepository.existsByEmail("john@officebite.com")).thenReturn(true);

        // Attempt registration with mixed-case email
        DuplicateEmailException ex = assertThrows(DuplicateEmailException.class, () ->
                userService.createCustomerUser("John Doe", "  JOHN@OfficeBite.COM ", "Secret12345", null));

        assertTrue(ex.getMessage().contains("john@officebite.com"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Role enforcement: createCustomerUser strictly enforces CUSTOMER role")
    void testCreateCustomerUser_strictlyCustomerRole() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        userService.createCustomerUser("Test User", "user@example.com", "StrongPassword99", null);

        User saved = captor.getValue();
        assertEquals(Role.CUSTOMER, saved.getRole(), "Customer user must always have CUSTOMER role");
    }

    @Test
    @DisplayName("Privileged user provisioning: supports creating STAFF and ADMIN roles")
    void testCreatePrivilegedUser_staffAndAdmin() {
        when(userRepository.existsByEmail("chef@officebite.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User staffUser = userService.createPrivilegedUser("Master Chef", "chef@officebite.com", "KitchenChef2026", "OB-K01", Role.STAFF);
        assertEquals(Role.STAFF, staffUser.getRole());

        when(userRepository.existsByEmail("admin@officebite.com")).thenReturn(false);
        User adminUser = userService.createPrivilegedUser("Canteen Admin", "admin@officebite.com", "AdminSecret2026", "OB-A01", Role.ADMIN);
        assertEquals(Role.ADMIN, adminUser.getRole());
    }

    @Test
    @DisplayName("Validation: password shorter than 6 characters throws IllegalArgumentException")
    void testPasswordTooShort_throwsException() {
        assertThrows(IllegalArgumentException.class, () ->
                userService.createCustomerUser("Short Pass", "short@example.com", "12345", null));
    }

    @Test
    @DisplayName("Lookup: findByEmail normalizes search input before repository query")
    void testFindByEmail_normalizesBeforeQuery() {
        User mockUser = User.builder().id(1L).email("rahul@example.com").build();
        when(userRepository.findByEmail("rahul@example.com")).thenReturn(Optional.of(mockUser));

        Optional<User> found = userService.findByEmail("  RAHUL@EXAMPLE.COM  ");

        assertTrue(found.isPresent());
        assertEquals("rahul@example.com", found.get().getEmail());
        verify(userRepository).findByEmail("rahul@example.com");
    }
}
