package com.officebite.config;

import com.officebite.model.Role;
import com.officebite.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@TestPropertySource(properties = {
    "BOOTSTRAP_STAFF_EMAIL=",
    "BOOTSTRAP_STAFF_PASSWORD=",
    "app.bootstrap.staff.email=",
    "app.bootstrap.staff.password="
})
@Transactional
class StaffBootstrapMissingConfigIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Verify initializer safely skips account creation when bootstrap configuration is missing")
    void testMissingConfigurationSkipsCreation() {
        long staffCount = userRepository.findByRole(Role.STAFF).size();
        assertEquals(0, staffCount, "No staff accounts should be created when bootstrap configuration is blank");
    }
}
