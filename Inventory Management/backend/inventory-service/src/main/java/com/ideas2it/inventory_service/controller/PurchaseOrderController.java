package com.ideas2it.inventory_service.controller;

import com.ideas2it.inventory_service.dto.PurchaseOrderRequest;
import com.ideas2it.inventory_service.dto.PurchaseOrderResponse;
import com.ideas2it.inventory_service.entity.PurchaseOrder;
import com.ideas2it.inventory_service.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderController {
    
    private final PurchaseOrderService purchaseOrderService;
    
    @GetMapping
    public ResponseEntity<?> getAllPurchaseOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("GET /api/purchase-orders - Fetching all purchase orders");
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PurchaseOrderResponse> orders = purchaseOrderService.getPurchaseOrdersWithPagination(pageable);
            return ResponseEntity.ok(new ApiResponse<>(
                    orders.getContent(),
                    true,
                    "Purchase orders retrieved successfully",
                    (int) orders.getTotalElements()
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase orders: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase orders: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getPurchaseOrderById(@PathVariable Long id) {
        log.info("GET /api/purchase-orders/{} - Fetching purchase order by ID", id);
        try {
            PurchaseOrderResponse order = purchaseOrderService.getPurchaseOrderById(id);
            return ResponseEntity.ok(new ApiResponse<>(
                    order,
                    true,
                    "Purchase order retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase order with ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase order: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/po-number/{poNumber}")
    public ResponseEntity<?> getPurchaseOrderByPoNumber(@PathVariable String poNumber) {
        log.info("GET /api/purchase-orders/po-number/{} - Fetching purchase order by PO number", poNumber);
        try {
            PurchaseOrderResponse order = purchaseOrderService.getPurchaseOrderByPoNumber(poNumber);
            return ResponseEntity.ok(new ApiResponse<>(
                    order,
                    true,
                    "Purchase order retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase order with PO number {}: {}", poNumber, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase order: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<?> getPurchaseOrdersBySupplier(@PathVariable Long supplierId) {
        log.info("GET /api/purchase-orders/supplier/{} - Fetching purchase orders by supplier", supplierId);
        try {
            List<PurchaseOrderResponse> orders = purchaseOrderService.getPurchaseOrdersBySupplier(supplierId);
            return ResponseEntity.ok(new ApiResponse<>(
                    orders,
                    true,
                    "Supplier purchase orders retrieved successfully",
                    orders.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase orders for supplier ID {}: {}", supplierId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching supplier purchase orders: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<?> getPurchaseOrdersByWarehouse(@PathVariable Long warehouseId) {
        log.info("GET /api/purchase-orders/warehouse/{} - Fetching purchase orders by warehouse", warehouseId);
        try {
            List<PurchaseOrderResponse> orders = purchaseOrderService.getPurchaseOrdersByWarehouse(warehouseId);
            return ResponseEntity.ok(new ApiResponse<>(
                    orders,
                    true,
                    "Warehouse purchase orders retrieved successfully",
                    orders.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase orders for warehouse ID {}: {}", warehouseId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching warehouse purchase orders: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getPurchaseOrdersByStatus(@PathVariable PurchaseOrder.OrderStatus status) {
        log.info("GET /api/purchase-orders/status/{} - Fetching purchase orders by status", status);
        try {
            List<PurchaseOrderResponse> orders = purchaseOrderService.getPurchaseOrdersByStatus(status);
            return ResponseEntity.ok(new ApiResponse<>(
                    orders,
                    true,
                    "Purchase orders by status retrieved successfully",
                    orders.size()
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase orders by status {}: {}", status, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase orders by status: " + e.getMessage(),
                    0
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createPurchaseOrder(@RequestBody PurchaseOrderRequest request) {
        log.info("POST /api/purchase-orders - Creating purchase order");
        try {
            PurchaseOrderResponse order = purchaseOrderService.createPurchaseOrder(request, 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    order,
                    true,
                    "Purchase order created successfully"
            ));
        } catch (Exception e) {
            log.error("Error creating purchase order: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error creating purchase order: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePurchaseOrder(
            @PathVariable Long id,
            @RequestBody PurchaseOrderRequest request) {
        log.info("PUT /api/purchase-orders/{} - Updating purchase order", id);
        try {
            PurchaseOrderResponse order = purchaseOrderService.updatePurchaseOrder(id, request, 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    order,
                    true,
                    "Purchase order updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating purchase order for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating purchase order: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePurchaseOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        log.info("PUT /api/purchase-orders/{}/status - Updating purchase order status", id);
        try {
            PurchaseOrderResponse order = purchaseOrderService.updatePurchaseOrderStatus(id, request.getStatus(), 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    order,
                    true,
                    "Purchase order status updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating purchase order status for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error updating purchase order status: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/{id}/receive")
    public ResponseEntity<?> receivePurchaseOrder(
            @PathVariable Long id,
            @RequestBody ReceiveItemsRequest request) {
        log.info("POST /api/purchase-orders/{}/receive - Receiving purchase order items", id);
        try {
            PurchaseOrderResponse order = purchaseOrderService.receivePurchaseOrder(id, request.getReceivedItems(), 1L); // TODO: Get from JWT
            return ResponseEntity.ok(new ApiResponse<>(
                    order,
                    true,
                    "Purchase order items received successfully"
            ));
        } catch (Exception e) {
            log.error("Error receiving purchase order items for ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error receiving purchase order items: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getPurchaseOrderCount() {
        log.info("GET /api/purchase-orders/count - Fetching purchase order count");
        try {
            long count = purchaseOrderService.getPurchaseOrderCount();
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Purchase order count retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase order count: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase order count: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/status/{status}")
    public ResponseEntity<?> getPurchaseOrderCountByStatus(@PathVariable PurchaseOrder.OrderStatus status) {
        log.info("GET /api/purchase-orders/count/status/{} - Fetching purchase order count by status", status);
        try {
            long count = purchaseOrderService.getPurchaseOrderCountByStatus(status);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Purchase order count by status retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase order count by status {}: {}", status, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase order count by status: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/supplier/{supplierId}")
    public ResponseEntity<?> getPurchaseOrderCountBySupplier(@PathVariable Long supplierId) {
        log.info("GET /api/purchase-orders/count/supplier/{} - Fetching purchase order count by supplier", supplierId);
        try {
            long count = purchaseOrderService.getPurchaseOrderCountBySupplier(supplierId);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Purchase order count by supplier retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase order count for supplier ID {}: {}", supplierId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase order count by supplier: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count/warehouse/{warehouseId}")
    public ResponseEntity<?> getPurchaseOrderCountByWarehouse(@PathVariable Long warehouseId) {
        log.info("GET /api/purchase-orders/count/warehouse/{} - Fetching purchase order count by warehouse", warehouseId);
        try {
            long count = purchaseOrderService.getPurchaseOrderCountByWarehouse(warehouseId);
            return ResponseEntity.ok(new ApiResponse<>(
                    count,
                    true,
                    "Purchase order count by warehouse retrieved successfully"
            ));
        } catch (Exception e) {
            log.error("Error fetching purchase order count for warehouse ID {}: {}", warehouseId, e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error fetching purchase order count by warehouse: " + e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllPurchaseOrders() {
        log.info("DELETE /api/purchase-orders/all - Deleting all purchase orders");
        try {
            purchaseOrderService.deleteAllPurchaseOrders();
            return ResponseEntity.ok(new ApiResponse<>(
                    null,
                    true,
                    "All purchase orders deleted successfully"
            ));
        } catch (Exception e) {
            log.error("Error deleting all purchase orders: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    null,
                    false,
                    "Error deleting all purchase orders: " + e.getMessage()
            ));
        }
    }
    
    // Helper classes for request/response
    public static class ApiResponse<T> {
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
    
    public static class StatusUpdateRequest {
        private PurchaseOrder.OrderStatus status;
        private String notes;
        
        // Getters and setters
        public PurchaseOrder.OrderStatus getStatus() { return status; }
        public void setStatus(PurchaseOrder.OrderStatus status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
    
    public static class ReceiveItemsRequest {
        private List<PurchaseOrderService.ReceiveItemRequest> receivedItems;
        
        // Getters and setters
        public List<PurchaseOrderService.ReceiveItemRequest> getReceivedItems() { return receivedItems; }
        public void setReceivedItems(List<PurchaseOrderService.ReceiveItemRequest> receivedItems) { this.receivedItems = receivedItems; }
    }
} 