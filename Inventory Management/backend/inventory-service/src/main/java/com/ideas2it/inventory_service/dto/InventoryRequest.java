package com.ideas2it.inventory_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequest {
    
    @NotNull(message = "Product ID is required")
    private Long productId;
    
    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;
    
    @Min(value = 0, message = "Quantity on hand must be greater than or equal to 0")
    private Integer quantityOnHand = 0;
    
    @Min(value = 0, message = "Quantity reserved must be greater than or equal to 0")
    private Integer quantityReserved = 0;
} 