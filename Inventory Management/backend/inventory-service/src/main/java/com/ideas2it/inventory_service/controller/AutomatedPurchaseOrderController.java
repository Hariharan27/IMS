package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.service.AutomatedPurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/automated-purchase-orders")
@RequiredArgsConstructor
@Slf4j
public class AutomatedPurchaseOrderController {
    
    private final AutomatedPurchaseOrderService automatedPurchaseOrderService;
    
    @PostMapping("/generate")
    public ResponseEntity<?> generateAutomatedPurchaseOrders() {
        log.info("POST /api/automated-purchase-orders/generate - Manually triggering automated PO generation");
        
        try {
            automatedPurchaseOrderService.triggerAutomatedPOGeneration();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Automated purchase orders generated successfully"
            ));
        } catch (Exception e) {
            log.error("Error generating automated purchase orders: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error generating automated purchase orders: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/generate/{productId}/{warehouseId}")
    public ResponseEntity<?> generateAutomatedPOForProduct(
            @PathVariable Long productId,
            @PathVariable Long warehouseId) {
        log.info("POST /api/automated-purchase-orders/generate/{}/{} - Generating automated PO for specific product", 
                productId, warehouseId);
        
        try {
            automatedPurchaseOrderService.generateAutomatedPOForProduct(productId, warehouseId);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Automated purchase order generated successfully for product ID: " + productId
            ));
        } catch (Exception e) {
            log.error("Error generating automated PO for product ID {}: {}", productId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error generating automated PO: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getAutomatedPOStatus() {
        log.info("GET /api/automated-purchase-orders/status - Getting automated PO status");
        
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("automatedWorkflow", Map.of(
                "schedule", "Daily at 7:00 AM",
                "lastRun", "Not yet run",
                "nextRun", "Tomorrow at 7:00 AM",
                "enabled", true
            ));
            status.put("businessRules", Map.of(
                "lowStockThreshold", "Below reorder point",
                "minimumOrderQuantity", "10 units",
                "leadTime", "7 days",
                "safetyStock", "20% of daily demand"
            ));
            status.put("automationFeatures", Map.of(
                "demandAnalysis", "30-day historical data",
                "supplierSelection", "Performance-based",
                "quantityCalculation", "Optimal order quantity",
                "costEstimation", "Automatic calculation"
            ));
            
            return ResponseEntity.ok(new ApiResponse<>(
                    status,
                    true,
                    "Automated PO status retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error getting automated PO status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error getting automated PO status: " + e.getMessage()
            ));
        }
    }
    
    private static class ApiResponse<T> {
        private T data;
        private boolean success;
        private String message;
        
        public ApiResponse(T data, boolean success, String message) {
            this.data = data;
            this.success = success;
            this.message = message;
        }
        
        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
} 