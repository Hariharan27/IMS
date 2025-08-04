package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.ProductRequest;
import com.ideas2it.inventory_service.dto.ProductResponse;
import com.ideas2it.inventory_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        
        log.info("GET /api/products - Fetching products with filters: search={}, categoryId={}, isActive={}, page={}, size={}", 
                search, categoryId, isActive, page, size);
        
        try {
            List<ProductResponse> products;
            
            // Apply filters
            if (search != null && !search.trim().isEmpty()) {
                products = productService.searchProducts(search);
            } else if (categoryId != null) {
                products = productService.getProductsByCategory(categoryId);
            } else {
                products = productService.getAllProducts();
            }
            
            // Apply status filter if provided
            if (isActive != null) {
                products = products.stream()
                        .filter(product -> product.getIsActive().equals(isActive))
                        .collect(Collectors.toList());
            }
            
            // Apply pagination
            int totalElements = products.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int startIndex = page * size;
            int endIndex = Math.min(startIndex + size, totalElements);
            
            List<ProductResponse> paginatedProducts = products.subList(startIndex, endIndex);
            
            // Create pagination response
            Map<String, Object> paginationData = new HashMap<>();
            paginationData.put("content", paginatedProducts);
            paginationData.put("totalElements", totalElements);
            paginationData.put("totalPages", totalPages);
            paginationData.put("currentPage", page);
            paginationData.put("size", size);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    paginationData,
                    true,
                    "Products retrieved successfully",
                    totalElements
            ));
        } catch (Exception e) {
            log.error("Error fetching products: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching products: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        log.info("GET /api/products/{} - Fetching product by ID", id);
        try {
            ProductResponse product = productService.getProductById(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    product,
                    true,
                    "Product retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching product with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/sku/{sku}")
    public ResponseEntity<?> getProductBySku(@PathVariable String sku) {
        log.info("GET /api/products/sku/{} - Fetching product by SKU", sku);
        try {
            ProductResponse product = productService.getProductBySku(sku);
            return ResponseEntity.ok(new ApiResponse<>(
                    product,
                    true,
                    "Product retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching product with SKU {}: {}", sku, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
        log.info("GET /api/products/category/{} - Fetching products by category", categoryId);
        try {
            List<ProductResponse> products = productService.getProductsByCategory(categoryId);
            return ResponseEntity.ok(new ApiResponse<>(
                    products,
                    true,
                    "Products by category retrieved successfully",
                    products.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching products by category ID {}: {}", categoryId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching products by category: " + e.getMessage(),
                    0
            ));
        }
    }
    

    
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String q) {
        log.info("GET /api/products/search?q={} - Searching products", q);
        try {
            List<ProductResponse> products = productService.searchProducts(q);
            return ResponseEntity.ok(new ApiResponse<>(
                    products,
                    true,
                    "Product search completed successfully",
                    products.size()
            ));
        } catch (Exception e) {
            log.error("Error searching products with term '{}': {}", q, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error searching products: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/price-range")
    public ResponseEntity<?> getProductsByPriceRange(@RequestParam Double minPrice, @RequestParam Double maxPrice) {
        log.info("GET /api/products/price-range?minPrice={}&maxPrice={} - Fetching products by price range", minPrice, maxPrice);
        try {
            List<ProductResponse> products = productService.getProductsByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(new ApiResponse<>(
                    products,
                    true,
                    "Products by price range retrieved successfully",
                    products.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching products by price range {} - {}: {}", minPrice, maxPrice, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching products by price range: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest request) {
        log.info("POST /api/products - Creating new product: {}", request.getName());
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            ProductResponse product = productService.createProduct(request, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    product,
                    true,
                    "Product created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating product: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error creating product: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        log.info("PUT /api/products/{} - Updating product", id);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            ProductResponse product = productService.updateProduct(id, request, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    product,
                    true,
                    "Product updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating product with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating product: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateProductStatus(@PathVariable Long id, @RequestParam Boolean isActive) {
        log.info("PUT /api/products/{}/status?isActive={} - Updating product status", id, isActive);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            ProductResponse product = productService.updateProductStatus(id, isActive, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    product,
                    true,
                    "Product status updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating product status with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating product status: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        log.info("DELETE /api/products/{} - Deleting product", id);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            productService.deleteProduct(id, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Product deleted successfully"
            ));
        } catch (Exception e) {
            log.error("Error deleting product with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error deleting product: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getProductCount() {
        log.info("GET /api/products/count - Fetching product count");
        try {
            long count = productService.getProductCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Product count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching product count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/category/{categoryId}")
    public ResponseEntity<?> getProductCountByCategory(@PathVariable Long categoryId) {
        log.info("GET /api/products/count/category/{} - Fetching product count by category", categoryId);
        try {
            long count = productService.getProductCountByCategory(categoryId);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Product count by category retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching product count by category ID {}: {}", categoryId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching product count by category: " + e.getMessage()
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