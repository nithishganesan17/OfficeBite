package com.officebite.repository;

import com.officebite.model.Role;
import com.officebite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Looks up a user account by exact normalized email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user already exists with the given normalized email.
     */
    boolean existsByEmail(String email);

    /**
     * Lists users by assigned role (CUSTOMER, STAFF, ADMIN).
     */
    List<User> findByRole(Role role);
}
