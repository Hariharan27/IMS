package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.PurchaseOrder;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {
    
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;
    
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;
    
    @NotNull(message = "Order date is required")
    @FutureOrPresent(message = "Order date must be today or in the future")
    private LocalDate orderDate;
    
    private LocalDate expectedDeliveryDate;
    
    private String notes;
    
    @NotNull(message = "Items are required")
    @Min(value = 1, message = "At least one item is required")
    private List<PurchaseOrderItemRequest> items;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemRequest {
        
        @NotNull(message = "Product ID is required")
        private Long productId;
        
        @NotNull(message = "Quantity ordered is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantityOrdered;
        
        @NotNull(message = "Unit price is required")
        @Min(value = 0, message = "Unit price must be non-negative")
        private java.math.BigDecimal unitPrice;
        
        private String notes;
    }
} 