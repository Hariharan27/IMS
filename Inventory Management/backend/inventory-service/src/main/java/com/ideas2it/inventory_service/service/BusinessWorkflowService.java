package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.entity.*;
import com.ideas2it.inventory_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusinessWorkflowService {
    
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SupplierRepository supplierRepository;
    private final AlertService alertService;
    private final PurchaseOrderService purchaseOrderService;
    
    // ==================== AUTOMATED REORDER WORKFLOW ====================
    
    /**
     * Business Workflow: Generate automatic reorder suggestions
     * Runs daily at 6 AM
     */
    @Scheduled(cron = "0 0 6 * * ?")
    public void generateReorderSuggestions() {
        log.info("🔄 Starting automated reorder suggestion workflow");
        
        List<ReorderSuggestion> suggestions = new ArrayList<>();
        
        // Get all products with low stock
        List<Inventory> lowStockInventory = inventoryRepository.findLowStockInventory();
        
        for (Inventory inventory : lowStockInventory) {
            ReorderSuggestion suggestion = calculateReorderSuggestion(inventory);
            if (suggestion != null) {
                suggestions.add(suggestion);
                log.info("📋 Reorder suggestion for {}: {} units at ${}", 
                    inventory.getProduct().getName(), 
                    suggestion.getSuggestedQuantity(), 
                    suggestion.getEstimatedCost());
            }
        }
        
        // Create alerts for reorder suggestions
        createReorderAlerts(suggestions);
        
        log.info("✅ Completed reorder suggestion workflow. Generated {} suggestions", suggestions.size());
    }
    
    /**
     * Business Logic: Calculate optimal reorder quantity based on demand
     */
    private ReorderSuggestion calculateReorderSuggestion(Inventory inventory) {
        Product product = inventory.getProduct();
        
        // Get historical demand (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<StockMovement> movements = stockMovementRepository
            .findByProductIdAndMovementDateAfterAndMovementType(
                product.getId(), thirtyDaysAgo.atStartOfDay(), StockMovement.MovementType.OUT);
        
        // Calculate average daily demand
        double totalDemand = movements.stream()
            .mapToInt(StockMovement::getQuantity)
            .sum();
        double averageDailyDemand = totalDemand / 30.0;
        
        // Calculate lead time (assume 7 days for now)
        int leadTimeDays = 7;
        
        // Calculate safety stock (20% of average daily demand * lead time)
        double safetyStock = averageDailyDemand * leadTimeDays * 0.2;
        
        // Calculate reorder point
        double reorderPoint = (averageDailyDemand * leadTimeDays) + safetyStock;
        
        // Calculate suggested quantity
        int suggestedQuantity = (int) Math.ceil(reorderPoint - inventory.getQuantityAvailable());
        
        if (suggestedQuantity > 0) {
            BigDecimal estimatedCost = product.getCostPrice() != null ? 
                product.getCostPrice().multiply(BigDecimal.valueOf(suggestedQuantity)) : 
                BigDecimal.ZERO;
            
            return new ReorderSuggestion(
                product.getId(),
                product.getName(),
                inventory.getWarehouse().getId(),
                inventory.getWarehouse().getName(),
                suggestedQuantity,
                estimatedCost,
                averageDailyDemand,
                leadTimeDays,
                safetyStock
            );
        }
        
        return null;
    }
    
    // ==================== DEMAND FORECASTING WORKFLOW ====================
    
    /**
     * Business Workflow: Generate demand forecasts
     * Runs weekly on Sunday at 2 AM
     */
    @Scheduled(cron = "0 0 2 ? * SUN")
    public void generateDemandForecasts() {
        log.info("📊 Starting demand forecasting workflow");
        
        List<Product> activeProducts = productRepository.findByIsActiveTrue();
        
        for (Product product : activeProducts) {
            DemandForecast forecast = calculateDemandForecast(product);
            if (forecast != null) {
                log.info("📈 Demand forecast for {}: {} units/week (trend: {})", 
                    product.getName(), 
                    forecast.getWeeklyForecast(), 
                    forecast.getTrend());
                
                // Store forecast in database or cache for dashboard
                updateProductForecast(product.getId(), forecast);
            }
        }
        
        log.info("✅ Completed demand forecasting workflow");
    }
    
    /**
     * Business Logic: Calculate demand forecast using moving averages
     */
    private DemandForecast calculateDemandForecast(Product product) {
        // Get last 12 weeks of data
        LocalDate twelveWeeksAgo = LocalDate.now().minusWeeks(12);
        List<StockMovement> movements = stockMovementRepository
            .findByProductIdAndMovementDateAfterAndMovementType(
                product.getId(), twelveWeeksAgo.atStartOfDay(), StockMovement.MovementType.OUT);
        
        if (movements.isEmpty()) {
            return null;
        }
        
        // Group by week and calculate weekly demand
        Map<Integer, Integer> weeklyDemand = movements.stream()
            .collect(Collectors.groupingBy(
                movement -> movement.getMovementDate().getDayOfYear() / 7,
                Collectors.summingInt(StockMovement::getQuantity)
            ));
        
        // Calculate moving average (last 4 weeks)
        double recentDemand = weeklyDemand.values().stream()
            .sorted(Collections.reverseOrder())
            .limit(4)
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);
        
        // Calculate trend (simple linear regression)
        double trend = calculateTrend(weeklyDemand);
        
        return new DemandForecast(
            product.getId(),
            product.getName(),
            (int) Math.round(recentDemand),
            trend,
            LocalDate.now().plusWeeks(4)
        );
    }
    
    // ==================== SUPPLIER PERFORMANCE TRACKING ====================
    
    /**
     * Business Workflow: Track supplier performance
     * Runs daily at 8 PM
     */
    @Scheduled(cron = "0 0 20 * * ?")
    public void trackSupplierPerformance() {
        log.info("🏭 Starting supplier performance tracking workflow");
        
        List<Supplier> activeSuppliers = supplierRepository.findByIsActiveTrue();
        
        for (Supplier supplier : activeSuppliers) {
            SupplierPerformance performance = calculateSupplierPerformance(supplier);
            if (performance != null) {
                log.info("📊 Supplier {} performance: {}% on-time, {}% quality", 
                    supplier.getName(),
                    performance.getOnTimeDeliveryRate(),
                    performance.getQualityRate());
                
                // Create alerts for poor performance
                if (performance.getOnTimeDeliveryRate() < 80) {
                    createSupplierPerformanceAlert(supplier, performance);
                }
            }
        }
        
        log.info("✅ Completed supplier performance tracking workflow");
    }
    
    /**
     * Business Logic: Calculate supplier performance metrics
     */
    private SupplierPerformance calculateSupplierPerformance(Supplier supplier) {
        // Get all POs from this supplier in last 90 days
        LocalDate ninetyDaysAgo = LocalDate.now().minusDays(90);
        List<PurchaseOrder> orders = purchaseOrderRepository
            .findBySupplierIdAndOrderDateAfter(supplier.getId(), ninetyDaysAgo);
        
        if (orders.isEmpty()) {
            return null;
        }
        
        long totalOrders = orders.size();
        long onTimeOrders = orders.stream()
            .filter(order -> order.getStatus() == PurchaseOrder.OrderStatus.FULLY_RECEIVED)
            .filter(order -> order.getExpectedDeliveryDate() != null && 
                           order.getExpectedDeliveryDate().isAfter(LocalDate.now().minusDays(1)))
            .count();
        
        double onTimeRate = (double) onTimeOrders / totalOrders * 100;
        
        // Calculate quality rate (assume 95% for now - in real system, this would come from quality inspections)
        double qualityRate = 95.0;
        
        return new SupplierPerformance(
            supplier.getId(),
            supplier.getName(),
            onTimeRate,
            qualityRate,
            totalOrders,
            LocalDate.now()
        );
    }
    
    // ==================== INVENTORY OPTIMIZATION WORKFLOW ====================
    
    /**
     * Business Workflow: Optimize inventory levels
     * Runs weekly on Saturday at 3 AM
     */
    @Scheduled(cron = "0 0 3 ? * SAT")
    public void optimizeInventoryLevels() {
        log.info("⚡ Starting inventory optimization workflow");
        
        List<Inventory> allInventory = inventoryRepository.findAll();
        
        for (Inventory inventory : allInventory) {
            InventoryOptimization optimization = calculateInventoryOptimization(inventory);
            if (optimization != null) {
                log.info("🎯 Optimization for {}: {} action needed", 
                    inventory.getProduct().getName(),
                    optimization.getRecommendedAction());
                
                // Create optimization alerts
                if (optimization.getRecommendedAction() != InventoryOptimization.Action.NONE) {
                    createOptimizationAlert(inventory, optimization);
                }
            }
        }
        
        log.info("✅ Completed inventory optimization workflow");
    }
    
    /**
     * Business Logic: Calculate inventory optimization recommendations
     */
    private InventoryOptimization calculateInventoryOptimization(Inventory inventory) {
        Product product = inventory.getProduct();
        
        // Get demand data
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<StockMovement> movements = stockMovementRepository
            .findByProductIdAndMovementDateAfterAndMovementType(
                product.getId(), thirtyDaysAgo.atStartOfDay(), StockMovement.MovementType.OUT);
        
        double totalDemand = movements.stream()
            .mapToInt(StockMovement::getQuantity)
            .sum();
        double averageDailyDemand = totalDemand / 30.0;
        
        // Calculate optimal stock level
        double optimalStock = averageDailyDemand * 14; // 2 weeks of demand
        double currentStock = inventory.getQuantityAvailable();
        
        // Determine recommended action
        InventoryOptimization.Action action = InventoryOptimization.Action.NONE;
        String reason = "";
        
        if (currentStock > optimalStock * 1.5) {
            action = InventoryOptimization.Action.REDUCE_STOCK;
            reason = "Overstocked - " + (int)(currentStock - optimalStock) + " units excess";
        } else if (currentStock < optimalStock * 0.5) {
            action = InventoryOptimization.Action.INCREASE_STOCK;
            reason = "Understocked - need " + (int)(optimalStock - currentStock) + " more units";
        } else if (currentStock == 0 && averageDailyDemand > 0) {
            action = InventoryOptimization.Action.URGENT_REORDER;
            reason = "Out of stock with active demand";
        }
        
        return new InventoryOptimization(
            inventory.getId(),
            product.getName(),
            inventory.getWarehouse().getName(),
            currentStock,
            optimalStock,
            action,
            reason,
            averageDailyDemand
        );
    }
    
    // ==================== COST OPTIMIZATION WORKFLOW ====================
    
    /**
     * Business Workflow: Analyze and optimize costs
     * Runs monthly on the 1st at 4 AM
     */
    @Scheduled(cron = "0 0 4 1 * ?")
    public void analyzeCostOptimization() {
        log.info("💰 Starting cost optimization analysis workflow");
        
        // Calculate total inventory value
        BigDecimal totalInventoryValue = calculateTotalInventoryValue();
        
        // Calculate holding costs
        BigDecimal holdingCosts = calculateHoldingCosts();
        
        // Calculate stockout costs
        BigDecimal stockoutCosts = calculateStockoutCosts();
        
        // Generate cost optimization report
        CostOptimizationReport report = new CostOptimizationReport(
            totalInventoryValue,
            holdingCosts,
            stockoutCosts,
            LocalDate.now()
        );
        
        log.info("📊 Cost Analysis: Total Value: ${}, Holding Costs: ${}, Stockout Costs: ${}", 
            totalInventoryValue, holdingCosts, stockoutCosts);
        
        // Create cost optimization alerts
        if (holdingCosts.compareTo(BigDecimal.valueOf(10000)) > 0) {
            createCostOptimizationAlert(report);
        }
        
        log.info("✅ Completed cost optimization analysis workflow");
    }
    
    // ==================== HELPER METHODS ====================
    
    private double calculateTrend(Map<Integer, Integer> weeklyDemand) {
        // Simple linear trend calculation
        if (weeklyDemand.size() < 2) return 0.0;
        
        List<Integer> weeks = new ArrayList<>(weeklyDemand.keySet());
        Collections.sort(weeks);
        
        double x1 = weeks.get(0);
        double y1 = weeklyDemand.get(weeks.get(0));
        double x2 = weeks.get(weeks.size() - 1);
        double y2 = weeklyDemand.get(weeks.get(weeks.size() - 1));
        
        return (y2 - y1) / (x2 - x1);
    }
    
    private void createReorderAlerts(List<ReorderSuggestion> suggestions) {
        for (ReorderSuggestion suggestion : suggestions) {
            // Create alert for reorder suggestion
            // Implementation would use AlertService
        }
    }
    
    private void updateProductForecast(Long productId, DemandForecast forecast) {
        // Store forecast in database or cache
        // Implementation would update product forecast table
    }
    
    private void createSupplierPerformanceAlert(Supplier supplier, SupplierPerformance performance) {
        // Create alert for poor supplier performance
        // Implementation would use AlertService
    }
    
    private void createOptimizationAlert(Inventory inventory, InventoryOptimization optimization) {
        // Create alert for inventory optimization
        // Implementation would use AlertService
    }
    
    private void createCostOptimizationAlert(CostOptimizationReport report) {
        // Create alert for cost optimization
        // Implementation would use AlertService
    }
    
    private BigDecimal calculateTotalInventoryValue() {
        // Calculate total inventory value across all warehouses
        return BigDecimal.valueOf(100000); // Placeholder
    }
    
    private BigDecimal calculateHoldingCosts() {
        // Calculate holding costs (storage, insurance, etc.)
        return BigDecimal.valueOf(5000); // Placeholder
    }
    
    private BigDecimal calculateStockoutCosts() {
        // Calculate stockout costs (lost sales, expedited shipping, etc.)
        return BigDecimal.valueOf(2000); // Placeholder
    }
    
    // ==================== DATA CLASSES ====================
    
    public static class ReorderSuggestion {
        private Long productId;
        private String productName;
        private Long warehouseId;
        private String warehouseName;
        private int suggestedQuantity;
        private BigDecimal estimatedCost;
        private double averageDailyDemand;
        private int leadTimeDays;
        private double safetyStock;
        
        // Constructor, getters, setters
        public ReorderSuggestion(Long productId, String productName, Long warehouseId, String warehouseName,
                                int suggestedQuantity, BigDecimal estimatedCost, double averageDailyDemand,
                                int leadTimeDays, double safetyStock) {
            this.productId = productId;
            this.productName = productName;
            this.warehouseId = warehouseId;
            this.warehouseName = warehouseName;
            this.suggestedQuantity = suggestedQuantity;
            this.estimatedCost = estimatedCost;
            this.averageDailyDemand = averageDailyDemand;
            this.leadTimeDays = leadTimeDays;
            this.safetyStock = safetyStock;
        }
        
        // Getters
        public Long getProductId() { return productId; }
        public String getProductName() { return productName; }
        public Long getWarehouseId() { return warehouseId; }
        public String getWarehouseName() { return warehouseName; }
        public int getSuggestedQuantity() { return suggestedQuantity; }
        public BigDecimal getEstimatedCost() { return estimatedCost; }
        public double getAverageDailyDemand() { return averageDailyDemand; }
        public int getLeadTimeDays() { return leadTimeDays; }
        public double getSafetyStock() { return safetyStock; }
    }
    
    public static class DemandForecast {
        private Long productId;
        private String productName;
        private int weeklyForecast;
        private double trend;
        private LocalDate forecastDate;
        
        public DemandForecast(Long productId, String productName, int weeklyForecast, double trend, LocalDate forecastDate) {
            this.productId = productId;
            this.productName = productName;
            this.weeklyForecast = weeklyForecast;
            this.trend = trend;
            this.forecastDate = forecastDate;
        }
        
        // Getters
        public Long getProductId() { return productId; }
        public String getProductName() { return productName; }
        public int getWeeklyForecast() { return weeklyForecast; }
        public double getTrend() { return trend; }
        public LocalDate getForecastDate() { return forecastDate; }
    }
    
    public static class SupplierPerformance {
        private Long supplierId;
        private String supplierName;
        private double onTimeDeliveryRate;
        private double qualityRate;
        private long totalOrders;
        private LocalDate analysisDate;
        
        public SupplierPerformance(Long supplierId, String supplierName, double onTimeDeliveryRate,
                                 double qualityRate, long totalOrders, LocalDate analysisDate) {
            this.supplierId = supplierId;
            this.supplierName = supplierName;
            this.onTimeDeliveryRate = onTimeDeliveryRate;
            this.qualityRate = qualityRate;
            this.totalOrders = totalOrders;
            this.analysisDate = analysisDate;
        }
        
        // Getters
        public Long getSupplierId() { return supplierId; }
        public String getSupplierName() { return supplierName; }
        public double getOnTimeDeliveryRate() { return onTimeDeliveryRate; }
        public double getQualityRate() { return qualityRate; }
        public long getTotalOrders() { return totalOrders; }
        public LocalDate getAnalysisDate() { return analysisDate; }
    }
    
    public static class InventoryOptimization {
        private Long inventoryId;
        private String productName;
        private String warehouseName;
        private double currentStock;
        private double optimalStock;
        private Action recommendedAction;
        private String reason;
        private double averageDailyDemand;
        
        public enum Action {
            NONE, INCREASE_STOCK, REDUCE_STOCK, URGENT_REORDER
        }
        
        public InventoryOptimization(Long inventoryId, String productName, String warehouseName,
                                   double currentStock, double optimalStock, Action recommendedAction,
                                   String reason, double averageDailyDemand) {
            this.inventoryId = inventoryId;
            this.productName = productName;
            this.warehouseName = warehouseName;
            this.currentStock = currentStock;
            this.optimalStock = optimalStock;
            this.recommendedAction = recommendedAction;
            this.reason = reason;
            this.averageDailyDemand = averageDailyDemand;
        }
        
        // Getters
        public Long getInventoryId() { return inventoryId; }
        public String getProductName() { return productName; }
        public String getWarehouseName() { return warehouseName; }
        public double getCurrentStock() { return currentStock; }
        public double getOptimalStock() { return optimalStock; }
        public Action getRecommendedAction() { return recommendedAction; }
        public String getReason() { return reason; }
        public double getAverageDailyDemand() { return averageDailyDemand; }
    }
    
    public static class CostOptimizationReport {
        private BigDecimal totalInventoryValue;
        private BigDecimal holdingCosts;
        private BigDecimal stockoutCosts;
        private LocalDate analysisDate;
        
        public CostOptimizationReport(BigDecimal totalInventoryValue, BigDecimal holdingCosts,
                                    BigDecimal stockoutCosts, LocalDate analysisDate) {
            this.totalInventoryValue = totalInventoryValue;
            this.holdingCosts = holdingCosts;
            this.stockoutCosts = stockoutCosts;
            this.analysisDate = analysisDate;
        }
        
        // Getters
        public BigDecimal getTotalInventoryValue() { return totalInventoryValue; }
        public BigDecimal getHoldingCosts() { return holdingCosts; }
        public BigDecimal getStockoutCosts() { return stockoutCosts; }
        public LocalDate getAnalysisDate() { return analysisDate; }
    }
} 