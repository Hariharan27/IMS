package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.Supplier;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    
    private Long id;
    private String name;
    private String code;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String taxId;
    private String paymentTerms;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse createdBy;
    private UserResponse updatedBy;
    
    public static SupplierResponse fromSupplier(Supplier supplier) {
        if (supplier == null) {
            return null;
        }
        
        SupplierResponse response = new SupplierResponse();
        response.setId(supplier.getId());
        response.setName(supplier.getName());
        response.setCode(supplier.getCode());
        response.setContactPerson(supplier.getContactPerson());
        response.setEmail(supplier.getEmail());
        response.setPhone(supplier.getPhone());
        response.setAddress(supplier.getAddress());
        response.setCity(supplier.getCity());
        response.setState(supplier.getState());
        response.setCountry(supplier.getCountry());
        response.setPostalCode(supplier.getPostalCode());
        response.setTaxId(supplier.getTaxId());
        response.setPaymentTerms(supplier.getPaymentTerms());
        response.setIsActive(supplier.getIsActive());
        response.setCreatedAt(supplier.getCreatedAt());
        response.setUpdatedAt(supplier.getUpdatedAt());
        
        // Map audit fields
        if (supplier.getCreatedBy() != null) {
            response.setCreatedBy(UserResponse.fromUser(supplier.getCreatedBy()));
        }
        if (supplier.getUpdatedBy() != null) {
            response.setUpdatedBy(UserResponse.fromUser(supplier.getUpdatedBy()));
        }
        
        return response;
    }
} 