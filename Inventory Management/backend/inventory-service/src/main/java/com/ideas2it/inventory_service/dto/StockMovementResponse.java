package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.StockMovement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    
    private Long id;
    private ProductResponse product;
    private WarehouseResponse warehouse;
    private StockMovement.MovementType movementType;
    private Integer quantity;
    private StockMovement.ReferenceType referenceType;
    private Long referenceId;
    private String notes;
    private LocalDateTime movementDate;
    private LocalDateTime createdAt;
    private UserResponse createdBy;
    
    public static StockMovementResponse fromStockMovement(StockMovement stockMovement) {
        StockMovementResponse response = new StockMovementResponse();
        response.setId(stockMovement.getId());
        response.setMovementType(stockMovement.getMovementType());
        response.setQuantity(stockMovement.getQuantity());
        response.setReferenceType(stockMovement.getReferenceType());
        response.setReferenceId(stockMovement.getReferenceId());
        response.setNotes(stockMovement.getNotes());
        response.setMovementDate(stockMovement.getMovementDate());
        response.setCreatedAt(stockMovement.getCreatedAt());
        
        // Map product relationship
        if (stockMovement.getProduct() != null) {
            response.setProduct(ProductResponse.fromProduct(stockMovement.getProduct()));
        }
        
        // Map warehouse relationship
        if (stockMovement.getWarehouse() != null) {
            response.setWarehouse(WarehouseResponse.fromWarehouse(stockMovement.getWarehouse()));
        }
        
        // Map audit fields
        if (stockMovement.getCreatedBy() != null) {
            response.setCreatedBy(UserResponse.fromUser(stockMovement.getCreatedBy()));
        }
        
        return response;
    }
} 