package com.ideas2it.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 50)
    private AlertType alertType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private Severity severity;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 50)
    private ReferenceType referenceType;
    
    @Column(name = "reference_id")
    private Long referenceId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AlertStatus status = AlertStatus.ACTIVE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private Priority priority;
    
    @Column(name = "triggered_at", nullable = false)
    private LocalDateTime triggeredAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    
    public enum AlertType {
        LOW_STOCK, OUT_OF_STOCK, PURCHASE_ORDER_DUE, PURCHASE_ORDER_OVERDUE, 
        INVENTORY_ADJUSTMENT, SYSTEM_ALERT
    }
    
    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    public enum Priority {
        LOW, NORMAL, HIGH, URGENT
    }
    
    public enum AlertStatus {
        ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
    }
    
    public enum ReferenceType {
        INVENTORY, PURCHASE_ORDER, PRODUCT, WAREHOUSE, SYSTEM
    }
    
    // Helper methods
    public boolean isActive() {
        return this.status == AlertStatus.ACTIVE;
    }
    
    public boolean isResolved() {
        return this.status == AlertStatus.RESOLVED;
    }
    
    public boolean isUnresolved() {
        return this.status != AlertStatus.RESOLVED && this.status != AlertStatus.DISMISSED;
    }
    
    public void acknowledge() {
        this.status = AlertStatus.ACKNOWLEDGED;
    }
    
    public void resolve() {
        this.status = AlertStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
    }
    
    public void dismiss() {
        this.status = AlertStatus.DISMISSED;
    }
    
    public boolean canTransitionTo(AlertStatus newStatus) {
        switch (this.status) {
            case ACTIVE:
                return newStatus == AlertStatus.ACKNOWLEDGED || 
                       newStatus == AlertStatus.RESOLVED || 
                       newStatus == AlertStatus.DISMISSED;
            case ACKNOWLEDGED:
                return newStatus == AlertStatus.RESOLVED || 
                       newStatus == AlertStatus.DISMISSED;
            case RESOLVED:
            case DISMISSED:
                return false; // Terminal states
            default:
                return false;
        }
    }
    
    @PrePersist
    public void setTriggeredAt() {
        if (this.triggeredAt == null) {
            this.triggeredAt = LocalDateTime.now();
        }
    }
} 