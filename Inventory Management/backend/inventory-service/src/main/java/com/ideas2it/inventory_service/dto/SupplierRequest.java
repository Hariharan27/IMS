package com.ideas2it.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {
    
    @NotBlank(message = "Supplier name is required")
    @Size(min = 2, max = 100, message = "Supplier name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Supplier code is required")
    @Size(min = 2, max = 20, message = "Supplier code must be between 2 and 20 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Supplier code must contain only uppercase letters, numbers, hyphens, and underscores")
    private String code;
    
    @Size(max = 100, message = "Contact person name cannot exceed 100 characters")
    private String contactPerson;
    
    @Email(message = "Email must be a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;
    
    @Pattern(regexp = "^[+]?[0-9\\s\\-\\(\\)]+$", message = "Phone number must contain only numbers, spaces, hyphens, parentheses, and optional plus sign")
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;
    
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;
    
    @Size(max = 50, message = "City cannot exceed 50 characters")
    private String city;
    
    @Size(max = 50, message = "State cannot exceed 50 characters")
    private String state;
    
    @Size(max = 50, message = "Country cannot exceed 50 characters")
    private String country;
    
    @Size(max = 20, message = "Postal code cannot exceed 20 characters")
    private String postalCode;
    
    @Size(max = 50, message = "Tax ID cannot exceed 50 characters")
    private String taxId;
    
    @Size(max = 100, message = "Payment terms cannot exceed 100 characters")
    private String paymentTerms;
} 