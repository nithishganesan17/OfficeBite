package com.officebite.service;

import com.officebite.model.Role;
import com.officebite.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String validSecret = "officebite-test-super-secret-key-that-is-at-least-256-bits-long-2026!";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretString", validSecret);
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3600000L); // 1 hour
        jwtService.init();
    }

    @Test
    @DisplayName("Token generation and validation: signed JWT contains correct subject and role claims")
    void testTokenGenerationAndValidation() {
        User user = User.builder()
                .id(1L)
                .name("Rahul Sharma")
                .email("rahul@officebite.com")
                .role(Role.CUSTOMER)
                .employeeId("OB-7821")
                .build();

        String token = jwtService.generateToken(user);
        assertNotNull(token);
        assertFalse(token.isBlank());

        assertTrue(jwtService.validateToken(token));
        assertEquals("rahul@officebite.com", jwtService.extractEmail(token));
        assertEquals("CUSTOMER", jwtService.extractRole(token));
    }

    @Test
    @DisplayName("Token tampering: modified payload or signature fails validation")
    void testTokenTampering_failsValidation() {
        User user = User.builder()
                .id(2L)
                .name("Staff Member")
                .email("staff@officebite.com")
                .role(Role.STAFF)
                .build();

        String token = jwtService.generateToken(user);

        // Tamper with token by altering characters
        String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";
        assertFalse(jwtService.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("Token validation: empty or null token returns false without throwing unhandled exceptions")
    void testNullOrEmptyToken_returnsFalse() {
        assertFalse(jwtService.validateToken(null));
        assertFalse(jwtService.validateToken(""));
        assertFalse(jwtService.validateToken("   "));
        assertFalse(jwtService.validateToken("not-a-valid-jwt"));
    }

    @Test
    @DisplayName("Startup validation: secret shorter than 32 bytes throws IllegalStateException")
    void testInit_shortSecretThrowsIllegalStateException() {
        JwtService insecureJwtService = new JwtService();
        ReflectionTestUtils.setField(insecureJwtService, "secretString", "short-secret");
        ReflectionTestUtils.setField(insecureJwtService, "expirationMs", 3600000L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, insecureJwtService::init);
        assertTrue(ex.getMessage().contains("at least 256 bits (32 bytes)"));
    }

    @Test
    @DisplayName("Startup validation: null or blank secret throws IllegalStateException")
    void testInit_blankSecretThrowsIllegalStateException() {
        JwtService blankJwtService = new JwtService();
        ReflectionTestUtils.setField(blankJwtService, "secretString", "   ");

        assertThrows(IllegalStateException.class, blankJwtService::init);
    }
}
