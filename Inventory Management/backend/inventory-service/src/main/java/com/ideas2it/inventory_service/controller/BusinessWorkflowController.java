package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.service.BusinessWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/business-workflows")
@RequiredArgsConstructor
@Slf4j
public class BusinessWorkflowController {
    
    private final BusinessWorkflowService businessWorkflowService;
    
    @PostMapping("/reorder-suggestions/generate")
    public ResponseEntity<?> generateReorderSuggestions() {
        log.info("POST /api/business-workflows/reorder-suggestions/generate - Manually triggering reorder suggestions");
        
        try {
            businessWorkflowService.generateReorderSuggestions();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Reorder suggestions generated successfully"
            ));
        } catch (Exception e) {
            log.error("Error generating reorder suggestions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error generating reorder suggestions: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/demand-forecasts/generate")
    public ResponseEntity<?> generateDemandForecasts() {
        log.info("POST /api/business-workflows/demand-forecasts/generate - Manually triggering demand forecasts");
        
        try {
            businessWorkflowService.generateDemandForecasts();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Demand forecasts generated successfully"
            ));
        } catch (Exception e) {
            log.error("Error generating demand forecasts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error generating demand forecasts: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/supplier-performance/track")
    public ResponseEntity<?> trackSupplierPerformance() {
        log.info("POST /api/business-workflows/supplier-performance/track - Manually triggering supplier performance tracking");
        
        try {
            businessWorkflowService.trackSupplierPerformance();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Supplier performance tracking completed successfully"
            ));
        } catch (Exception e) {
            log.error("Error tracking supplier performance: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error tracking supplier performance: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/inventory-optimization/run")
    public ResponseEntity<?> optimizeInventoryLevels() {
        log.info("POST /api/business-workflows/inventory-optimization/run - Manually triggering inventory optimization");
        
        try {
            businessWorkflowService.optimizeInventoryLevels();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Inventory optimization completed successfully"
            ));
        } catch (Exception e) {
            log.error("Error optimizing inventory levels: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error optimizing inventory levels: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/cost-optimization/analyze")
    public ResponseEntity<?> analyzeCostOptimization() {
        log.info("POST /api/business-workflows/cost-optimization/analyze - Manually triggering cost optimization analysis");
        
        try {
            businessWorkflowService.analyzeCostOptimization();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Cost optimization analysis completed successfully"
            ));
        } catch (Exception e) {
            log.error("Error analyzing cost optimization: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error analyzing cost optimization: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getWorkflowStatus() {
        log.info("GET /api/business-workflows/status - Getting workflow status");
        
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("scheduledWorkflows", Map.of(
                "reorderSuggestions", "Daily at 6:00 AM",
                "demandForecasts", "Weekly on Sunday at 2:00 AM",
                "supplierPerformance", "Daily at 8:00 PM",
                "inventoryOptimization", "Weekly on Saturday at 3:00 AM",
                "costOptimization", "Monthly on 1st at 4:00 AM"
            ));
            status.put("lastRun", Map.of(
                "reorderSuggestions", "Not yet run",
                "demandForecasts", "Not yet run",
                "supplierPerformance", "Not yet run",
                "inventoryOptimization", "Not yet run",
                "costOptimization", "Not yet run"
            ));
            status.put("nextRun", Map.of(
                "reorderSuggestions", "Tomorrow at 6:00 AM",
                "demandForecasts", "Next Sunday at 2:00 AM",
                "supplierPerformance", "Tonight at 8:00 PM",
                "inventoryOptimization", "Next Saturday at 3:00 AM",
                "costOptimization", "Next month 1st at 4:00 AM"
            ));
            
            return ResponseEntity.ok(new ApiResponse<>(
                    status,
                    true,
                    "Workflow status retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error getting workflow status: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error getting workflow status: " + e.getMessage()
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