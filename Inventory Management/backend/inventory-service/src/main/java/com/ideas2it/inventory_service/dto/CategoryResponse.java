package com.ideas2it.inventory_service.dto;

import com.ideas2it.inventory_service.entity.Category;
import com.ideas2it.inventory_service.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    
    private Long id;
    private String name;
    private String description;
    private CategoryResponse parent;
    private List<CategoryResponse> children;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse createdBy;
    private UserResponse updatedBy;
    
    public static CategoryResponse fromCategory(Category category) {
        if (category == null) {
            return null;
        }
        
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setIsActive(category.getIsActive());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        
        // Map parent category (avoid infinite recursion)
        if (category.getParent() != null) {
            CategoryResponse parentResponse = new CategoryResponse();
            parentResponse.setId(category.getParent().getId());
            parentResponse.setName(category.getParent().getName());
            parentResponse.setDescription(category.getParent().getDescription());
            parentResponse.setIsActive(category.getParent().getIsActive());
            response.setParent(parentResponse);
        }
        
        // Map children categories (avoid infinite recursion)
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            List<CategoryResponse> childrenResponses = category.getChildren().stream()
                    .map(child -> {
                        CategoryResponse childResponse = new CategoryResponse();
                        childResponse.setId(child.getId());
                        childResponse.setName(child.getName());
                        childResponse.setDescription(child.getDescription());
                        childResponse.setIsActive(child.getIsActive());
                        return childResponse;
                    })
                    .collect(Collectors.toList());
            response.setChildren(childrenResponses);
        }
        
        // Map audit fields
        if (category.getCreatedBy() != null) {
            response.setCreatedBy(UserResponse.fromUser(category.getCreatedBy()));
        }
        if (category.getUpdatedBy() != null) {
            response.setUpdatedBy(UserResponse.fromUser(category.getUpdatedBy()));
        }
        
        return response;
    }
} 