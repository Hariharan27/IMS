package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.WarehouseRequest;
import com.ideas2it.inventory_service.dto.WarehouseResponse;
import com.ideas2it.inventory_service.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(origins = "*")
public class WarehouseController {
    
    @Autowired
    private WarehouseService warehouseService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllWarehouses() {
        try {
            List<WarehouseResponse> warehouses = warehouseService.getAllWarehouses();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouses retrieved successfully");
            result.put("data", warehouses);
            result.put("count", warehouses.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to retrieve warehouses: " + e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getWarehouseById(@PathVariable Long id) {
        try {
            WarehouseResponse warehouse = warehouseService.getWarehouseById(id);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouse retrieved successfully");
            result.put("data", warehouse);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<Map<String, Object>> getWarehouseByCode(@PathVariable String code) {
        try {
            WarehouseResponse warehouse = warehouseService.getWarehouseByCode(code);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouse retrieved successfully");
            result.put("data", warehouse);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        try {
            // Get current user ID from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            // For now, we'll use a default user ID. In a real implementation, you'd get this from the JWT token
            Long currentUserId = 1L; // This should be extracted from JWT token
            
            WarehouseResponse warehouse = warehouseService.createWarehouse(request, currentUserId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouse created successfully");
            result.put("data", warehouse);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateWarehouse(@PathVariable Long id, @Valid @RequestBody WarehouseRequest request) {
        try {
            // Get current user ID from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            // For now, we'll use a default user ID. In a real implementation, you'd get this from the JWT token
            Long currentUserId = 1L; // This should be extracted from JWT token
            
            WarehouseResponse warehouse = warehouseService.updateWarehouse(id, request, currentUserId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouse updated successfully");
            result.put("data", warehouse);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateWarehouseStatus(@PathVariable Long id, @RequestParam boolean isActive) {
        try {
            // Get current user ID from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            // For now, we'll use a default user ID. In a real implementation, you'd get this from the JWT token
            Long currentUserId = 1L; // This should be extracted from JWT token
            
            WarehouseResponse warehouse = warehouseService.updateWarehouseStatus(id, isActive, currentUserId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouse status updated successfully");
            result.put("data", warehouse);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchWarehouses(@RequestParam String q) {
        try {
            List<WarehouseResponse> warehouses = warehouseService.searchWarehouses(q);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouse search completed successfully");
            result.put("data", warehouses);
            result.put("count", warehouses.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to search warehouses: " + e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getWarehouseCount() {
        try {
            long count = warehouseService.getActiveWarehouseCount();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Warehouse count retrieved successfully");
            result.put("data", count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to get warehouse count: " + e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
} 