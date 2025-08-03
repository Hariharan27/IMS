package com.ideas2it.inventory_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Inventory Service is running!");
        response.put("status", "UP");
        response.put("timestamp", java.time.LocalDateTime.now());
        return response;
    }
    
    @GetMapping("/users")
    public Map<String, Object> getUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User endpoint working!");
        response.put("data", "User entity and repository created successfully");
        return response;
    }
} 