package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.PurchaseOrderRequest;
import com.ideas2it.inventory_service.dto.PurchaseOrderResponse;
import com.ideas2it.inventory_service.entity.*;
import com.ideas2it.inventory_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PurchaseOrderService {
    
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final StockMovementService stockMovementService;
    private final InventoryRepository inventoryRepository;
    
    public List<PurchaseOrderResponse> getAllPurchaseOrders() {
        log.info("Fetching all purchase orders");
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        return orders.stream()
                .map(PurchaseOrderResponse::fromPurchaseOrder)
                .collect(Collectors.toList());
    }
    
    public PurchaseOrderResponse getPurchaseOrderById(Long id) {
        log.info("Fetching purchase order by ID: {}", id);
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));
        return PurchaseOrderResponse.fromPurchaseOrder(order);
    }
    
    public PurchaseOrderResponse getPurchaseOrderByPoNumber(String poNumber) {
        log.info("Fetching purchase order by PO number: {}", poNumber);
        PurchaseOrder order = purchaseOrderRepository.findByPoNumber(poNumber)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with PO number: " + poNumber));
        return PurchaseOrderResponse.fromPurchaseOrder(order);
    }
    
    public List<PurchaseOrderResponse> getPurchaseOrdersBySupplier(Long supplierId) {
        log.info("Fetching purchase orders by supplier ID: {}", supplierId);
        
        // Verify supplier exists and is active
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + supplierId));
        
        if (!supplier.getIsActive()) {
            throw new RuntimeException("Supplier is inactive with ID: " + supplierId);
        }
        
        List<PurchaseOrder> orders = purchaseOrderRepository.findBySupplierIdOrderByOrderDateDesc(supplierId);
        return orders.stream()
                .map(PurchaseOrderResponse::fromPurchaseOrder)
                .collect(Collectors.toList());
    }
    
    public List<PurchaseOrderResponse> getPurchaseOrdersByWarehouse(Long warehouseId) {
        log.info("Fetching purchase orders by warehouse ID: {}", warehouseId);
        
        // Verify warehouse exists and is active
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + warehouseId));
        
        if (!warehouse.getIsActive()) {
            throw new RuntimeException("Warehouse is inactive with ID: " + warehouseId);
        }
        
        List<PurchaseOrder> orders = purchaseOrderRepository.findByWarehouseIdOrderByOrderDateDesc(warehouseId);
        return orders.stream()
                .map(PurchaseOrderResponse::fromPurchaseOrder)
                .collect(Collectors.toList());
    }
    
    public List<PurchaseOrderResponse> getPurchaseOrdersByStatus(PurchaseOrder.OrderStatus status) {
        log.info("Fetching purchase orders by status: {}", status);
        List<PurchaseOrder> orders = purchaseOrderRepository.findByStatusOrderByOrderDateDesc(status);
        return orders.stream()
                .map(PurchaseOrderResponse::fromPurchaseOrder)
                .collect(Collectors.toList());
    }
    
    public Page<PurchaseOrderResponse> getPurchaseOrdersWithPagination(Pageable pageable) {
        log.info("Fetching purchase orders with pagination");
        Page<PurchaseOrder> ordersPage = purchaseOrderRepository.findAllByOrderByOrderDateDesc(pageable);
        return ordersPage.map(PurchaseOrderResponse::fromPurchaseOrder);
    }
    
    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request, Long currentUserId) {
        log.info("Creating purchase order for supplier ID: {} and warehouse ID: {}", request.getSupplierId(), request.getWarehouseId());
        
        // Validate supplier exists and is active
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + request.getSupplierId()));
        
        if (!supplier.getIsActive()) {
            throw new RuntimeException("Supplier is inactive with ID: " + request.getSupplierId());
        }
        
        // Validate warehouse exists and is active
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + request.getWarehouseId()));
        
        if (!warehouse.getIsActive()) {
            throw new RuntimeException("Warehouse is inactive with ID: " + request.getWarehouseId());
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Generate PO number
        String poNumber = generatePoNumber();
        
        // Create purchase order
        PurchaseOrder order = new PurchaseOrder();
        order.setPoNumber(poNumber);
        order.setSupplier(supplier);
        order.setWarehouse(warehouse);
        order.setOrderDate(request.getOrderDate());
        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        order.setStatus(PurchaseOrder.OrderStatus.DRAFT);
        order.setNotes(request.getNotes());
        order.setCreatedBy(currentUser);
        order.setUpdatedBy(currentUser);
        
        // Create and add items
        for (PurchaseOrderRequest.PurchaseOrderItemRequest itemRequest : request.getItems()) {
            // Validate product exists and is active
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemRequest.getProductId()));
            
            if (!product.getIsActive()) {
                throw new RuntimeException("Product is inactive with ID: " + itemRequest.getProductId());
            }
            
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setQuantityOrdered(itemRequest.getQuantityOrdered());
            item.setUnitPrice(itemRequest.getUnitPrice());
            item.setNotes(itemRequest.getNotes());
            item.calculateTotalPrice();
            
            order.addItem(item);
        }
        
        // Calculate total amount
        order.calculateTotalAmount();
        
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order created successfully with ID: {} and PO number: {}", savedOrder.getId(), savedOrder.getPoNumber());
        
        return PurchaseOrderResponse.fromPurchaseOrder(savedOrder);
    }
    
    public PurchaseOrderResponse updatePurchaseOrder(Long id, PurchaseOrderRequest request, Long currentUserId) {
        log.info("Updating purchase order with ID: {}", id);
        
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));
        
        // Only allow updates for DRAFT status
        if (order.getStatus() != PurchaseOrder.OrderStatus.DRAFT) {
            throw new RuntimeException("Cannot update purchase order with status: " + order.getStatus() + ". Only DRAFT orders can be updated.");
        }
        
        // Validate supplier exists and is active
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + request.getSupplierId()));
        
        if (!supplier.getIsActive()) {
            throw new RuntimeException("Supplier is inactive with ID: " + request.getSupplierId());
        }
        
        // Validate warehouse exists and is active
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + request.getWarehouseId()));
        
        if (!warehouse.getIsActive()) {
            throw new RuntimeException("Warehouse is inactive with ID: " + request.getWarehouseId());
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Update basic information
        order.setSupplier(supplier);
        order.setWarehouse(warehouse);
        order.setOrderDate(request.getOrderDate());
        order.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        order.setNotes(request.getNotes());
        order.setUpdatedBy(currentUser);
        
        // Clear existing items and add new ones
        order.getItems().clear();
        
        // Create and add new items
        for (PurchaseOrderRequest.PurchaseOrderItemRequest itemRequest : request.getItems()) {
            // Validate product exists and is active
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemRequest.getProductId()));
            
            if (!product.getIsActive()) {
                throw new RuntimeException("Product is inactive with ID: " + itemRequest.getProductId());
            }
            
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setQuantityOrdered(itemRequest.getQuantityOrdered());
            item.setUnitPrice(itemRequest.getUnitPrice());
            item.setNotes(itemRequest.getNotes());
            item.calculateTotalPrice();
            
            order.addItem(item);
        }
        
        // Calculate total amount
        order.calculateTotalAmount();
        
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order updated successfully with ID: {}", updatedOrder.getId());
        
        return PurchaseOrderResponse.fromPurchaseOrder(updatedOrder);
    }
    
    public PurchaseOrderResponse updatePurchaseOrderStatus(Long id, PurchaseOrder.OrderStatus newStatus, Long currentUserId) {
        log.info("Updating purchase order status to: {} for order ID: {}", newStatus, id);
        
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));
        
        // Validate status transition
        if (!order.canTransitionTo(newStatus)) {
            throw new RuntimeException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        order.setStatus(newStatus);
        order.setUpdatedBy(currentUser);
        
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("Purchase order status updated successfully to: {}", newStatus);
        
        return PurchaseOrderResponse.fromPurchaseOrder(updatedOrder);
    }
    
    @Transactional
    public PurchaseOrderResponse receivePurchaseOrder(Long id, List<ReceiveItemRequest> receiveItems, Long currentUserId) {
        log.info("=== RECEIVE PURCHASE ORDER START ===");
        log.info("Receiving items for purchase order ID: {}", id);
        log.info("Number of items to receive: {}", receiveItems.size());
        
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found with ID: " + id));
        
        // Validate order status
        if (order.getStatus() != PurchaseOrder.OrderStatus.APPROVED) {
            throw new RuntimeException("Purchase order must be in APPROVED status to receive items");
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Process received items
        for (ReceiveItemRequest receiveItem : receiveItems) {
            PurchaseOrderItem item = order.getItems().stream()
                    .filter(i -> i.getId().equals(receiveItem.getItemId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Item not found with ID: " + receiveItem.getItemId()));
            
            // Validate quantity
            if (!item.canReceiveQuantity(receiveItem.getQuantityReceived())) {
                throw new RuntimeException("Cannot receive more than ordered quantity for item ID: " + item.getId());
            }
            
            // Store the quantity to add BEFORE updating the item
            int quantityToAdd = receiveItem.getQuantityReceived();
            int currentReceived = item.getQuantityReceived();
            
            log.info("=== PROCESSING ITEM {} ===", receiveItem.getItemId());
            log.info("Current received: {}, Adding: {}, Will be: {}, Total ordered: {}", 
                    currentReceived, quantityToAdd, currentReceived + quantityToAdd, item.getQuantityOrdered());
            
            // Update item
            item.receiveQuantity(quantityToAdd);
            
            // Update inventory with the CORRECT quantity to add
            updateInventoryForReceivedItem(item, order.getWarehouse().getId(), currentUserId, receiveItem.getNotes(), quantityToAdd);
        }
        
        // Check if all items are fully received
        boolean allItemsReceived = order.getItems().stream().allMatch(PurchaseOrderItem::isFullyReceived);
        if (allItemsReceived) {
            order.setStatus(PurchaseOrder.OrderStatus.FULLY_RECEIVED);
        } else {
            order.setStatus(PurchaseOrder.OrderStatus.PARTIALLY_RECEIVED);
        }
        
        order.setUpdatedBy(currentUser);
        
        PurchaseOrder updatedOrder = purchaseOrderRepository.save(order);
        log.info("=== RECEIVE PURCHASE ORDER END ===");
        log.info("Purchase order items received successfully");
        
        return PurchaseOrderResponse.fromPurchaseOrder(updatedOrder);
    }
    
    private void updateInventoryForReceivedItem(PurchaseOrderItem item, Long warehouseId, Long currentUserId, String notes, int quantityToAdd) {
        log.info("=== INVENTORY UPDATE DEBUG ===");
        log.info("Updating inventory for received item: Product ID {}, Warehouse ID {}, Quantity to Add {}", 
                item.getProduct().getId(), warehouseId, quantityToAdd);
        log.info("Purchase Order ID: {}, Item ID: {}", item.getPurchaseOrder().getId(), item.getId());
        
        // Create stock movement (this will handle inventory update)
        try {
            com.ideas2it.inventory_service.dto.StockMovementRequest movementRequest = new com.ideas2it.inventory_service.dto.StockMovementRequest();
            movementRequest.setProductId(item.getProduct().getId());
            movementRequest.setWarehouseId(warehouseId);
            movementRequest.setMovementType(StockMovement.MovementType.IN);
            movementRequest.setQuantity(quantityToAdd);
            movementRequest.setReferenceType(StockMovement.ReferenceType.PURCHASE_ORDER);
            movementRequest.setReferenceId(item.getPurchaseOrder().getId());
            movementRequest.setNotes("Received from purchase order " + item.getPurchaseOrder().getPoNumber() + ": " + notes);
            
            stockMovementService.createStockMovement(movementRequest, currentUserId);
            log.info("Stock movement created and inventory updated successfully for received item");
        } catch (Exception e) {
            log.error("Error creating stock movement for received item: {}", e.getMessage());
            throw new RuntimeException("Failed to create stock movement for received item: " + e.getMessage());
        }
    }
    
    private String generatePoNumber() {
        String datePrefix = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String basePoNumber = "PO-" + datePrefix + "-";
        
        // Find the next sequence number for today
        int sequence = 1;
        String poNumber;
        do {
            poNumber = basePoNumber + String.format("%03d", sequence);
            sequence++;
        } while (purchaseOrderRepository.existsByPoNumber(poNumber));
        
        return poNumber;
    }
    
    public long getPurchaseOrderCount() {
        return purchaseOrderRepository.count();
    }
    
    public long getPurchaseOrderCountByStatus(PurchaseOrder.OrderStatus status) {
        return purchaseOrderRepository.countByStatus(status);
    }
    
    public long getPurchaseOrderCountBySupplier(Long supplierId) {
        return purchaseOrderRepository.countBySupplierId(supplierId);
    }
    
    public long getPurchaseOrderCountByWarehouse(Long warehouseId) {
        return purchaseOrderRepository.countByWarehouseId(warehouseId);
    }
    
    public BigDecimal getTotalAmountBySupplier(Long supplierId) {
        BigDecimal total = purchaseOrderRepository.getTotalAmountBySupplier(supplierId);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalAmountByWarehouse(Long warehouseId) {
        BigDecimal total = purchaseOrderRepository.getTotalAmountByWarehouse(warehouseId);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalAmountByStatus(PurchaseOrder.OrderStatus status) {
        BigDecimal total = purchaseOrderRepository.getTotalAmountByStatus(status);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public void deleteAllPurchaseOrders() {
        log.info("Deleting all purchase orders");
        try {
            // First delete all purchase order items
            purchaseOrderItemRepository.deleteAll();
            log.info("Deleted all purchase order items");
            
            // Then delete all purchase orders
            purchaseOrderRepository.deleteAll();
            log.info("Deleted all purchase orders");
        } catch (Exception e) {
            log.error("Error deleting all purchase orders: {}", e.getMessage());
            throw new RuntimeException("Failed to delete all purchase orders: " + e.getMessage());
        }
    }
    
    // Helper class for receiving items
    public static class ReceiveItemRequest {
        private Long itemId;
        private Integer quantityReceived;
        private String notes;
        
        // Getters and setters
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
        public Integer getQuantityReceived() { return quantityReceived; }
        public void setQuantityReceived(Integer quantityReceived) { this.quantityReceived = quantityReceived; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
} 