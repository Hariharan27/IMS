package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.entity.*;
import com.ideas2it.inventory_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DashboardService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final AlertRepository alertRepository;
    private final CategoryRepository categoryRepository;

    public Map<String, Object> getDashboardData(LocalDate startDate, LocalDate endDate, String warehouse, String category, String supplier) {
        log.info("Getting dashboard data for period: {} to {}", startDate, endDate);
        
        Map<String, Object> dashboardData = new HashMap<>();
        dashboardData.put("metrics", getMetrics());
        dashboardData.put("quickActions", getQuickActions());
        dashboardData.put("recentActivities", getRecentActivities(10));
        dashboardData.put("alerts", getAlerts());
        dashboardData.put("stockMovements", getStockMovements(startDate, endDate));
        dashboardData.put("topProducts", getTopProducts(10));
        dashboardData.put("warehouseDistribution", getWarehouseDistribution());
        dashboardData.put("categoryDistribution", getCategoryDistribution());
        dashboardData.put("performanceMetrics", getPerformanceMetrics());
        
        return dashboardData;
    }

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Get current month data
        LocalDate now = LocalDate.now();
        LocalDate currentMonthStart = now.withDayOfMonth(1);
        LocalDate previousMonthStart = currentMonthStart.minusMonths(1);
        LocalDate previousMonthEnd = currentMonthStart.minusDays(1);
        
        // Current month metrics
        long totalProducts = productRepository.countByIsActiveTrue();
        long lowStockItems = inventoryRepository.findLowStockInventory().size();
        long activeSuppliers = supplierRepository.countByIsActiveTrue();
        long totalWarehouses = warehouseRepository.countActiveWarehouses();
        long pendingOrders = purchaseOrderRepository.countByStatus(PurchaseOrder.OrderStatus.SUBMITTED);
        long criticalAlerts = alertRepository.countBySeverityAndStatus(Alert.Severity.CRITICAL, Alert.AlertStatus.ACTIVE);
        
        // Calculate total inventory value
        BigDecimal totalValue = calculateTotalInventoryValue();
        
        // Get recent orders count (last 30 days)
        long recentOrders = purchaseOrderRepository.findByOrderDateBetweenOrderByOrderDateDesc(
            now.minusDays(30), 
            now
        ).size();
        
        // Calculate trends (comparing with previous month)
        Map<String, Object> totalProductsTrend = calculateTrend(
            totalProducts, 
            getPreviousMonthProductCount(previousMonthStart, previousMonthEnd)
        );
        
        Map<String, Object> lowStockTrend = calculateTrend(
            lowStockItems, 
            getPreviousMonthLowStockCount(previousMonthStart, previousMonthEnd)
        );
        
        Map<String, Object> recentOrdersTrend = calculateTrend(
            recentOrders, 
            getPreviousMonthOrdersCount(previousMonthStart, previousMonthEnd)
        );
        
        Map<String, Object> totalValueTrend = calculateTrend(
            totalValue.doubleValue(), 
            getPreviousMonthTotalValue(previousMonthStart, previousMonthEnd)
        );
        
        // Build metrics with trends
        metrics.put("totalProducts", totalProducts);
        metrics.put("totalProductsTrend", totalProductsTrend);
        
        metrics.put("lowStockItems", lowStockItems);
        metrics.put("lowStockTrend", lowStockTrend);
        
        metrics.put("recentOrders", recentOrders);
        metrics.put("recentOrdersTrend", recentOrdersTrend);
        
        metrics.put("totalValue", totalValue);
        metrics.put("totalValueTrend", totalValueTrend);
        
        metrics.put("activeSuppliers", activeSuppliers);
        metrics.put("totalWarehouses", totalWarehouses);
        metrics.put("pendingOrders", pendingOrders);
        metrics.put("criticalAlerts", criticalAlerts);
        
        return metrics;
    }

    private BigDecimal calculateTotalInventoryValue() {
        BigDecimal totalValue = BigDecimal.ZERO;
        List<Inventory> allInventory = inventoryRepository.findInventoryWithStock();
        for (Inventory inventory : allInventory) {
            if (inventory.getProduct().getSellingPrice() != null) {
                totalValue = totalValue.add(
                    inventory.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(inventory.getQuantityAvailable()))
                );
            }
        }
        return totalValue;
    }

    private Map<String, Object> calculateTrend(double currentValue, double previousValue) {
        Map<String, Object> trend = new HashMap<>();
        
        if (previousValue == 0) {
            if (currentValue > 0) {
                trend.put("change", 100.0);
                trend.put("changeType", "increase");
            } else {
                trend.put("change", 0.0);
                trend.put("changeType", "stable");
            }
        } else {
            double percentageChange = ((currentValue - previousValue) / previousValue) * 100;
            trend.put("change", Math.round(percentageChange * 100.0) / 100.0); // Round to 2 decimal places
            
            if (percentageChange > 0) {
                trend.put("changeType", "increase");
            } else if (percentageChange < 0) {
                trend.put("changeType", "decrease");
            } else {
                trend.put("changeType", "stable");
            }
        }
        
        trend.put("currentValue", currentValue);
        trend.put("previousValue", previousValue);
        
        return trend;
    }

    private long getPreviousMonthProductCount(LocalDate startDate, LocalDate endDate) {
        // For products, we'll use the current count as previous month count since products don't change frequently
        // In a real scenario, you might want to track product creation dates
        return productRepository.countByIsActiveTrue();
    }

    private long getPreviousMonthLowStockCount(LocalDate startDate, LocalDate endDate) {
        // For low stock, we'll use current count as previous month count
        // In a real scenario, you might want to track historical inventory levels
        return inventoryRepository.findLowStockInventory().size();
    }

    private long getPreviousMonthOrdersCount(LocalDate startDate, LocalDate endDate) {
        return purchaseOrderRepository.findByOrderDateBetweenOrderByOrderDateDesc(startDate, endDate).size();
    }

    private double getPreviousMonthTotalValue(LocalDate startDate, LocalDate endDate) {
        // For total value, we'll use current value as previous month value
        // In a real scenario, you might want to track historical inventory values
        return calculateTotalInventoryValue().doubleValue();
    }

    public Map<String, Object> getQuickActions() {
        List<Map<String, Object>> actions = Arrays.asList(
            createQuickAction("add_product", "Add Product", "Create a new product", "add_product", "/products/new", "#2196F3", Arrays.asList("ADMIN", "MANAGER")),
            createQuickAction("view_inventory", "View Inventory", "Check current stock levels", "view_inventory", "/inventory", "#4CAF50", Arrays.asList("ADMIN", "MANAGER", "STAFF")),
            createQuickAction("create_order", "Create Order", "Create a new purchase order", "create_order", "/purchase-orders/new", "#FF9800", Arrays.asList("ADMIN", "MANAGER")),
            createQuickAction("view_reports", "View Reports", "Access analytics and reports", "view_reports", "/reports", "#9C27B0", Arrays.asList("ADMIN", "MANAGER")),
            createQuickAction("manage_users", "Manage Users", "User management interface", "manage_users", "/users", "#607D8B", Arrays.asList("ADMIN")),
            createQuickAction("manage_suppliers", "Manage Suppliers", "Supplier management", "manage_suppliers", "/suppliers", "#795548", Arrays.asList("ADMIN", "MANAGER")),
            createQuickAction("view_alerts", "View Alerts", "System alerts and notifications", "view_alerts", "/alerts", "#F44336", Arrays.asList("ADMIN", "MANAGER", "STAFF")),
            createQuickAction("settings", "Settings", "System configuration", "settings", "/settings", "#9E9E9E", Arrays.asList("ADMIN"))
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", actions);
        return result;
    }

    private Map<String, Object> createQuickAction(String id, String title, String description, String icon, String link, String color, List<String> roles) {
        Map<String, Object> action = new HashMap<>();
        action.put("id", id);
        action.put("title", title);
        action.put("description", description);
        action.put("icon", icon);
        action.put("link", link);
        action.put("color", color);
        action.put("roles", roles);
        return action;
    }

    public Map<String, Object> getRecentActivities(int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Get recent purchase orders as activities
        List<PurchaseOrder> recentOrders = purchaseOrderRepository.findByOrderDateBetweenOrderByOrderDateDesc(
            LocalDate.now().minusDays(30), 
            LocalDate.now()
        );
        
        for (PurchaseOrder order : recentOrders) {
            activities.add(createActivity(
                order.getId().toString(),
                "order_created",
                "Purchase Order",
                "PO-" + order.getPoNumber() + " created with status " + order.getStatus(),
                order.getCreatedAt().toString(),
                order.getCreatedBy() != null ? order.getCreatedBy().getUsername() : "system",
                "medium",
                "/purchase-orders/" + order.getId()
            ));
        }
        
        // Sort by timestamp and limit
        activities.sort((a, b) -> b.get("timestamp").toString().compareTo(a.get("timestamp").toString()));
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", activities.subList(0, Math.min(limit, activities.size())));
        return result;
    }

    private Map<String, Object> createActivity(String id, String type, String title, String description, String timestamp, String user, String severity, String link) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("id", id);
        activity.put("type", type);
        activity.put("title", title);
        activity.put("description", description);
        activity.put("timestamp", timestamp);
        activity.put("user", user);
        activity.put("severity", severity);
        activity.put("link", link);
        return activity;
    }

    public Map<String, Object> getAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        // Get active alerts from database
        List<Alert> activeAlerts = alertRepository.findByStatusOrderByTriggeredAtDesc(Alert.AlertStatus.ACTIVE);
        for (Alert alert : activeAlerts) {
            alerts.add(createAlert(
                alert.getId().toString(),
                alert.getAlertType().toString(),
                alert.getTitle(),
                alert.getMessage(),
                alert.getSeverity().toString(),
                alert.getTriggeredAt().toString(),
                alert.getStatus() != Alert.AlertStatus.ACTIVE,
                "View Details",
                "/alerts/" + alert.getId()
            ));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", alerts);
        return result;
    }

    private Map<String, Object> createAlert(String id, String type, String title, String message, String severity, String timestamp, boolean read, String actionLabel, String actionLink) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("id", id);
        alert.put("type", type);
        alert.put("title", title);
        alert.put("message", message);
        alert.put("severity", severity);
        alert.put("timestamp", timestamp);
        alert.put("read", read);
        
        if (actionLabel != null && actionLink != null) {
            Map<String, Object> action = new HashMap<>();
            action.put("label", actionLabel);
            action.put("link", actionLink);
            alert.put("action", action);
        }
        
        return alert;
    }

    public Map<String, Object> getStockMovements(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> movements = new ArrayList<>();
        
        // For now, create mock stock movement data
        // In a real implementation, this would come from a stock movement table
        movements.add(createStockMovement("2024-01-10", 100, 50, 50));
        movements.add(createStockMovement("2024-01-11", 75, 60, 15));
        movements.add(createStockMovement("2024-01-12", 120, 40, 80));
        movements.add(createStockMovement("2024-01-13", 90, 70, 20));
        movements.add(createStockMovement("2024-01-14", 110, 45, 65));
        movements.add(createStockMovement("2024-01-15", 85, 55, 30));
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", movements);
        return result;
    }

    private Map<String, Object> createStockMovement(String date, int in, int out, int net) {
        Map<String, Object> movement = new HashMap<>();
        movement.put("date", date);
        movement.put("in", in);
        movement.put("out", out);
        movement.put("net", net);
        return movement;
    }

    public Map<String, Object> getTopProducts(int limit) {
        List<Map<String, Object>> products = new ArrayList<>();
        
        // Get top products by quantity from inventory
        List<Inventory> topInventories = inventoryRepository.findInventoryWithStock();
        topInventories.sort((a, b) -> Integer.compare(b.getQuantityAvailable(), a.getQuantityAvailable()));
        
        for (int i = 0; i < Math.min(limit, topInventories.size()); i++) {
            Inventory inventory = topInventories.get(i);
            products.add(createTopProduct(
                inventory.getProduct().getName(),
                inventory.getQuantityAvailable(),
                inventory.getProduct().getSellingPrice() != null ? 
                    inventory.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(inventory.getQuantityAvailable())) : 
                    BigDecimal.ZERO,
                inventory.getProduct().getCategory().getName()
            ));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", products);
        return result;
    }

    private Map<String, Object> createTopProduct(String name, int quantity, BigDecimal value, String category) {
        Map<String, Object> product = new HashMap<>();
        product.put("name", name);
        product.put("quantity", quantity);
        product.put("value", value);
        product.put("category", category);
        return product;
    }

    public Map<String, Object> getWarehouseDistribution() {
        List<Map<String, Object>> distribution = new ArrayList<>();
        
        // Get warehouse distribution from database
        List<Warehouse> warehouses = warehouseRepository.findByIsActiveTrue();
        List<Inventory> allInventory = inventoryRepository.findInventoryWithStock();
        
        for (Warehouse warehouse : warehouses) {
            long productCount = allInventory.stream()
                .filter(inv -> inv.getWarehouse().getId().equals(warehouse.getId()))
                .count();
            
            BigDecimal totalValue = allInventory.stream()
                .filter(inv -> inv.getWarehouse().getId().equals(warehouse.getId()))
                .map(inv -> inv.getProduct().getSellingPrice() != null ? 
                    inv.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(inv.getQuantityAvailable())) : 
                    BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            double percentage = allInventory.size() > 0 ? (double) productCount / allInventory.size() * 100 : 0;
            
            distribution.add(createWarehouseDistribution(
                warehouse.getName(),
                (int) productCount,
                totalValue,
                percentage
            ));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", distribution);
        return result;
    }

    private Map<String, Object> createWarehouseDistribution(String warehouse, int products, BigDecimal value, double percentage) {
        Map<String, Object> distribution = new HashMap<>();
        distribution.put("warehouse", warehouse);
        distribution.put("products", products);
        distribution.put("value", value);
        distribution.put("percentage", percentage);
        return distribution;
    }

    public Map<String, Object> getCategoryDistribution() {
        List<Map<String, Object>> distribution = new ArrayList<>();
        
        // Get category distribution from database
        List<Category> categories = categoryRepository.findByIsActiveTrue();
        List<Inventory> allInventory = inventoryRepository.findInventoryWithStock();
        
        for (Category category : categories) {
            long productCount = allInventory.stream()
                .filter(inv -> inv.getProduct().getCategory().getId().equals(category.getId()))
                .count();
            
            BigDecimal totalValue = allInventory.stream()
                .filter(inv -> inv.getProduct().getCategory().getId().equals(category.getId()))
                .map(inv -> inv.getProduct().getSellingPrice() != null ? 
                    inv.getProduct().getSellingPrice().multiply(BigDecimal.valueOf(inv.getQuantityAvailable())) : 
                    BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            double percentage = allInventory.size() > 0 ? (double) productCount / allInventory.size() * 100 : 0;
            
            distribution.add(createCategoryDistribution(
                category.getName(),
                (int) productCount,
                totalValue,
                percentage
            ));
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", distribution);
        return result;
    }

    private Map<String, Object> createCategoryDistribution(String category, int products, BigDecimal value, double percentage) {
        Map<String, Object> distribution = new HashMap<>();
        distribution.put("category", category);
        distribution.put("products", products);
        distribution.put("value", value);
        distribution.put("percentage", percentage);
        return distribution;
    }

    public Map<String, Object> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Calculate real performance metrics from database
        double inventoryTurnover = calculateInventoryTurnover();
        double stockAccuracy = calculateStockAccuracy();
        double orderFulfillment = calculateOrderFulfillment();
        double supplierPerformance = calculateSupplierPerformance();
        
        metrics.put("inventoryTurnover", inventoryTurnover);
        metrics.put("stockAccuracy", stockAccuracy);
        metrics.put("orderFulfillment", orderFulfillment);
        metrics.put("supplierPerformance", supplierPerformance);
        
        return metrics;
    }

    private double calculateInventoryTurnover() {
        // Calculate inventory turnover ratio
        // This would be a complex calculation based on sales and average inventory
        return 12.5; // Placeholder - would need sales data
    }

    private double calculateStockAccuracy() {
        // Calculate stock accuracy based on physical counts vs system counts
        return 95.2; // Placeholder - would need physical count data
    }

    private double calculateOrderFulfillment() {
        // Calculate order fulfillment rate
        long totalOrders = purchaseOrderRepository.count();
        long fulfilledOrders = purchaseOrderRepository.countByStatus(PurchaseOrder.OrderStatus.FULLY_RECEIVED);
        return totalOrders > 0 ? (double) fulfilledOrders / totalOrders * 100 : 0;
    }

    private double calculateSupplierPerformance() {
        // Calculate supplier performance based on delivery times, quality, etc.
        return 92.3; // Placeholder - would need supplier performance data
    }

    public void markAlertAsRead(String alertId) {
        log.info("Marking alert {} as read", alertId);
        Alert alert = alertRepository.findById(Long.valueOf(alertId))
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));
        alert.acknowledge(); // Use the helper method to acknowledge the alert
        alertRepository.save(alert);
    }
} 