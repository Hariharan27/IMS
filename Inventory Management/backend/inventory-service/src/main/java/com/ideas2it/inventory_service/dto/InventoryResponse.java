package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.Inventory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    
    private Long id;
    private ProductResponse product;
    private WarehouseResponse warehouse;
    private Integer quantityOnHand;
    private Integer quantityReserved;
    private Integer quantityAvailable;
    private LocalDateTime lastUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse updatedBy;
    
    public static InventoryResponse fromInventory(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setQuantityOnHand(inventory.getQuantityOnHand());
        response.setQuantityReserved(inventory.getQuantityReserved());
        response.setQuantityAvailable(inventory.getQuantityAvailable());
        response.setLastUpdatedAt(inventory.getLastUpdatedAt());
        response.setCreatedAt(inventory.getCreatedAt());
        response.setUpdatedAt(inventory.getUpdatedAt());
        
        // Map product relationship
        if (inventory.getProduct() != null) {
            response.setProduct(ProductResponse.fromProduct(inventory.getProduct()));
        }
        
        // Map warehouse relationship
        if (inventory.getWarehouse() != null) {
            response.setWarehouse(WarehouseResponse.fromWarehouse(inventory.getWarehouse()));
        }
        
        // Map audit fields
        if (inventory.getUpdatedBy() != null) {
            response.setUpdatedBy(UserResponse.fromUser(inventory.getUpdatedBy()));
        }
        
        return response;
    }
} 