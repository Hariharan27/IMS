package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.LoginRequest;
import com.ideas2it.inventory_service.dto.LoginResponse;
import com.ideas2it.inventory_service.dto.UserRegistrationRequest;
import com.ideas2it.inventory_service.dto.UserResponse;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.repository.UserRepository;
import com.ideas2it.inventory_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public LoginResponse login(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsernameAndIsActiveTrue(loginRequest.getUsername());
        
        if (userOpt.isEmpty()) {
            return new LoginResponse(null, null, null, "Invalid username or password", false);
        }
        
        User user = userOpt.get();
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            return new LoginResponse(null, null, null, "Invalid username or password", false);
        }
        
        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        
        return new LoginResponse(token, user.getUsername(), user.getRole().name(), "Login successful", true);
    }
    
    public UserResponse registerUser(UserRegistrationRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(User.UserRole.valueOf(request.getRole()));
        user.setIsActive(true);
        
        User savedUser = userRepository.save(user);
        return UserResponse.fromUser(savedUser);
    }
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return UserResponse.fromUser(userOpt.get());
    }
    
    public UserResponse getUserByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        return UserResponse.fromUser(userOpt.get());
    }
    
    public UserResponse updateUserStatus(Long id, boolean isActive) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setIsActive(isActive);
        User savedUser = userRepository.save(user);
        return UserResponse.fromUser(savedUser);
    }
} 