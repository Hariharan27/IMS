package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.Warehouse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseResponse {
    private Long id;
    private String name;
    private String code;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String phone;
    private String email;
    private UserResponse manager;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse createdBy;
    private UserResponse updatedBy;
    
    public static WarehouseResponse fromWarehouse(Warehouse warehouse) {
        WarehouseResponse response = new WarehouseResponse();
        response.setId(warehouse.getId());
        response.setName(warehouse.getName());
        response.setCode(warehouse.getCode());
        response.setAddress(warehouse.getAddress());
        response.setCity(warehouse.getCity());
        response.setState(warehouse.getState());
        response.setCountry(warehouse.getCountry());
        response.setPostalCode(warehouse.getPostalCode());
        response.setPhone(warehouse.getPhone());
        response.setEmail(warehouse.getEmail());
        response.setIsActive(warehouse.getIsActive());
        response.setCreatedAt(warehouse.getCreatedAt());
        response.setUpdatedAt(warehouse.getUpdatedAt());
        
        if (warehouse.getManager() != null) {
            response.setManager(UserResponse.fromUser(warehouse.getManager()));
        }
        
        if (warehouse.getCreatedBy() != null) {
            response.setCreatedBy(UserResponse.fromUser(warehouse.getCreatedBy()));
        }
        
        if (warehouse.getUpdatedBy() != null) {
            response.setUpdatedBy(UserResponse.fromUser(warehouse.getUpdatedBy()));
        }
        
        return response;
    }
} 