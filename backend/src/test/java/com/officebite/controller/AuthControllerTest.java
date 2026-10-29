package com.officebite.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.officebite.dto.AuthResponse;
import com.officebite.dto.LoginRequest;
import com.officebite.dto.RegisterRequest;
import com.officebite.dto.UserProfileResponse;
import com.officebite.exception.DuplicateEmailException;
import com.officebite.exception.GlobalExceptionHandler;
import com.officebite.model.Role;
import com.officebite.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private UserProfileResponse sampleProfile;
    private AuthResponse sampleAuthResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();

        sampleProfile = UserProfileResponse.builder()
                .id(1L)
                .name("Rahul Sharma")
                .email("rahul@officebite.com")
                .role(Role.CUSTOMER)
                .employeeId("OB-7821")
                .createdAt(LocalDateTime.now())
                .build();

        sampleAuthResponse = AuthResponse.builder()
                .token("jwt.token.here")
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(sampleProfile)
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/register: returns 201 Created with JWT and user profile")
    void testRegister_success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Rahul Sharma")
                .email("rahul@officebite.com")
                .password("Password123")
                .employeeId("OB-7821")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(sampleAuthResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.user.email").value("rahul@officebite.com"))
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("POST /api/auth/register: duplicate email returns 409 Conflict")
    void testRegister_duplicateEmailConflict() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Rahul Sharma")
                .email("duplicate@officebite.com")
                .password("Password123")
                .build();

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new DuplicateEmailException("An account with email 'duplicate@officebite.com' already exists."));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("DUPLICATE_EMAIL"))
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    @DisplayName("POST /api/auth/login: valid credentials return 200 OK with token")
    void testLogin_success() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("rahul@officebite.com")
                .password("Password123")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(sampleAuthResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.user.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("POST /api/auth/login: invalid credentials return 401 Unauthorized")
    void testLogin_invalidCredentials() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("rahul@officebite.com")
                .password("WrongPassword")
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password."));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/auth/me: authenticated principal returns 200 OK with safe profile")
    void testGetMe_authenticated() throws Exception {
        Principal mockPrincipal = () -> "rahul@officebite.com";
        when(authService.getCurrentUserProfile("rahul@officebite.com")).thenReturn(sampleProfile);

        mockMvc.perform(get("/api/auth/me").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Rahul Sharma"))
                .andExpect(jsonPath("$.email").value("rahul@officebite.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("GET /api/auth/me: missing principal returns 401 Unauthorized")
    void testGetMe_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
