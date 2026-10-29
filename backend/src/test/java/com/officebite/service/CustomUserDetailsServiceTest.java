package com.officebite.service;

import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    private User customerUser;
    private User staffUser;

    @BeforeEach
    void setUp() {
        customerUser = User.builder()
                .id(1L)
                .name("Rahul Sharma")
                .email("rahul@officebite.com")
                .passwordHash("$2a$10$N9qo8uLOickgx2ZMRZoMye.I8P2u00H2PvhE25m/b545f4xJz4C9a")
                .role(Role.CUSTOMER)
                .build();

        staffUser = User.builder()
                .id(2L)
                .name("Kitchen Lead")
                .email("kitchen@officebite.com")
                .passwordHash("$2a$10$wO3t4hDq7cZ8Q2o5b7p4E.9xY2U8PvhE25m/b545f4xJz4C9b")
                .role(Role.STAFF)
                .build();
    }

    @Test
    @DisplayName("loadUserByUsername: returns UserDetails with normalized username, hash, and ROLE_CUSTOMER")
    void testLoadUserByUsername_customerSuccess() {
        when(userRepository.findByEmail("rahul@officebite.com")).thenReturn(Optional.of(customerUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("  Rahul@OfficeBite.COM ");

        assertNotNull(userDetails);
        assertEquals("rahul@officebite.com", userDetails.getUsername());
        assertEquals(customerUser.getPasswordHash(), userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
    }

    @Test
    @DisplayName("loadUserByUsername: returns UserDetails with ROLE_STAFF for staff accounts")
    void testLoadUserByUsername_staffSuccess() {
        when(userRepository.findByEmail("kitchen@officebite.com")).thenReturn(Optional.of(staffUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("kitchen@officebite.com");

        assertNotNull(userDetails);
        assertEquals("kitchen@officebite.com", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF")));
    }

    @Test
    @DisplayName("loadUserByUsername: non-existent email throws UsernameNotFoundException")
    void testLoadUserByUsername_notFoundThrows() {
        when(userRepository.findByEmail("unknown@officebite.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                userDetailsService.loadUserByUsername("unknown@officebite.com"));
    }

    @Test
    @DisplayName("loadUserByUsername: empty or null email throws UsernameNotFoundException")
    void testLoadUserByUsername_emptyThrows() {
        assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername(null));
        assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername("   "));
    }
}
