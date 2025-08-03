package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.PurchaseOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    
    private Long id;
    private String poNumber;
    private SupplierResponse supplier;
    private WarehouseResponse warehouse;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private PurchaseOrder.OrderStatus status;
    private BigDecimal totalAmount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse createdBy;
    private UserResponse updatedBy;
    private List<PurchaseOrderItemResponse> items;
    private int itemCount;
    private int totalQuantityOrdered;
    private int totalQuantityReceived;
    
    public static PurchaseOrderResponse fromPurchaseOrder(PurchaseOrder purchaseOrder) {
        PurchaseOrderResponse response = new PurchaseOrderResponse();
        response.setId(purchaseOrder.getId());
        response.setPoNumber(purchaseOrder.getPoNumber());
        response.setOrderDate(purchaseOrder.getOrderDate());
        response.setExpectedDeliveryDate(purchaseOrder.getExpectedDeliveryDate());
        response.setStatus(purchaseOrder.getStatus());
        response.setTotalAmount(purchaseOrder.getTotalAmount());
        response.setNotes(purchaseOrder.getNotes());
        response.setCreatedAt(purchaseOrder.getCreatedAt());
        response.setUpdatedAt(purchaseOrder.getUpdatedAt());
        
        // Map relationships
        if (purchaseOrder.getSupplier() != null) {
            response.setSupplier(SupplierResponse.fromSupplier(purchaseOrder.getSupplier()));
        }
        
        if (purchaseOrder.getWarehouse() != null) {
            response.setWarehouse(WarehouseResponse.fromWarehouse(purchaseOrder.getWarehouse()));
        }
        
        if (purchaseOrder.getCreatedBy() != null) {
            response.setCreatedBy(UserResponse.fromUser(purchaseOrder.getCreatedBy()));
        }
        
        if (purchaseOrder.getUpdatedBy() != null) {
            response.setUpdatedBy(UserResponse.fromUser(purchaseOrder.getUpdatedBy()));
        }
        
        // Map items
        if (purchaseOrder.getItems() != null && !purchaseOrder.getItems().isEmpty()) {
            response.setItems(purchaseOrder.getItems().stream()
                    .map(PurchaseOrderItemResponse::fromPurchaseOrderItem)
                    .collect(Collectors.toList()));
            
            // Calculate summary statistics
            response.setItemCount(purchaseOrder.getItems().size());
            response.setTotalQuantityOrdered(purchaseOrder.getItems().stream()
                    .mapToInt(item -> item.getQuantityOrdered())
                    .sum());
            response.setTotalQuantityReceived(purchaseOrder.getItems().stream()
                    .mapToInt(item -> item.getQuantityReceived())
                    .sum());
        }
        
        return response;
    }
} 