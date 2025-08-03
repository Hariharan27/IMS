package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.CategoryRequest;
import com.ideas2it.inventory_service.dto.CategoryResponse;
import com.ideas2it.inventory_service.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        log.info("GET /api/categories - Fetching all categories");
        try {
            List<CategoryResponse> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(new ApiResponse<>(
                    categories,
                    true,
                    "Categories retrieved successfully",
                    categories.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching categories: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        log.info("GET /api/categories/{} - Fetching category by ID", id);
        try {
            CategoryResponse category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    category,
                    true,
                    "Category retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching category with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching category: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/root")
    public ResponseEntity<?> getRootCategories() {
        log.info("GET /api/categories/root - Fetching root categories");
        try {
            List<CategoryResponse> rootCategories = categoryService.getRootCategories();
            return ResponseEntity.ok(new ApiResponse<>(
                    rootCategories,
                    true,
                    "Root categories retrieved successfully",
                    rootCategories.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching root categories: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching root categories: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}/children")
    public ResponseEntity<?> getChildCategories(@PathVariable Long id) {
        log.info("GET /api/categories/{}/children - Fetching child categories", id);
        try {
            List<CategoryResponse> children = categoryService.getChildCategories(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    children,
                    true,
                    "Child categories retrieved successfully",
                    children.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching child categories for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching child categories: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchCategories(@RequestParam String q) {
        log.info("GET /api/categories/search?q={} - Searching categories", q);
        try {
            List<CategoryResponse> categories = categoryService.searchCategories(q);
            return ResponseEntity.ok(new ApiResponse<>(
                    categories,
                    true,
                    "Category search completed successfully",
                    categories.size()
            ));
        } catch (Exception e) {
            log.error("Error searching categories with term '{}': {}", q, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error searching categories: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryRequest request) {
        log.info("POST /api/categories - Creating new category: {}", request.getName());
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            CategoryResponse category = categoryService.createCategory(request, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    category,
                    true,
                    "Category created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating category: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error creating category: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        log.info("PUT /api/categories/{} - Updating category", id);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            CategoryResponse category = categoryService.updateCategory(id, request, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    category,
                    true,
                    "Category updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating category with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating category: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCategoryStatus(@PathVariable Long id, @RequestParam Boolean isActive) {
        log.info("PUT /api/categories/{}/status?isActive={} - Updating category status", id, isActive);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            CategoryResponse category = categoryService.updateCategoryStatus(id, isActive, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    category,
                    true,
                    "Category status updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating category status with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating category status: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        log.info("DELETE /api/categories/{} - Deleting category", id);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            categoryService.deleteCategory(id, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Category deleted successfully"
            ));
        } catch (Exception e) {
            log.error("Error deleting category with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error deleting category: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getCategoryCount() {
        log.info("GET /api/categories/count - Fetching category count");
        try {
            long count = categoryService.getCategoryCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Category count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching category count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching category count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/root")
    public ResponseEntity<?> getRootCategoryCount() {
        log.info("GET /api/categories/count/root - Fetching root category count");
        try {
            long count = categoryService.getRootCategoryCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Root category count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching root category count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching root category count: " + e.getMessage()
            ));
        }
    }
    
    // Helper class for consistent API responses
    private static class ApiResponse<T> {
        private T data;
        private boolean success;
        private String message;
        private int count;
        
        public ApiResponse(T data, boolean success, String message) {
            this.data = data;
            this.success = success;
            this.message = message;
        }
        
        public ApiResponse(T data, boolean success, String message, int count) {
            this.data = data;
            this.success = success;
            this.message = message;
            this.count = count;
        }
        
        // Getters and setters
        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }
} 