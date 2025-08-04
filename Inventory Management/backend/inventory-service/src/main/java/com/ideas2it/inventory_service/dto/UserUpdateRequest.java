package com.ideas2it.inventory_service.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Boolean isActive;
} 