package com.officebite.service;

import com.officebite.dto.AuthResponse;
import com.officebite.dto.LoginRequest;
import com.officebite.dto.RegisterRequest;
import com.officebite.dto.UserProfileResponse;
import com.officebite.exception.ResourceNotFoundException;
import com.officebite.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service orchestrating user registration, authentication credential checks, and token generation.
 */
@Service
@Slf4j
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserService userService, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Registers a new customer account.
     * Public registration strictly assigns Role.CUSTOMER.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Enforce customer creation (ignores any potential client role tampering)
        User user = userService.createCustomerUser(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getEmployeeId()
        );

        String token = jwtService.generateToken(user);
        log.info("Customer registered successfully: id={}, email={}", user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs() / 1000)
                .user(mapToProfile(user))
                .build();
    }

    /**
     * Verifies user credentials and issues a signed JWT token upon success.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = UserService.normalizeEmail(request.getEmail());

        // Authenticate through Spring Security AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = userService.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        String token = jwtService.generateToken(user);
        log.info("User logged in successfully: email={}, role={}", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs() / 1000)
                .user(mapToProfile(user))
                .build();
    }

    /**
     * Retrieves the safe public profile of the currently authenticated user.
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        String normalizedEmail = UserService.normalizeEmail(email);
        User user = userService.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        return mapToProfile(user);
    }

    private UserProfileResponse mapToProfile(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .employeeId(user.getEmployeeId())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
