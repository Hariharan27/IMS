package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.PurchaseOrderRequest;
import com.ideas2it.inventory_service.entity.*;
import com.ideas2it.inventory_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AutomatedPurchaseOrderService {
    
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final PurchaseOrderService purchaseOrderService;
    private final StockMovementRepository stockMovementRepository;
    
    // ==================== AUTOMATED PO GENERATION ====================
    
    /**
     * Automated Workflow: Generate purchase orders for low stock items
     * Runs daily at 7 AM (after reorder suggestions)
     */
    @Scheduled(cron = "0 0 7 * * ?")
    public void generateAutomatedPurchaseOrders() {
        log.info("🤖 Starting automated purchase order generation workflow");
        
        List<AutomatedPORequest> poRequests = new ArrayList<>();
        
        // Get all low stock inventory
        List<Inventory> lowStockInventory = inventoryRepository.findLowStockInventory();
        
        for (Inventory inventory : lowStockInventory) {
            AutomatedPORequest poRequest = createAutomatedPORequest(inventory);
            if (poRequest != null) {
                poRequests.add(poRequest);
                log.info("📋 Auto PO request for {}: {} units at ${}", 
                    inventory.getProduct().getName(), 
                    poRequest.getSuggestedQuantity(), 
                    poRequest.getEstimatedCost());
            }
        }
        
        // Generate POs for each request
        for (AutomatedPORequest request : poRequests) {
            try {
                generatePurchaseOrder(request);
            } catch (Exception e) {
                log.error("Error generating automated PO for {}: {}", 
                    request.getProductName(), e.getMessage());
            }
        }
        
        log.info("✅ Completed automated PO generation. Created {} purchase orders", poRequests.size());
    }
    
    /**
     * Business Logic: Create automated PO request based on inventory analysis
     */
    private AutomatedPORequest createAutomatedPORequest(Inventory inventory) {
        Product product = inventory.getProduct();
        
        // Skip if product has no cost price
        if (product.getCostPrice() == null || product.getCostPrice().compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Skipping auto PO for {} - no cost price set", product.getName());
            return null;
        }
        
        // Calculate suggested quantity based on demand
        int suggestedQuantity = calculateSuggestedQuantity(inventory);
        
        if (suggestedQuantity <= 0) {
            return null;
        }
        
        // Find best supplier for this product
        Supplier bestSupplier = findBestSupplier(product);
        if (bestSupplier == null) {
            log.warn("No supplier found for product: {}", product.getName());
            return null;
        }
        
        // Calculate estimated cost
        BigDecimal estimatedCost = product.getCostPrice().multiply(BigDecimal.valueOf(suggestedQuantity));
        
        return new AutomatedPORequest(
            product.getId(),
            product.getName(),
            bestSupplier.getId(),
            bestSupplier.getName(),
            inventory.getWarehouse().getId(),
            inventory.getWarehouse().getName(),
            suggestedQuantity,
            product.getCostPrice(),
            estimatedCost,
            LocalDate.now().plusDays(7) // Expected delivery in 7 days
        );
    }
    
    /**
     * Business Logic: Calculate optimal order quantity
     */
    private int calculateSuggestedQuantity(Inventory inventory) {
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
        
        // Calculate lead time (assume 7 days)
        int leadTimeDays = 7;
        
        // Calculate safety stock (20% of average daily demand * lead time)
        double safetyStock = averageDailyDemand * leadTimeDays * 0.2;
        
        // Calculate reorder point
        double reorderPoint = (averageDailyDemand * leadTimeDays) + safetyStock;
        
        // Calculate suggested quantity
        int suggestedQuantity = (int) Math.ceil(reorderPoint - inventory.getQuantityAvailable());
        
        // Apply minimum order quantity
        int minOrderQuantity = product.getReorderQuantity() != null ? product.getReorderQuantity() : 10;
        suggestedQuantity = Math.max(suggestedQuantity, minOrderQuantity);
        
        return suggestedQuantity;
    }
    
    /**
     * Business Logic: Find best supplier based on performance and pricing
     */
    private Supplier findBestSupplier(Product product) {
        // Get all active suppliers
        List<Supplier> activeSuppliers = supplierRepository.findByIsActiveTrue();
        
        if (activeSuppliers.isEmpty()) {
            return null;
        }
        
        // For now, return the first supplier
        // In a real system, this would consider:
        // - Historical performance (on-time delivery, quality)
        // - Pricing
        // - Lead times
        // - Payment terms
        // - Geographic proximity
        
        return activeSuppliers.get(0);
    }
    
    /**
     * Generate the actual purchase order
     */
    private void generatePurchaseOrder(AutomatedPORequest request) {
        log.info("🤖 Generating automated PO for {}: {} units", request.getProductName(), request.getSuggestedQuantity());
        
        // Create PO request
        PurchaseOrderRequest poRequest = new PurchaseOrderRequest();
        poRequest.setSupplierId(request.getSupplierId());
        poRequest.setWarehouseId(request.getWarehouseId());
        poRequest.setOrderDate(LocalDate.now());
        poRequest.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        poRequest.setNotes("Automatically generated PO for low stock item: " + request.getProductName());
        
        // Create PO item
        PurchaseOrderRequest.PurchaseOrderItemRequest itemRequest = new PurchaseOrderRequest.PurchaseOrderItemRequest();
        itemRequest.setProductId(request.getProductId());
        itemRequest.setQuantityOrdered(request.getSuggestedQuantity());
        itemRequest.setUnitPrice(request.getUnitPrice());
        itemRequest.setNotes("Auto-generated based on demand analysis");
        
        poRequest.setItems(Arrays.asList(itemRequest));
        
        // Create the PO (this will be in DRAFT status)
        try {
            purchaseOrderService.createPurchaseOrder(poRequest, 1L); // System user ID
            log.info("✅ Automated PO created successfully for {}", request.getProductName());
        } catch (Exception e) {
            log.error("❌ Failed to create automated PO for {}: {}", request.getProductName(), e.getMessage());
        }
    }
    
    // ==================== MANUAL TRIGGER ENDPOINTS ====================
    
    /**
     * Manually trigger automated PO generation
     */
    public void triggerAutomatedPOGeneration() {
        log.info("🔄 Manually triggering automated PO generation");
        generateAutomatedPurchaseOrders();
    }
    
    /**
     * Generate automated PO for specific product
     */
    public void generateAutomatedPOForProduct(Long productId, Long warehouseId) {
        log.info("🎯 Generating automated PO for product ID: {} in warehouse ID: {}", productId, warehouseId);
        
        // Find inventory for this product and warehouse
        Optional<Inventory> inventory = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId);
        
        if (inventory.isPresent()) {
            AutomatedPORequest request = createAutomatedPORequest(inventory.get());
            if (request != null) {
                generatePurchaseOrder(request);
            } else {
                log.warn("Could not create automated PO request for product ID: {}", productId);
            }
        } else {
            log.warn("No inventory found for product ID: {} in warehouse ID: {}", productId, warehouseId);
        }
    }
    
    // ==================== BUSINESS RULES ====================
    
    /**
     * Check if automated PO should be generated for an inventory item
     */
    public boolean shouldGenerateAutomatedPO(Inventory inventory) {
        // Business rules for automated PO generation:
        
        // 1. Product must be active
        if (!inventory.getProduct().getIsActive()) {
            return false;
        }
        
        // 2. Must have cost price set
        if (inventory.getProduct().getCostPrice() == null || 
            inventory.getProduct().getCostPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        
        // 3. Must be below reorder point
        if (inventory.getQuantityAvailable() > inventory.getProduct().getReorderPoint()) {
            return false;
        }
        
        // 4. Must have supplier available
        List<Supplier> suppliers = supplierRepository.findByIsActiveTrue();
        if (suppliers.isEmpty()) {
            return false;
        }
        
        // 5. Check if recent PO already exists (avoid duplicates)
        LocalDate recentDate = LocalDate.now().minusDays(3);
        // This would check for recent POs for this product
        
        return true;
    }
    
    // ==================== DATA CLASSES ====================
    
    public static class AutomatedPORequest {
        private Long productId;
        private String productName;
        private Long supplierId;
        private String supplierName;
        private Long warehouseId;
        private String warehouseName;
        private int suggestedQuantity;
        private BigDecimal unitPrice;
        private BigDecimal estimatedCost;
        private LocalDate expectedDeliveryDate;
        
        public AutomatedPORequest(Long productId, String productName, Long supplierId, String supplierName,
                                Long warehouseId, String warehouseName, int suggestedQuantity, 
                                BigDecimal unitPrice, BigDecimal estimatedCost, LocalDate expectedDeliveryDate) {
            this.productId = productId;
            this.productName = productName;
            this.supplierId = supplierId;
            this.supplierName = supplierName;
            this.warehouseId = warehouseId;
            this.warehouseName = warehouseName;
            this.suggestedQuantity = suggestedQuantity;
            this.unitPrice = unitPrice;
            this.estimatedCost = estimatedCost;
            this.expectedDeliveryDate = expectedDeliveryDate;
        }
        
        // Getters
        public Long getProductId() { return productId; }
        public String getProductName() { return productName; }
        public Long getSupplierId() { return supplierId; }
        public String getSupplierName() { return supplierName; }
        public Long getWarehouseId() { return warehouseId; }
        public String getWarehouseName() { return warehouseName; }
        public int getSuggestedQuantity() { return suggestedQuantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public BigDecimal getEstimatedCost() { return estimatedCost; }
        public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    }
} 