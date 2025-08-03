package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsernameAndIsActiveTrue(String username);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
} 