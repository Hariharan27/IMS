package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.Alert;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    
    private Long id;
    private Alert.AlertType alertType;
    private Alert.Severity severity;
    private String title;
    private String message;
    private Alert.ReferenceType referenceType;
    private Long referenceId;
    private Alert.AlertStatus status;
    private Alert.Priority priority;
    private LocalDateTime triggeredAt;
    private LocalDateTime resolvedAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse createdBy;
    private UserResponse updatedBy;
    private boolean isActive;
    private boolean isResolved;
    private boolean isUnresolved;
    
    public static AlertResponse fromAlert(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setAlertType(alert.getAlertType());
        response.setSeverity(alert.getSeverity());
        response.setTitle(alert.getTitle());
        response.setMessage(alert.getMessage());
        response.setReferenceType(alert.getReferenceType());
        response.setReferenceId(alert.getReferenceId());
        response.setStatus(alert.getStatus());
        response.setPriority(alert.getPriority());
        response.setTriggeredAt(alert.getTriggeredAt());
        response.setResolvedAt(alert.getResolvedAt());
        response.setNotes(alert.getNotes());
        response.setCreatedAt(alert.getCreatedAt());
        response.setUpdatedAt(alert.getUpdatedAt());
        
        // Map audit fields
        if (alert.getCreatedBy() != null) {
            response.setCreatedBy(UserResponse.fromUser(alert.getCreatedBy()));
        }
        
        if (alert.getUpdatedBy() != null) {
            response.setUpdatedBy(UserResponse.fromUser(alert.getUpdatedBy()));
        }
        
        // Calculate derived fields
        response.setActive(alert.isActive());
        response.setResolved(alert.isResolved());
        response.setUnresolved(alert.isUnresolved());
        
        return response;
    }
} 