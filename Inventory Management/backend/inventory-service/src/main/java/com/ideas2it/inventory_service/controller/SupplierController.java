package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.SupplierRequest;
import com.ideas2it.inventory_service.dto.SupplierResponse;
import com.ideas2it.inventory_service.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Slf4j
public class SupplierController {
    
    private final SupplierService supplierService;
    
    @GetMapping
    public ResponseEntity<?> getAllSuppliers() {
        log.info("GET /api/suppliers - Fetching all suppliers");
        try {
            List<SupplierResponse> suppliers = supplierService.getAllSuppliers();
            return ResponseEntity.ok(new ApiResponse<>(
                    suppliers,
                    true,
                    "Suppliers retrieved successfully",
                    suppliers.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching suppliers: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching suppliers: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getSupplierById(@PathVariable Long id) {
        log.info("GET /api/suppliers/{} - Fetching supplier by ID", id);
        try {
            SupplierResponse supplier = supplierService.getSupplierById(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    supplier,
                    true,
                    "Supplier retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching supplier with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching supplier: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getSupplierByCode(@PathVariable String code) {
        log.info("GET /api/suppliers/code/{} - Fetching supplier by code", code);
        try {
            SupplierResponse supplier = supplierService.getSupplierByCode(code);
            return ResponseEntity.ok(new ApiResponse<>(
                    supplier,
                    true,
                    "Supplier retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching supplier with code {}: {}", code, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching supplier: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchSuppliers(@RequestParam String q) {
        log.info("GET /api/suppliers/search?q={} - Searching suppliers", q);
        try {
            List<SupplierResponse> suppliers = supplierService.searchSuppliers(q);
            return ResponseEntity.ok(new ApiResponse<>(
                    suppliers,
                    true,
                    "Supplier search completed successfully",
                    suppliers.size()
            ));
        } catch (Exception e) {
            log.error("Error searching suppliers with term '{}': {}", q, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error searching suppliers: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/city/{city}")
    public ResponseEntity<?> getSuppliersByCity(@PathVariable String city) {
        log.info("GET /api/suppliers/city/{} - Fetching suppliers by city", city);
        try {
            List<SupplierResponse> suppliers = supplierService.getSuppliersByCity(city);
            return ResponseEntity.ok(new ApiResponse<>(
                    suppliers,
                    true,
                    "Suppliers by city retrieved successfully",
                    suppliers.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching suppliers by city '{}': {}", city, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching suppliers by city: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/country/{country}")
    public ResponseEntity<?> getSuppliersByCountry(@PathVariable String country) {
        log.info("GET /api/suppliers/country/{} - Fetching suppliers by country", country);
        try {
            List<SupplierResponse> suppliers = supplierService.getSuppliersByCountry(country);
            return ResponseEntity.ok(new ApiResponse<>(
                    suppliers,
                    true,
                    "Suppliers by country retrieved successfully",
                    suppliers.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching suppliers by country '{}': {}", country, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching suppliers by country: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/payment-terms/{paymentTerms}")
    public ResponseEntity<?> getSuppliersByPaymentTerms(@PathVariable String paymentTerms) {
        log.info("GET /api/suppliers/payment-terms/{} - Fetching suppliers by payment terms", paymentTerms);
        try {
            List<SupplierResponse> suppliers = supplierService.getSuppliersByPaymentTerms(paymentTerms);
            return ResponseEntity.ok(new ApiResponse<>(
                    suppliers,
                    true,
                    "Suppliers by payment terms retrieved successfully",
                    suppliers.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching suppliers by payment terms '{}': {}", paymentTerms, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching suppliers by payment terms: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createSupplier(@Valid @RequestBody SupplierRequest request) {
        log.info("POST /api/suppliers - Creating new supplier: {}", request.getName());
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            SupplierResponse supplier = supplierService.createSupplier(request, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    supplier,
                    true,
                    "Supplier created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating supplier: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error creating supplier: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        log.info("PUT /api/suppliers/{} - Updating supplier", id);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            SupplierResponse supplier = supplierService.updateSupplier(id, request, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    supplier,
                    true,
                    "Supplier updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating supplier with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating supplier: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateSupplierStatus(@PathVariable Long id, @RequestParam Boolean isActive) {
        log.info("PUT /api/suppliers/{}/status?isActive={} - Updating supplier status", id, isActive);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            SupplierResponse supplier = supplierService.updateSupplierStatus(id, isActive, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    supplier,
                    true,
                    "Supplier status updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating supplier status with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating supplier status: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        log.info("DELETE /api/suppliers/{} - Deleting supplier", id);
        try {
            // TODO: Extract currentUserId from JWT token
            Long currentUserId = 1L; // Placeholder - should be extracted from JWT
            
            supplierService.deleteSupplier(id, currentUserId);
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "Supplier deleted successfully"
            ));
        } catch (Exception e) {
            log.error("Error deleting supplier with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error deleting supplier: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getSupplierCount() {
        log.info("GET /api/suppliers/count - Fetching supplier count");
        try {
            long count = supplierService.getSupplierCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Supplier count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching supplier count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching supplier count: " + e.getMessage()
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