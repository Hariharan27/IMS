package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.AlertRequest;
import com.ideas2it.inventory_service.dto.AlertResponse;
import com.ideas2it.inventory_service.entity.Alert;
import com.ideas2it.inventory_service.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Slf4j
public class AlertController {
    
    private final AlertService alertService;
    
    @GetMapping
    public ResponseEntity<?> getAllAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/alerts - Fetching all alerts");
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AlertResponse> alerts = alertService.getAlertsWithPagination(pageable);
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts.getContent(),
                    true,
                    "Alerts retrieved successfully",
                    (int) alerts.getTotalElements()
            ));
        } catch (Exception e) {
            log.error("Error fetching alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alerts: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getAlertById(@PathVariable Long id) {
        log.info("GET /api/alerts/{} - Fetching alert by ID", id);
        try {
            AlertResponse alert = alertService.getAlertById(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    alert,
                    true,
                    "Alert retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching alert with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alert: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<?> getActiveAlerts() {
        log.info("GET /api/alerts/active - Fetching active alerts");
        try {
            List<AlertResponse> alerts = alertService.getActiveAlerts();
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Active alerts retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching active alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching active alerts: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/unresolved")
    public ResponseEntity<?> getUnresolvedAlerts() {
        log.info("GET /api/alerts/unresolved - Fetching unresolved alerts");
        try {
            List<AlertResponse> alerts = alertService.getUnresolvedAlerts();
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Unresolved alerts retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching unresolved alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching unresolved alerts: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/type/{alertType}")
    public ResponseEntity<?> getAlertsByType(@PathVariable Alert.AlertType alertType) {
        log.info("GET /api/alerts/type/{} - Fetching alerts by type", alertType);
        try {
            List<AlertResponse> alerts = alertService.getAlertsByType(alertType);
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Alerts by type retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching alerts by type {}: {}", alertType, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alerts by type: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/severity/{severity}")
    public ResponseEntity<?> getAlertsBySeverity(@PathVariable Alert.Severity severity) {
        log.info("GET /api/alerts/severity/{} - Fetching alerts by severity", severity);
        try {
            List<AlertResponse> alerts = alertService.getAlertsBySeverity(severity);
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Alerts by severity retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching alerts by severity {}: {}", severity, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alerts by severity: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/priority/{priority}")
    public ResponseEntity<?> getAlertsByPriority(@PathVariable Alert.Priority priority) {
        log.info("GET /api/alerts/priority/{} - Fetching alerts by priority", priority);
        try {
            List<AlertResponse> alerts = alertService.getAlertsByPriority(priority);
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Alerts by priority retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching alerts by priority {}: {}", priority, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alerts by priority: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/critical")
    public ResponseEntity<?> getCriticalAlerts() {
        log.info("GET /api/alerts/critical - Fetching critical alerts");
        try {
            List<AlertResponse> alerts = alertService.getCriticalAlerts();
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Critical alerts retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching critical alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching critical alerts: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/urgent")
    public ResponseEntity<?> getUrgentAlerts() {
        log.info("GET /api/alerts/urgent - Fetching urgent alerts");
        try {
            List<AlertResponse> alerts = alertService.getUrgentAlerts();
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Urgent alerts retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching urgent alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching urgent alerts: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentAlerts() {
        log.info("GET /api/alerts/recent - Fetching recent alerts");
        try {
            List<AlertResponse> alerts = alertService.getRecentAlerts();
            return ResponseEntity.ok(new ApiResponse<>(
                    alerts,
                    true,
                    "Recent alerts retrieved successfully",
                    alerts.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching recent alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching recent alerts: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createAlert(@RequestBody AlertRequest request) {
        log.info("POST /api/alerts - Creating alert");
        try {
            AlertResponse alert = alertService.createAlert(request, 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    alert,
                    true,
                    "Alert created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating alert: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error creating alert: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAlertStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        log.info("PUT /api/alerts/{}/status - Updating alert status", id);
        try {
            AlertResponse alert = alertService.updateAlertStatus(id, request.getStatus(), 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    alert,
                    true,
                    "Alert status updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating alert status for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating alert status: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/generate")
    public ResponseEntity<?> generateAlerts() {
        log.info("POST /api/alerts/generate - Generating alerts");
        try {
            // Generate inventory alerts
            alertService.generateInventoryAlerts();
            
            // Generate purchase order alerts
            alertService.generatePurchaseOrderAlerts();
            
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Alerts generated successfully"
            ));
        } catch (Exception e) {
            log.error("Error generating alerts: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error generating alerts: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getAlertCount() {
        log.info("GET /api/alerts/count - Fetching alert count");
        try {
            long count = alertService.getAlertCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Alert count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching alert count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alert count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/active")
    public ResponseEntity<?> getActiveAlertCount() {
        log.info("GET /api/alerts/count/active - Fetching active alert count");
        try {
            long count = alertService.getActiveAlertCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Active alert count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching active alert count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching active alert count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/unresolved")
    public ResponseEntity<?> getUnresolvedAlertCount() {
        log.info("GET /api/alerts/count/unresolved - Fetching unresolved alert count");
        try {
            long count = alertService.getUnresolvedAlertCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Unresolved alert count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching unresolved alert count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching unresolved alert count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/type/{alertType}")
    public ResponseEntity<?> getAlertCountByType(@PathVariable Alert.AlertType alertType) {
        log.info("GET /api/alerts/count/type/{} - Fetching alert count by type", alertType);
        try {
            long count = alertService.getAlertCountByType(alertType);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Alert count by type retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching alert count by type {}: {}", alertType, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alert count by type: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/severity/{severity}")
    public ResponseEntity<?> getAlertCountBySeverity(@PathVariable Alert.Severity severity) {
        log.info("GET /api/alerts/count/severity/{} - Fetching alert count by severity", severity);
        try {
            long count = alertService.getAlertCountBySeverity(severity);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Alert count by severity retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching alert count by severity {}: {}", severity, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alert count by severity: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/priority/{priority}")
    public ResponseEntity<?> getAlertCountByPriority(@PathVariable Alert.Priority priority) {
        log.info("GET /api/alerts/count/priority/{} - Fetching alert count by priority", priority);
        try {
            long count = alertService.getAlertCountByPriority(priority);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Alert count by priority retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching alert count by priority {}: {}", priority, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching alert count by priority: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/critical")
    public ResponseEntity<?> getCriticalAlertCount() {
        log.info("GET /api/alerts/count/critical - Fetching critical alert count");
        try {
            long count = alertService.getCriticalAlertCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Critical alert count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching critical alert count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching critical alert count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/urgent")
    public ResponseEntity<?> getUrgentAlertCount() {
        log.info("GET /api/alerts/count/urgent - Fetching urgent alert count");
        try {
            long count = alertService.getUrgentAlertCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Urgent alert count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching urgent alert count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching urgent alert count: " + e.getMessage()
            ));
        }
    }
    
    // Helper classes for request/response
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
    
    public static class StatusUpdateRequest {
        private Alert.AlertStatus status;
        private String notes;
        
        // Getters and setters
        public Alert.AlertStatus getStatus() { return status; }
        public void setStatus(Alert.AlertStatus status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
} 