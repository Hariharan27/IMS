package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    
    // Find active alerts
    List<Alert> findByStatusOrderByTriggeredAtDesc(Alert.AlertStatus status);
    
    // Find alerts by type
    List<Alert> findByAlertTypeOrderByTriggeredAtDesc(Alert.AlertType alertType);
    
    // Find alerts by severity
    List<Alert> findBySeverityOrderByTriggeredAtDesc(Alert.Severity severity);
    
    // Find alerts by priority
    List<Alert> findByPriorityOrderByTriggeredAtDesc(Alert.Priority priority);
    
    // Find unresolved alerts
    @Query("SELECT a FROM Alert a WHERE a.status NOT IN ('RESOLVED', 'DISMISSED') ORDER BY a.triggeredAt DESC")
    List<Alert> findUnresolvedAlerts();
    
    // Find alerts by reference type and reference ID
    List<Alert> findByReferenceTypeAndReferenceIdOrderByTriggeredAtDesc(Alert.ReferenceType referenceType, Long referenceId);
    
    // Find alerts by type and status
    List<Alert> findByAlertTypeAndStatusOrderByTriggeredAtDesc(Alert.AlertType alertType, Alert.AlertStatus status);
    
    // Find alerts by severity and status
    List<Alert> findBySeverityAndStatusOrderByTriggeredAtDesc(Alert.Severity severity, Alert.AlertStatus status);
    
    // Find alerts by priority and status
    List<Alert> findByPriorityAndStatusOrderByTriggeredAtDesc(Alert.Priority priority, Alert.AlertStatus status);
    
    // Find alerts triggered after a specific date
    @Query("SELECT a FROM Alert a WHERE a.triggeredAt >= :startDate ORDER BY a.triggeredAt DESC")
    List<Alert> findByTriggeredAtAfterOrderByTriggeredAtDesc(@Param("startDate") LocalDateTime startDate);
    
    // Find alerts triggered between dates
    @Query("SELECT a FROM Alert a WHERE a.triggeredAt BETWEEN :startDate AND :endDate ORDER BY a.triggeredAt DESC")
    List<Alert> findByTriggeredAtBetweenOrderByTriggeredAtDesc(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find alerts by type triggered after a specific date
    @Query("SELECT a FROM Alert a WHERE a.alertType = :alertType AND a.triggeredAt >= :startDate ORDER BY a.triggeredAt DESC")
    List<Alert> findByAlertTypeAndTriggeredAtAfterOrderByTriggeredAtDesc(@Param("alertType") Alert.AlertType alertType, @Param("startDate") LocalDateTime startDate);
    
    // Find alerts by severity triggered after a specific date
    @Query("SELECT a FROM Alert a WHERE a.severity = :severity AND a.triggeredAt >= :startDate ORDER BY a.triggeredAt DESC")
    List<Alert> findBySeverityAndTriggeredAtAfterOrderByTriggeredAtDesc(@Param("severity") Alert.Severity severity, @Param("startDate") LocalDateTime startDate);
    
    // Find alerts with pagination
    Page<Alert> findAllByOrderByTriggeredAtDesc(Pageable pageable);
    
    // Find alerts by status with pagination
    Page<Alert> findByStatusOrderByTriggeredAtDesc(Alert.AlertStatus status, Pageable pageable);
    
    // Find alerts by type with pagination
    Page<Alert> findByAlertTypeOrderByTriggeredAtDesc(Alert.AlertType alertType, Pageable pageable);
    
    // Find alerts by severity with pagination
    Page<Alert> findBySeverityOrderByTriggeredAtDesc(Alert.Severity severity, Pageable pageable);
    
    // Find alerts by priority with pagination
    Page<Alert> findByPriorityOrderByTriggeredAtDesc(Alert.Priority priority, Pageable pageable);
    
    // Count alerts by status
    long countByStatus(Alert.AlertStatus status);
    
    // Count alerts by type
    long countByAlertType(Alert.AlertType alertType);
    
    // Count alerts by severity
    long countBySeverity(Alert.Severity severity);
    
    // Count alerts by priority
    long countByPriority(Alert.Priority priority);
    
    // Count unresolved alerts
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.status NOT IN ('RESOLVED', 'DISMISSED')")
    long countUnresolvedAlerts();
    
    // Count alerts by type and status
    long countByAlertTypeAndStatus(Alert.AlertType alertType, Alert.AlertStatus status);
    
    // Count alerts by severity and status
    long countBySeverityAndStatus(Alert.Severity severity, Alert.AlertStatus status);
    
    // Count alerts by priority and status
    long countByPriorityAndStatus(Alert.Priority priority, Alert.AlertStatus status);
    
    // Count alerts triggered after a specific date
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.triggeredAt >= :startDate")
    long countByTriggeredAtAfter(@Param("startDate") LocalDateTime startDate);
    
    // Count alerts by type triggered after a specific date
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.alertType = :alertType AND a.triggeredAt >= :startDate")
    long countByAlertTypeAndTriggeredAtAfter(@Param("alertType") Alert.AlertType alertType, @Param("startDate") LocalDateTime startDate);
    
    // Count alerts by severity triggered after a specific date
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.severity = :severity AND a.triggeredAt >= :startDate")
    long countBySeverityAndTriggeredAtAfter(@Param("severity") Alert.Severity severity, @Param("startDate") LocalDateTime startDate);
    
    // Find critical alerts (HIGH or CRITICAL severity)
    @Query("SELECT a FROM Alert a WHERE a.severity IN ('HIGH', 'CRITICAL') AND a.status NOT IN ('RESOLVED', 'DISMISSED') ORDER BY a.triggeredAt DESC")
    List<Alert> findCriticalAlerts();
    
    // Find urgent alerts (HIGH or URGENT priority)
    @Query("SELECT a FROM Alert a WHERE a.priority IN ('HIGH', 'URGENT') AND a.status NOT IN ('RESOLVED', 'DISMISSED') ORDER BY a.triggeredAt DESC")
    List<Alert> findUrgentAlerts();
    
    // Find recent alerts (last 24 hours)
    @Query("SELECT a FROM Alert a WHERE a.triggeredAt >= :twentyFourHoursAgo ORDER BY a.triggeredAt DESC")
    List<Alert> findRecentAlerts(@Param("twentyFourHoursAgo") LocalDateTime twentyFourHoursAgo);
    
    // Find alerts by reference type
    List<Alert> findByReferenceTypeOrderByTriggeredAtDesc(Alert.ReferenceType referenceType);
    
    // Find alerts by reference type and status
    List<Alert> findByReferenceTypeAndStatusOrderByTriggeredAtDesc(Alert.ReferenceType referenceType, Alert.AlertStatus status);
} 