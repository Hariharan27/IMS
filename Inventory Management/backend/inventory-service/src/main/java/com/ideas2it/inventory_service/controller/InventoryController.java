package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.InventoryRequest;
import com.ideas2it.inventory_service.dto.InventoryResponse;
import com.ideas2it.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    @GetMapping
    public ResponseEntity<?> getAllInventory() {
        log.info("GET /api/inventory - Fetching all inventory");
        try {
            List<InventoryResponse> inventory = inventoryService.getAllInventory();
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Inventory retrieved successfully",
                    inventory.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching inventory: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching inventory: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getInventoryById(@PathVariable Long id) {
        log.info("GET /api/inventory/{} - Fetching inventory by ID", id);
        try {
            InventoryResponse inventory = inventoryService.getInventoryById(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Inventory retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching inventory with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching inventory: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getInventoryByProduct(@PathVariable Long productId) {
        log.info("GET /api/inventory/product/{} - Fetching inventory by product", productId);
        try {
            List<InventoryResponse> inventory = inventoryService.getInventoryByProduct(productId);
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Product inventory retrieved successfully",
                    inventory.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching inventory for product ID {}: {}", productId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product inventory: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<?> getInventoryByWarehouse(@PathVariable Long warehouseId) {
        log.info("GET /api/inventory/warehouse/{} - Fetching inventory by warehouse", warehouseId);
        try {
            List<InventoryResponse> inventory = inventoryService.getInventoryByWarehouse(warehouseId);
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Warehouse inventory retrieved successfully",
                    inventory.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching inventory for warehouse ID {}: {}", warehouseId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching warehouse inventory: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createInventory(@RequestBody InventoryRequest request) {
        log.info("POST /api/inventory - Creating inventory");
        try {
            InventoryResponse inventory = inventoryService.createInventory(request, 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Inventory created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating inventory: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error creating inventory: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInventory(@PathVariable Long id, @RequestBody InventoryRequest request) {
        log.info("PUT /api/inventory/{} - Updating inventory", id);
        try {
            InventoryResponse inventory = inventoryService.updateInventory(id, request, 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Inventory updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating inventory with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating inventory: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockInventory() {
        log.info("GET /api/inventory/low-stock - Fetching low stock inventory");
        try {
            List<InventoryResponse> inventory = inventoryService.getLowStockInventory();
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Low stock inventory retrieved successfully",
                    inventory.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching low stock inventory: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching low stock inventory: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/out-of-stock")
    public ResponseEntity<?> getOutOfStockInventory() {
        log.info("GET /api/inventory/out-of-stock - Fetching out of stock inventory");
        try {
            List<InventoryResponse> inventory = inventoryService.getOutOfStockInventory();
            return ResponseEntity.ok(new ApiResponse<>(
                    inventory,
                    true,
                    "Out of stock inventory retrieved successfully",
                    inventory.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching out of stock inventory: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching out of stock inventory: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getInventoryCount() {
        log.info("GET /api/inventory/count - Fetching inventory count");
        try {
            long count = inventoryService.getInventoryCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Inventory count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching inventory count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching inventory count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/product/{productId}")
    public ResponseEntity<?> getInventoryCountByProduct(@PathVariable Long productId) {
        log.info("GET /api/inventory/count/product/{} - Fetching inventory count by product", productId);
        try {
            long count = inventoryService.getInventoryCountByProduct(productId);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Product inventory count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching inventory count for product ID {}: {}", productId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product inventory count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/warehouse/{warehouseId}")
    public ResponseEntity<?> getInventoryCountByWarehouse(@PathVariable Long warehouseId) {
        log.info("GET /api/inventory/count/warehouse/{} - Fetching inventory count by warehouse", warehouseId);
        try {
            long count = inventoryService.getInventoryCountByWarehouse(warehouseId);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Warehouse inventory count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching inventory count for warehouse ID {}: {}", warehouseId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching warehouse inventory count: " + e.getMessage()
            ));
        }
    }
    
    // Helper class for consistent API responses
    public static class ApiResponse<T> {
        private T data;
        private boolean success;
        private String message;
        private int count;
        
        public ApiResponse(T data, boolean success, String message) {
            this.data = data;
            this.success = success;
            this.message = message;
        }
        
        public ApiResponse(T data, boolean success, String message, int count) {
            this.data = data;
            this.success = success;
            this.message = message;
            this.count = count;
        }
        
        // Getters and setters
        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }
} 