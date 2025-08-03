package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    
    private Long id;
    private String name;
    private String description;
    private String sku;
    private CategoryResponse category;
    private String brand;
    private String model;
    private BigDecimal weight;
    private String dimensions;
    private String unitOfMeasure;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse createdBy;
    private UserResponse updatedBy;
    
    public static ProductResponse fromProduct(Product product) {
        if (product == null) {
            return null;
        }
        
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setSku(product.getSku());
        response.setBrand(product.getBrand());
        response.setModel(product.getModel());
        response.setWeight(product.getWeight());
        response.setDimensions(product.getDimensions());
        response.setUnitOfMeasure(product.getUnitOfMeasure());
        response.setCostPrice(product.getCostPrice());
        response.setSellingPrice(product.getSellingPrice());
        response.setReorderPoint(product.getReorderPoint());
        response.setReorderQuantity(product.getReorderQuantity());
        response.setIsActive(product.getIsActive());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        
        // Map category relationship
        if (product.getCategory() != null) {
            response.setCategory(CategoryResponse.fromCategory(product.getCategory()));
        }
        
        // Map audit fields
        if (product.getCreatedBy() != null) {
            response.setCreatedBy(UserResponse.fromUser(product.getCreatedBy()));
        }
        if (product.getUpdatedBy() != null) {
            response.setUpdatedBy(UserResponse.fromUser(product.getUpdatedBy()));
        }
        
        return response;
    }
} 