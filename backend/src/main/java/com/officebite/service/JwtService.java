package com.officebite.service;

import com.officebite.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Service for issuing, signing, parsing, and validating JSON Web Tokens (JWT).
 * Uses HMAC-SHA256 with a 256-bit or greater signing key loaded from configuration/environment.
 */
@Service
@Slf4j
public class JwtService {

    @Value("${app.jwt.secret:${JWT_SECRET:officebite-dev-super-secure-jwt-signing-secret-key-at-least-256-bits-long-2026!}}")
    private String secretString;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        if (secretString == null || secretString.isBlank()) {
            throw new IllegalStateException("JWT signing secret key must be configured via JWT_SECRET or app.jwt.secret.");
        }

        byte[] secretBytes = secretString.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                "JWT signing secret key must be at least 256 bits (32 bytes) long for HMAC-SHA256. Current length is " +
                secretBytes.length + " bytes. Please configure a stronger JWT_SECRET."
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
        log.info("JwtService initialized successfully with HMAC-SHA256 signing key (expiration: {} ms).", expirationMs);
    }

    /**
     * Generates a signed JWT token for the authenticated user.
     * Contains subject (normalized email), user ID, display name, and role.
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("id", user.getId())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .claim("employeeId", user.getEmployeeId())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Extracts the subject (normalized email) from the token.
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extracts the user role name string from the token claims.
     */
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /**
     * Validates whether the given token has a valid signature and is not expired.
     */
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token.trim());
            return true;
        } catch (SecurityException ex) {
            log.warn("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Invalid JWT token format: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token has expired: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims string is empty: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.warn("JWT parsing error: {}", ex.getMessage());
        }

        return false;
    }

    /**
     * Returns the configured token expiration time in milliseconds.
     */
    public long getExpirationMs() {
        return expirationMs;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token.trim())
                .getPayload();
    }
}
