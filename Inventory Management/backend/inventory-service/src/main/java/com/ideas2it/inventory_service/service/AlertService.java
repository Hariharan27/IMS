package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.AlertRequest;
import com.ideas2it.inventory_service.dto.AlertResponse;
import com.ideas2it.inventory_service.entity.Alert;
import com.ideas2it.inventory_service.entity.Inventory;
import com.ideas2it.inventory_service.entity.PurchaseOrder;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.repository.AlertRepository;
import com.ideas2it.inventory_service.repository.InventoryRepository;
import com.ideas2it.inventory_service.repository.PurchaseOrderRepository;
import com.ideas2it.inventory_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AlertService {
    
    private final AlertRepository alertRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    
    public List<AlertResponse> getAllAlerts() {
        log.info("Fetching all alerts");
        List<Alert> alerts = alertRepository.findAll();
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public AlertResponse getAlertById(Long id) {
        log.info("Fetching alert by ID: {}", id);
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + id));
        return AlertResponse.fromAlert(alert);
    }
    
    public List<AlertResponse> getActiveAlerts() {
        log.info("Fetching active alerts");
        List<Alert> alerts = alertRepository.findByStatusOrderByTriggeredAtDesc(Alert.AlertStatus.ACTIVE);
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public List<AlertResponse> getUnresolvedAlerts() {
        log.info("Fetching unresolved alerts");
        List<Alert> alerts = alertRepository.findUnresolvedAlerts();
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public List<AlertResponse> getAlertsByType(Alert.AlertType alertType) {
        log.info("Fetching alerts by type: {}", alertType);
        List<Alert> alerts = alertRepository.findByAlertTypeOrderByTriggeredAtDesc(alertType);
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public List<AlertResponse> getAlertsBySeverity(Alert.Severity severity) {
        log.info("Fetching alerts by severity: {}", severity);
        List<Alert> alerts = alertRepository.findBySeverityOrderByTriggeredAtDesc(severity);
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public List<AlertResponse> getAlertsByPriority(Alert.Priority priority) {
        log.info("Fetching alerts by priority: {}", priority);
        List<Alert> alerts = alertRepository.findByPriorityOrderByTriggeredAtDesc(priority);
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public List<AlertResponse> getCriticalAlerts() {
        log.info("Fetching critical alerts");
        List<Alert> alerts = alertRepository.findCriticalAlerts();
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public List<AlertResponse> getUrgentAlerts() {
        log.info("Fetching urgent alerts");
        List<Alert> alerts = alertRepository.findUrgentAlerts();
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public List<AlertResponse> getRecentAlerts() {
        log.info("Fetching recent alerts (last 24 hours)");
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        List<Alert> alerts = alertRepository.findRecentAlerts(twentyFourHoursAgo);
        return alerts.stream()
                .map(AlertResponse::fromAlert)
                .collect(Collectors.toList());
    }
    
    public Page<AlertResponse> getAlertsWithPagination(Pageable pageable) {
        log.info("Fetching alerts with pagination");
        Page<Alert> alertsPage = alertRepository.findAllByOrderByTriggeredAtDesc(pageable);
        return alertsPage.map(AlertResponse::fromAlert);
    }
    
    public AlertResponse createAlert(AlertRequest request, Long currentUserId) {
        log.info("Creating alert: {}", request.getTitle());
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Alert alert = new Alert();
        alert.setAlertType(request.getAlertType());
        alert.setSeverity(request.getSeverity());
        alert.setTitle(request.getTitle());
        alert.setMessage(request.getMessage());
        alert.setReferenceType(request.getReferenceType());
        alert.setReferenceId(request.getReferenceId());
        alert.setPriority(request.getPriority());
        alert.setNotes(request.getNotes());
        alert.setCreatedBy(currentUser);
        alert.setUpdatedBy(currentUser);
        
        Alert savedAlert = alertRepository.save(alert);
        log.info("Alert created successfully with ID: {}", savedAlert.getId());
        
        return AlertResponse.fromAlert(savedAlert);
    }
    
    public AlertResponse updateAlertStatus(Long id, Alert.AlertStatus newStatus, Long currentUserId) {
        log.info("Updating alert status to: {} for alert ID: {}", newStatus, id);
        
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + id));
        
        // Validate status transition
        if (!alert.canTransitionTo(newStatus)) {
            throw new RuntimeException("Invalid status transition from " + alert.getStatus() + " to " + newStatus);
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Update status based on new status
        switch (newStatus) {
            case ACKNOWLEDGED:
                alert.acknowledge();
                break;
            case RESOLVED:
                alert.resolve();
                break;
            case DISMISSED:
                alert.dismiss();
                break;
            default:
                alert.setStatus(newStatus);
        }
        
        alert.setUpdatedBy(currentUser);
        
        Alert updatedAlert = alertRepository.save(alert);
        log.info("Alert status updated successfully to: {}", newStatus);
        
        return AlertResponse.fromAlert(updatedAlert);
    }
    
    public void generateInventoryAlerts() {
        log.info("Generating inventory alerts");
        
        // Generate low stock alerts
        List<Inventory> lowStockInventory = inventoryRepository.findLowStockInventory();
        for (Inventory inventory : lowStockInventory) {
            createLowStockAlert(inventory);
        }
        
        // Generate out of stock alerts
        List<Inventory> outOfStockInventory = inventoryRepository.findOutOfStockInventory();
        for (Inventory inventory : outOfStockInventory) {
            createOutOfStockAlert(inventory);
        }
    }
    
    public void generatePurchaseOrderAlerts() {
        log.info("Generating purchase order alerts");
        
        LocalDate today = LocalDate.now();
        
        // Generate due date alerts (due within 3 days)
        LocalDate threeDaysFromNow = today.plusDays(3);
        List<PurchaseOrder> dueOrders = purchaseOrderRepository.findByStatusAndExpectedDeliveryDateLessThanEqualOrderByExpectedDeliveryDateAsc(
                PurchaseOrder.OrderStatus.APPROVED, threeDaysFromNow);
        
        for (PurchaseOrder order : dueOrders) {
            if (order.getExpectedDeliveryDate().equals(today)) {
                createPurchaseOrderDueAlert(order);
            } else if (order.getExpectedDeliveryDate().isBefore(today)) {
                createPurchaseOrderOverdueAlert(order);
            }
        }
    }
    
    private void createLowStockAlert(Inventory inventory) {
        // Check if alert already exists
        List<Alert> existingAlerts = alertRepository.findByReferenceTypeAndReferenceIdOrderByTriggeredAtDesc(
                Alert.ReferenceType.INVENTORY, inventory.getId());
        
        boolean hasActiveLowStockAlert = existingAlerts.stream()
                .anyMatch(alert -> alert.getAlertType() == Alert.AlertType.LOW_STOCK && 
                        alert.getStatus() == Alert.AlertStatus.ACTIVE);
        
        if (!hasActiveLowStockAlert) {
            AlertRequest request = new AlertRequest();
            request.setAlertType(Alert.AlertType.LOW_STOCK);
            request.setSeverity(Alert.Severity.MEDIUM);
            request.setPriority(Alert.Priority.HIGH);
            request.setTitle("Low Stock Alert: " + inventory.getProduct().getName());
            request.setMessage("Product " + inventory.getProduct().getName() + " has low stock. " +
                    "Current available quantity: " + inventory.getQuantityAvailable() + 
                    ", Reorder point: " + inventory.getProduct().getReorderPoint());
            request.setReferenceType(Alert.ReferenceType.INVENTORY);
            request.setReferenceId(inventory.getId());
            request.setNotes("Automatically generated low stock alert");
            
            createAlert(request, 1L); // TODO: Get from system context
        }
    }
    
    private void createOutOfStockAlert(Inventory inventory) {
        // Check if alert already exists
        List<Alert> existingAlerts = alertRepository.findByReferenceTypeAndReferenceIdOrderByTriggeredAtDesc(
                Alert.ReferenceType.INVENTORY, inventory.getId());
        
        boolean hasActiveOutOfStockAlert = existingAlerts.stream()
                .anyMatch(alert -> alert.getAlertType() == Alert.AlertType.OUT_OF_STOCK && 
                        alert.getStatus() == Alert.AlertStatus.ACTIVE);
        
        if (!hasActiveOutOfStockAlert) {
            AlertRequest request = new AlertRequest();
            request.setAlertType(Alert.AlertType.OUT_OF_STOCK);
            request.setSeverity(Alert.Severity.CRITICAL);
            request.setPriority(Alert.Priority.URGENT);
            request.setTitle("Out of Stock Alert: " + inventory.getProduct().getName());
            request.setMessage("Product " + inventory.getProduct().getName() + " is out of stock. " +
                    "Current available quantity: " + inventory.getQuantityAvailable());
            request.setReferenceType(Alert.ReferenceType.INVENTORY);
            request.setReferenceId(inventory.getId());
            request.setNotes("Automatically generated out of stock alert");
            
            createAlert(request, 1L); // TODO: Get from system context
        }
    }
    
    private void createPurchaseOrderDueAlert(PurchaseOrder order) {
        // Check if alert already exists
        List<Alert> existingAlerts = alertRepository.findByReferenceTypeAndReferenceIdOrderByTriggeredAtDesc(
                Alert.ReferenceType.PURCHASE_ORDER, order.getId());
        
        boolean hasActiveDueAlert = existingAlerts.stream()
                .anyMatch(alert -> alert.getAlertType() == Alert.AlertType.PURCHASE_ORDER_DUE && 
                        alert.getStatus() == Alert.AlertStatus.ACTIVE);
        
        if (!hasActiveDueAlert) {
            AlertRequest request = new AlertRequest();
            request.setAlertType(Alert.AlertType.PURCHASE_ORDER_DUE);
            request.setSeverity(Alert.Severity.HIGH);
            request.setPriority(Alert.Priority.HIGH);
            request.setTitle("Purchase Order Due: " + order.getPoNumber());
            request.setMessage("Purchase order " + order.getPoNumber() + " is due today. " +
                    "Expected delivery date: " + order.getExpectedDeliveryDate());
            request.setReferenceType(Alert.ReferenceType.PURCHASE_ORDER);
            request.setReferenceId(order.getId());
            request.setNotes("Automatically generated purchase order due alert");
            
            createAlert(request, 1L); // TODO: Get from system context
        }
    }
    
    private void createPurchaseOrderOverdueAlert(PurchaseOrder order) {
        // Check if alert already exists
        List<Alert> existingAlerts = alertRepository.findByReferenceTypeAndReferenceIdOrderByTriggeredAtDesc(
                Alert.ReferenceType.PURCHASE_ORDER, order.getId());
        
        boolean hasActiveOverdueAlert = existingAlerts.stream()
                .anyMatch(alert -> alert.getAlertType() == Alert.AlertType.PURCHASE_ORDER_OVERDUE && 
                        alert.getStatus() == Alert.AlertStatus.ACTIVE);
        
        if (!hasActiveOverdueAlert) {
            long daysOverdue = LocalDate.now().toEpochDay() - order.getExpectedDeliveryDate().toEpochDay();
            
            AlertRequest request = new AlertRequest();
            request.setAlertType(Alert.AlertType.PURCHASE_ORDER_OVERDUE);
            request.setSeverity(Alert.Severity.CRITICAL);
            request.setPriority(Alert.Priority.URGENT);
            request.setTitle("Purchase Order Overdue: " + order.getPoNumber());
            request.setMessage("Purchase order " + order.getPoNumber() + " is overdue by " + daysOverdue + " days. " +
                    "Expected delivery date: " + order.getExpectedDeliveryDate());
            request.setReferenceType(Alert.ReferenceType.PURCHASE_ORDER);
            request.setReferenceId(order.getId());
            request.setNotes("Automatically generated purchase order overdue alert");
            
            createAlert(request, 1L); // TODO: Get from system context
        }
    }
    
    public long getAlertCount() {
        return alertRepository.count();
    }
    
    public long getActiveAlertCount() {
        return alertRepository.countByStatus(Alert.AlertStatus.ACTIVE);
    }
    
    public long getUnresolvedAlertCount() {
        return alertRepository.countUnresolvedAlerts();
    }
    
    public long getAlertCountByType(Alert.AlertType alertType) {
        return alertRepository.countByAlertType(alertType);
    }
    
    public long getAlertCountBySeverity(Alert.Severity severity) {
        return alertRepository.countBySeverity(severity);
    }
    
    public long getAlertCountByPriority(Alert.Priority priority) {
        return alertRepository.countByPriority(priority);
    }
    
    public long getCriticalAlertCount() {
        return alertRepository.findCriticalAlerts().size();
    }
    
    public long getUrgentAlertCount() {
        return alertRepository.findUrgentAlerts().size();
    }
} 