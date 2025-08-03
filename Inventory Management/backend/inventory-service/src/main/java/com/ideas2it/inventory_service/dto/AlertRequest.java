package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.Alert;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertRequest {
    
    @NotNull(message = "Alert type is required")
    private Alert.AlertType alertType;
    
    @NotNull(message = "Severity is required")
    private Alert.Severity severity;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    private Alert.ReferenceType referenceType;
    
    private Long referenceId;
    
    @NotNull(message = "Priority is required")
    private Alert.Priority priority;
    
    private String notes;
} 