package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.LoginRequest;
import com.ideas2it.inventory_service.dto.LoginResponse;
import com.ideas2it.inventory_service.dto.UserRegistrationRequest;
import com.ideas2it.inventory_service.dto.UserResponse;
import com.ideas2it.inventory_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = userService.login(loginRequest);
        
        Map<String, Object> result = new HashMap<>();
        if (response.isSuccess()) {
            result.put("success", true);
            result.put("message", response.getMessage());
            result.put("data", response);
            return ResponseEntity.ok(result);
        } else {
            result.put("success", false);
            result.put("message", response.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody UserRegistrationRequest request) {
        try {
            UserResponse user = userService.registerUser(request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "User registered successfully");
            result.put("data", user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            // Extract username from token (simplified for now)
            // In a real implementation, you'd get this from SecurityContext
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Current user info");
            result.put("data", "User info will be implemented");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to get user info");
            return ResponseEntity.badRequest().body(result);
        }
    }
} 