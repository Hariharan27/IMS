package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.PurchaseOrderItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemResponse {
    
    private Long id;
    private Long purchaseOrderId;
    private ProductResponse product;
    private Integer quantityOrdered;
    private Integer quantityReceived;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer remainingQuantity;
    private boolean isFullyReceived;
    private boolean isPartiallyReceived;
    
    public static PurchaseOrderItemResponse fromPurchaseOrderItem(PurchaseOrderItem item) {
        PurchaseOrderItemResponse response = new PurchaseOrderItemResponse();
        response.setId(item.getId());
        response.setQuantityOrdered(item.getQuantityOrdered());
        response.setQuantityReceived(item.getQuantityReceived());
        response.setUnitPrice(item.getUnitPrice());
        response.setTotalPrice(item.getTotalPrice());
        response.setNotes(item.getNotes());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        
        // Map relationships
        if (item.getPurchaseOrder() != null) {
            response.setPurchaseOrderId(item.getPurchaseOrder().getId());
        }
        
        if (item.getProduct() != null) {
            response.setProduct(ProductResponse.fromProduct(item.getProduct()));
        }
        
        // Calculate derived fields
        response.setRemainingQuantity(item.getRemainingQuantity());
        response.setFullyReceived(item.isFullyReceived());
        response.setPartiallyReceived(item.isPartiallyReceived());
        
        return response;
    }
} 