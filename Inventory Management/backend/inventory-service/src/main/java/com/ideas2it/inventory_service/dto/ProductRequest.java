package com.ideas2it.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    
    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
    private String name;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @NotBlank(message = "SKU is required")
    @Size(min = 3, max = 50, message = "SKU must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "SKU must contain only uppercase letters, numbers, hyphens, and underscores")
    private String sku;
    
    private Long categoryId;
    
    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;
    
    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Weight must be greater than or equal to 0")
    private BigDecimal weight;
    
    @Size(max = 100, message = "Dimensions cannot exceed 100 characters")
    private String dimensions;
    
    @Size(max = 20, message = "Unit of measure cannot exceed 20 characters")
    private String unitOfMeasure = "PCS";
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Cost price must be greater than or equal to 0")
    private BigDecimal costPrice;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Selling price must be greater than or equal to 0")
    private BigDecimal sellingPrice;
    
    @Min(value = 0, message = "Reorder point must be greater than or equal to 0")
    private Integer reorderPoint = 0;
    
    @Min(value = 0, message = "Reorder quantity must be greater than or equal to 0")
    private Integer reorderQuantity = 0;
} 