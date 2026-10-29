package com.officebite.config;

import com.officebite.model.Role;
import com.officebite.model.User;
import com.officebite.repository.UserRepository;
import com.officebite.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffBootstrapInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private org.springframework.core.env.Environment environment;

    @InjectMocks
    private StaffBootstrapInitializer initializer;


    @Test
    @DisplayName("Should skip bootstrapping when environment variables are blank")
    void shouldSkipWhenCredentialsBlank() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "");
        ReflectionTestUtils.setField(initializer, "bootstrapAdminEmail", "");
        ReflectionTestUtils.setField(initializer, "bootstrapAdminPassword", "");

        when(userRepository.findByRole(Role.STAFF)).thenReturn(Collections.emptyList());

        initializer.run();

        verify(userService, never()).createPrivilegedUser(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should bootstrap staff when configured and account does not exist")
    void shouldBootstrapStaffWhenConfigured() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "staff@officebite.com");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "SecretPass123");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffName", "Kitchen Staff");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmployeeId", "STAFF-01");

        when(userRepository.existsByEmail("staff@officebite.com")).thenReturn(false);

        initializer.run();

        verify(userService).createPrivilegedUser(
                eq("Kitchen Staff"),
                eq("staff@officebite.com"),
                eq("SecretPass123"),
                eq("STAFF-01"),
                eq(Role.STAFF)
        );
    }

    @Test
    @DisplayName("Should not bootstrap when staff account already exists")
    void shouldNotBootstrapWhenAlreadyExists() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "staff@officebite.com");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "SecretPass123");

        when(userRepository.existsByEmail("staff@officebite.com")).thenReturn(true);

        initializer.run();

        verify(userService, never()).createPrivilegedUser(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should skip staff creation when only email is provided and password is blank")
    void shouldSkipWhenOnlyEmailConfigured() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "staff@officebite.com");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "");
        when(userRepository.findByRole(Role.STAFF)).thenReturn(Collections.emptyList());

        initializer.run();

        verify(userService, never()).createPrivilegedUser(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should skip staff creation when only password is provided and email is blank")
    void shouldSkipWhenOnlyPasswordConfigured() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "SecretPass123");
        when(userRepository.findByRole(Role.STAFF)).thenReturn(Collections.emptyList());

        initializer.run();

        verify(userService, never()).createPrivilegedUser(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should skip staff creation when configured password is less than 6 characters")
    void shouldSkipWhenPasswordTooShort() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "staff@officebite.com");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "12345");

        initializer.run();

        verify(userService, never()).createPrivilegedUser(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should clean surrounding quotes and whitespace from bootstrap properties")
    void shouldCleanSurroundingQuotesAndWhitespace() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", " \"staff@officebite.com\" ");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", " 'SecretPass123' ");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffName", " \"Head Chef\" ");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmployeeId", " 'STAFF-99' ");

        when(userRepository.existsByEmail("staff@officebite.com")).thenReturn(false);

        initializer.run();

        verify(userService).createPrivilegedUser(
                eq("Head Chef"),
                eq("staff@officebite.com"),
                eq("SecretPass123"),
                eq("STAFF-99"),
                eq(Role.STAFF)
        );
    }

    @Test
    @DisplayName("Should use default name and employee ID when not explicitly provided")
    void shouldUseDefaultNameAndEmployeeIdWhenNotConfigured() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "staff@officebite.com");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "SecretPass123");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffName", "");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmployeeId", "");

        when(userRepository.existsByEmail("staff@officebite.com")).thenReturn(false);

        initializer.run();

        verify(userService).createPrivilegedUser(
                eq("Kitchen Staff"),
                eq("staff@officebite.com"),
                eq("SecretPass123"),
                eq("STAFF-01"),
                eq(Role.STAFF)
        );
    }

    @Test
    @DisplayName("Should fallback to Environment properties when injected fields are blank")
    void shouldFallbackToEnvironmentWhenInjectedFieldsBlank() {
        ReflectionTestUtils.setField(initializer, "bootstrapStaffEmail", "");
        ReflectionTestUtils.setField(initializer, "bootstrapStaffPassword", "");

        when(environment.getProperty("BOOTSTRAP_STAFF_EMAIL")).thenReturn("envchef@officebite.com");
        when(environment.getProperty("BOOTSTRAP_STAFF_PASSWORD")).thenReturn("EnvSecretPass123");
        when(userRepository.existsByEmail("envchef@officebite.com")).thenReturn(false);

        initializer.run();

        verify(userService).createPrivilegedUser(
                eq("Kitchen Staff"),
                eq("envchef@officebite.com"),
                eq("EnvSecretPass123"),
                eq("STAFF-01"),
                eq(Role.STAFF)
        );
    }
}
