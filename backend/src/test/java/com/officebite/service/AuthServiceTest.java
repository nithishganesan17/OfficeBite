package com.officebite.service;

import com.officebite.dto.AuthResponse;
import com.officebite.dto.LoginRequest;
import com.officebite.dto.RegisterRequest;
import com.officebite.dto.UserProfileResponse;
import com.officebite.exception.DuplicateEmailException;
import com.officebite.model.Role;
import com.officebite.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Rahul Sharma")
                .email("rahul@officebite.com")
                .passwordHash("$2a$10$hashedPassword")
                .role(Role.CUSTOMER)
                .employeeId("OB-7821")
                .build();
    }

    @Test
    @DisplayName("Registration: public registration creates customer account and returns JWT token")
    void testRegister_success() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Rahul Sharma")
                .email("rahul@officebite.com")
                .password("SecretPassword123")
                .employeeId("OB-7821")
                .build();

        when(userService.createCustomerUser("Rahul Sharma", "rahul@officebite.com", "SecretPassword123", "OB-7821"))
                .thenReturn(sampleUser);
        when(jwtService.generateToken(sampleUser)).thenReturn("mocked.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(86400L, response.getExpiresIn());
        assertEquals(Role.CUSTOMER, response.getUser().getRole());
        assertEquals("rahul@officebite.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Registration: duplicate email throws DuplicateEmailException")
    void testRegister_duplicateEmailThrows() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Duplicate User")
                .email("rahul@officebite.com")
                .password("Password123")
                .build();

        when(userService.createCustomerUser(any(), eq("rahul@officebite.com"), any(), any()))
                .thenThrow(new DuplicateEmailException("An account with email 'rahul@officebite.com' already exists."));

        assertThrows(DuplicateEmailException.class, () -> authService.register(request));
    }

    @Test
    @DisplayName("Login: valid credentials authenticate and return JWT token")
    void testLogin_success() {
        LoginRequest request = LoginRequest.builder()
                .email("rahul@officebite.com")
                .password("SecretPassword123")
                .build();

        Authentication mockAuth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(userService.findByEmail("rahul@officebite.com")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(sampleUser)).thenReturn("mocked.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("rahul@officebite.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Login: bad credentials throw BadCredentialsException")
    void testLogin_badCredentialsThrows() {
        LoginRequest request = LoginRequest.builder()
                .email("rahul@officebite.com")
                .password("WrongPassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Get Current Profile: returns safe profile without password hash")
    void testGetCurrentUserProfile_success() {
        when(userService.findByEmail("rahul@officebite.com")).thenReturn(Optional.of(sampleUser));

        UserProfileResponse profile = authService.getCurrentUserProfile("rahul@officebite.com");

        assertNotNull(profile);
        assertEquals(1L, profile.getId());
        assertEquals("Rahul Sharma", profile.getName());
        assertEquals("rahul@officebite.com", profile.getEmail());
        assertEquals(Role.CUSTOMER, profile.getRole());
    }
}
