package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.StockMovementRequest;
import com.ideas2it.inventory_service.dto.StockMovementResponse;
import com.ideas2it.inventory_service.entity.StockMovement;
import com.ideas2it.inventory_service.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/movements")
@RequiredArgsConstructor
@Slf4j
public class StockMovementController {
    
    private final StockMovementService stockMovementService;
    
    @GetMapping
    public ResponseEntity<?> getAllStockMovements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/inventory/movements - Fetching all stock movements");
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<StockMovementResponse> movements = stockMovementService.getStockMovementsWithPagination(pageable);
            return ResponseEntity.ok(new ApiResponse<>(
                    movements.getContent(),
                    true,
                    "Stock movements retrieved successfully",
                    (int) movements.getTotalElements()
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movements: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching stock movements: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getStockMovementById(@PathVariable Long id) {
        log.info("GET /api/inventory/movements/{} - Fetching stock movement by ID", id);
        try {
            StockMovementResponse movement = stockMovementService.getStockMovementById(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    movement,
                    true,
                    "Stock movement retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movement with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching stock movement: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getStockMovementsByProduct(@PathVariable Long productId) {
        log.info("GET /api/inventory/movements/product/{} - Fetching stock movements by product", productId);
        try {
            List<StockMovementResponse> movements = stockMovementService.getStockMovementsByProduct(productId);
            return ResponseEntity.ok(new ApiResponse<>(
                    movements,
                    true,
                    "Product stock movements retrieved successfully",
                    movements.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movements for product ID {}: {}", productId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product stock movements: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<?> getStockMovementsByWarehouse(@PathVariable Long warehouseId) {
        log.info("GET /api/inventory/movements/warehouse/{} - Fetching stock movements by warehouse", warehouseId);
        try {
            List<StockMovementResponse> movements = stockMovementService.getStockMovementsByWarehouse(warehouseId);
            return ResponseEntity.ok(new ApiResponse<>(
                    movements,
                    true,
                    "Warehouse stock movements retrieved successfully",
                    movements.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movements for warehouse ID {}: {}", warehouseId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching warehouse stock movements: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/type/{movementType}")
    public ResponseEntity<?> getStockMovementsByType(@PathVariable StockMovement.MovementType movementType) {
        log.info("GET /api/inventory/movements/type/{} - Fetching stock movements by type", movementType);
        try {
            List<StockMovementResponse> movements = stockMovementService.getStockMovementsByMovementType(movementType);
            return ResponseEntity.ok(new ApiResponse<>(
                    movements,
                    true,
                    "Stock movements by type retrieved successfully",
                    movements.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movements by type {}: {}", movementType, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching stock movements by type: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<?> getStockMovementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/inventory/movements/date-range - Fetching stock movements by date range");
        try {
            List<StockMovementResponse> movements = stockMovementService.getStockMovementsByDateRange(startDate, endDate);
            return ResponseEntity.ok(new ApiResponse<>(
                    movements,
                    true,
                    "Stock movements by date range retrieved successfully",
                    movements.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movements by date range: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching stock movements by date range: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/product/{productId}/date-range")
    public ResponseEntity<?> getStockMovementsByProductAndDateRange(
            @PathVariable Long productId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("GET /api/inventory/movements/product/{}/date-range - Fetching stock movements by product and date range", productId);
        try {
            List<StockMovementResponse> movements = stockMovementService.getStockMovementsByProductAndDateRange(productId, startDate, endDate);
            return ResponseEntity.ok(new ApiResponse<>(
                    movements,
                    true,
                    "Product stock movements by date range retrieved successfully",
                    movements.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movements for product ID {} by date range: {}", productId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product stock movements by date range: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createStockMovement(@RequestBody StockMovementRequest request) {
        log.info("POST /api/inventory/movements - Creating stock movement");
        try {
            StockMovementResponse movement = stockMovementService.createStockMovement(request, 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    movement,
                    true,
                    "Stock movement created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating stock movement: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error creating stock movement: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getStockMovementCount() {
        log.info("GET /api/inventory/movements/count - Fetching stock movement count");
        try {
            long count = stockMovementService.getStockMovementCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Stock movement count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movement count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching stock movement count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/product/{productId}")
    public ResponseEntity<?> getStockMovementCountByProduct(@PathVariable Long productId) {
        log.info("GET /api/inventory/movements/count/product/{} - Fetching stock movement count by product", productId);
        try {
            long count = stockMovementService.getStockMovementCountByProduct(productId);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Product stock movement count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movement count for product ID {}: {}", productId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product stock movement count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/warehouse/{warehouseId}")
    public ResponseEntity<?> getStockMovementCountByWarehouse(@PathVariable Long warehouseId) {
        log.info("GET /api/inventory/movements/count/warehouse/{} - Fetching stock movement count by warehouse", warehouseId);
        try {
            long count = stockMovementService.getStockMovementCountByWarehouse(warehouseId);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Warehouse stock movement count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movement count for warehouse ID {}: {}", warehouseId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching warehouse stock movement count: " + e.getMessage()
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