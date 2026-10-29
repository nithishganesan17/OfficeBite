package com.officebite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User account in OfficeBite.
 * Represents customers (corporate employees), canteen staff, and administrators.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email", unique = true)
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * Stored strictly in normalized format (trimmed and lowercased).
     * Must be unique across all user accounts in MySQL.
     */
    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    /**
     * BCrypt password hash. Plain-text passwords must NEVER be persisted.
     * Annotated with @JsonIgnore and @ToString.Exclude so it is never
     * exposed in JSON responses or application logs.
     */
    @JsonIgnore
    @ToString.Exclude
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
