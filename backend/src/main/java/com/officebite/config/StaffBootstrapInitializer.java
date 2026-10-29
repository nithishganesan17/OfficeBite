package com.officebite.config;

import com.officebite.model.Role;
import com.officebite.repository.UserRepository;
import com.officebite.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Optional, documented bootstrap runner for provisioning an initial kitchen staff or administrator account.
 * Reads credentials flexibly from direct environment variables (BOOTSTRAP_STAFF_EMAIL),
 * relaxed binding (APP_BOOTSTRAP_STAFF_EMAIL), JVM system properties, or application.yml.
 * Only activates if bootstrap credentials are provided and the target user does not already exist.
 */
@Component
@Slf4j
public class StaffBootstrapInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final Environment environment;

    @Value("${BOOTSTRAP_STAFF_EMAIL:${app.bootstrap.staff.email:${APP_BOOTSTRAP_STAFF_EMAIL:}}}")
    private String bootstrapStaffEmail;

    @Value("${BOOTSTRAP_STAFF_PASSWORD:${app.bootstrap.staff.password:${APP_BOOTSTRAP_STAFF_PASSWORD:}}}")
    private String bootstrapStaffPassword;

    @Value("${BOOTSTRAP_STAFF_NAME:${app.bootstrap.staff.name:${APP_BOOTSTRAP_STAFF_NAME:Kitchen Staff}}}")
    private String bootstrapStaffName;

    @Value("${BOOTSTRAP_STAFF_EMPLOYEE_ID:${app.bootstrap.staff.employee-id:${APP_BOOTSTRAP_STAFF_EMPLOYEE_ID:STAFF-01}}}")
    private String bootstrapStaffEmployeeId;

    @Value("${BOOTSTRAP_ADMIN_EMAIL:${app.bootstrap.admin.email:${APP_BOOTSTRAP_ADMIN_EMAIL:}}}")
    private String bootstrapAdminEmail;

    @Value("${BOOTSTRAP_ADMIN_PASSWORD:${app.bootstrap.admin.password:${APP_BOOTSTRAP_ADMIN_PASSWORD:}}}")
    private String bootstrapAdminPassword;

    @Value("${BOOTSTRAP_ADMIN_NAME:${app.bootstrap.admin.name:${APP_BOOTSTRAP_ADMIN_NAME:System Admin}}}")
    private String bootstrapAdminName;

    @Value("${BOOTSTRAP_ADMIN_EMPLOYEE_ID:${app.bootstrap.admin.employee-id:${APP_BOOTSTRAP_ADMIN_EMPLOYEE_ID:ADMIN-01}}}")
    private String bootstrapAdminEmployeeId;

    public StaffBootstrapInitializer(UserRepository userRepository, UserService userService, Environment environment) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        String staffEmail = resolveProperty("BOOTSTRAP_STAFF_EMAIL", "app.bootstrap.staff.email", "APP_BOOTSTRAP_STAFF_EMAIL", bootstrapStaffEmail);
        String staffPassword = resolveProperty("BOOTSTRAP_STAFF_PASSWORD", "app.bootstrap.staff.password", "APP_BOOTSTRAP_STAFF_PASSWORD", bootstrapStaffPassword);
        String staffName = resolveProperty("BOOTSTRAP_STAFF_NAME", "app.bootstrap.staff.name", "APP_BOOTSTRAP_STAFF_NAME", bootstrapStaffName);
        String staffEmpId = resolveProperty("BOOTSTRAP_STAFF_EMPLOYEE_ID", "app.bootstrap.staff.employee-id", "APP_BOOTSTRAP_STAFF_EMPLOYEE_ID", bootstrapStaffEmployeeId);

        if (staffName == null || staffName.isBlank()) staffName = "Kitchen Staff";
        if (staffEmpId == null || staffEmpId.isBlank()) staffEmpId = "STAFF-01";

        // Bootstrap staff account if configured via environment variables or properties
        if (staffEmail != null && !staffEmail.isBlank() && staffPassword != null && !staffPassword.isBlank()) {
            if (staffPassword.length() < 6) {
                log.warn("Configured bootstrap staff password for '{}' must be at least 6 characters long. Skipping staff account provisioning.", staffEmail);
            } else {
                String normalizedEmail = UserService.normalizeEmail(staffEmail);
                if (!userRepository.existsByEmail(normalizedEmail)) {
                    log.info("Bootstrapping configured initial kitchen staff account for email: {}", normalizedEmail);
                    userService.createPrivilegedUser(
                            staffName,
                            normalizedEmail,
                            staffPassword,
                            staffEmpId,
                            Role.STAFF
                    );
                    log.info("Initial kitchen staff account successfully provisioned for: {}", normalizedEmail);
                } else {
                    log.info("Staff bootstrap account '{}' already exists in database.", normalizedEmail);
                }
            }
        } else {
            long staffCount = userRepository.findByRole(Role.STAFF).size();
            if (staffCount == 0) {
                log.warn("No kitchen staff accounts exist in MySQL database. Set BOOTSTRAP_STAFF_EMAIL and BOOTSTRAP_STAFF_PASSWORD or insert via SQL to enable terminal login.");
            }
        }

        String adminEmail = resolveProperty("BOOTSTRAP_ADMIN_EMAIL", "app.bootstrap.admin.email", "APP_BOOTSTRAP_ADMIN_EMAIL", bootstrapAdminEmail);
        String adminPassword = resolveProperty("BOOTSTRAP_ADMIN_PASSWORD", "app.bootstrap.admin.password", "APP_BOOTSTRAP_ADMIN_PASSWORD", bootstrapAdminPassword);
        String adminName = resolveProperty("BOOTSTRAP_ADMIN_NAME", "app.bootstrap.admin.name", "APP_BOOTSTRAP_ADMIN_NAME", bootstrapAdminName);
        String adminEmpId = resolveProperty("BOOTSTRAP_ADMIN_EMPLOYEE_ID", "app.bootstrap.admin.employee-id", "APP_BOOTSTRAP_ADMIN_EMPLOYEE_ID", bootstrapAdminEmployeeId);

        if (adminName == null || adminName.isBlank()) adminName = "System Administrator";
        if (adminEmpId == null || adminEmpId.isBlank()) adminEmpId = "ADMIN-01";

        // Bootstrap admin account if configured via environment variables or properties
        if (adminEmail != null && !adminEmail.isBlank() && adminPassword != null && !adminPassword.isBlank()) {
            if (adminPassword.length() < 6) {
                log.warn("Configured bootstrap admin password for '{}' must be at least 6 characters long. Skipping admin account provisioning.", adminEmail);
            } else {
                String normalizedAdminEmail = UserService.normalizeEmail(adminEmail);
                if (!userRepository.existsByEmail(normalizedAdminEmail)) {
                    log.info("Bootstrapping configured initial admin account for email: {}", normalizedAdminEmail);
                    userService.createPrivilegedUser(
                            adminName,
                            normalizedAdminEmail,
                            adminPassword,
                            adminEmpId,
                            Role.ADMIN
                    );
                    log.info("Initial admin account successfully provisioned for: {}", normalizedAdminEmail);
                } else {
                    log.info("Admin bootstrap account '{}' already exists in database.", normalizedAdminEmail);
                }
            }
        }
    }

    private String resolveProperty(String envKey, String yamlKey, String relaxedEnvKey, String injectedVal) {
        String val = cleanValue(injectedVal);
        if (val != null && !val.isBlank()) return val;

        if (environment != null) {
            val = cleanValue(environment.getProperty(envKey));
            if (val != null && !val.isBlank()) return val;

            val = cleanValue(environment.getProperty(yamlKey));
            if (val != null && !val.isBlank()) return val;

            val = cleanValue(environment.getProperty(relaxedEnvKey));
            if (val != null && !val.isBlank()) return val;
        }

        try {
            val = cleanValue(System.getenv(envKey));
            if (val != null && !val.isBlank()) return val;

            val = cleanValue(System.getenv(relaxedEnvKey));
            if (val != null && !val.isBlank()) return val;

            val = cleanValue(System.getProperty(envKey));
            if (val != null && !val.isBlank()) return val;

            val = cleanValue(System.getProperty(yamlKey));
            if (val != null && !val.isBlank()) return val;
        } catch (Exception ignored) {
            // SecurityManager or environment access fallback
        }

        return null;
    }

    private String cleanValue(String val) {
        if (val == null) return null;
        String trimmed = val.trim();
        while ((trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() >= 2) ||
               (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length() >= 2)) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }
}

