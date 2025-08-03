package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping
    public ResponseEntity<?> getDashboardData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String warehouse,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String supplier) {
        
        log.info("GET /api/dashboard - Fetching dashboard data");
        
        try {
            // Set default date range if not provided (last 30 days)
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            
            Map<String, Object> dashboardData = dashboardService.getDashboardData(startDate, endDate, warehouse, category, supplier);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    dashboardData,
                    true,
                    "Dashboard data retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching dashboard data: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching dashboard data: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        log.info("GET /api/dashboard/metrics - Fetching dashboard metrics");
        
        try {
            Map<String, Object> metrics = dashboardService.getMetrics();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    metrics,
                    true,
                    "Dashboard metrics retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching dashboard metrics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching dashboard metrics: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/quick-actions")
    public ResponseEntity<?> getQuickActions() {
        log.info("GET /api/dashboard/quick-actions - Fetching quick actions");
        
        try {
            Map<String, Object> quickActions = dashboardService.getQuickActions();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    quickActions.get("data"),
                    true,
                    "Quick actions retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching quick actions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching quick actions: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/activities")
    public ResponseEntity<?> getRecentActivities(@RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/dashboard/activities - Fetching recent activities");
        
        try {
            Map<String, Object> activities = dashboardService.getRecentActivities(limit);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    activities.get("data"),
                    true,
                    "Recent activities retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching recent activities: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching recent activities: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/alerts")
    public ResponseEntity<?> getAlerts() {
        log.info("GET /api/dashboard/alerts - Fetching alerts");
        
        try {
            Map<String, Object> alerts = dashboardService.getAlerts();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts.get("data"),
                    true,
                    "Alerts retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alerts: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/stock-movements")
    public ResponseEntity<?> getStockMovements(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /api/dashboard/stock-movements - Fetching stock movements");
        
        try {
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            
            Map<String, Object> stockMovements = dashboardService.getStockMovements(startDate, endDate);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    stockMovements.get("data"),
                    true,
                    "Stock movements retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching stock movements: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching stock movements: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProducts(@RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/dashboard/top-products - Fetching top products");
        
        try {
            Map<String, Object> topProducts = dashboardService.getTopProducts(limit);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    topProducts.get("data"),
                    true,
                    "Top products retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching top products: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching top products: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/warehouse-distribution")
    public ResponseEntity<?> getWarehouseDistribution() {
        log.info("GET /api/dashboard/warehouse-distribution - Fetching warehouse distribution");
        
        try {
            Map<String, Object> warehouseDistribution = dashboardService.getWarehouseDistribution();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    warehouseDistribution.get("data"),
                    true,
                    "Warehouse distribution retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching warehouse distribution: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching warehouse distribution: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/category-distribution")
    public ResponseEntity<?> getCategoryDistribution() {
        log.info("GET /api/dashboard/category-distribution - Fetching category distribution");
        
        try {
            Map<String, Object> categoryDistribution = dashboardService.getCategoryDistribution();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    categoryDistribution.get("data"),
                    true,
                    "Category distribution retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching category distribution: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching category distribution: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/performance")
    public ResponseEntity<?> getPerformanceMetrics() {
        log.info("GET /api/dashboard/performance - Fetching performance metrics");
        
        try {
            Map<String, Object> performanceMetrics = dashboardService.getPerformanceMetrics();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    performanceMetrics,
                    true,
                    "Performance metrics retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching performance metrics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching performance metrics: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/alerts/{alertId}/read")
    public ResponseEntity<?> markAlertAsRead(@PathVariable String alertId) {
        log.info("POST /api/dashboard/alerts/{}/read - Marking alert as read", alertId);
        
        try {
            dashboardService.markAlertAsRead(alertId);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Alert marked as read successfully"
            ));
        } catch (Exception e) {
            log.error("Error marking alert as read: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error marking alert as read: " + e.getMessage()
            ));
        }
    }
    
    // Inner class for API response
    private static class ApiResponse<T> {
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