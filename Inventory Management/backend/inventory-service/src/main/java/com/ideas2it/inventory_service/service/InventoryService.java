package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.InventoryRequest;
import com.ideas2it.inventory_service.dto.InventoryResponse;
import com.ideas2it.inventory_service.entity.Inventory;
import com.ideas2it.inventory_service.entity.Product;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.entity.Warehouse;
import com.ideas2it.inventory_service.repository.InventoryRepository;
import com.ideas2it.inventory_service.repository.ProductRepository;
import com.ideas2it.inventory_service.repository.UserRepository;
import com.ideas2it.inventory_service.repository.WarehouseRepository;
import com.ideas2it.inventory_service.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryService {
    
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final AlertService alertService;
    
    public List<InventoryResponse> getAllInventory() {
        log.info("Fetching all inventory");
        List<Inventory> inventoryList = inventoryRepository.findAll();
        return inventoryList.stream()
                .map(InventoryResponse::fromInventory)
                .collect(Collectors.toList());
    }
    
    public InventoryResponse getInventoryById(Long id) {
        log.info("Fetching inventory by ID: {}", id);
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found with ID: " + id));
        return InventoryResponse.fromInventory(inventory);
    }
    
    public List<InventoryResponse> getInventoryByProduct(Long productId) {
        log.info("Fetching inventory by product ID: {}", productId);
        
        // Verify product exists and is active
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is inactive with ID: " + productId);
        }
        
        List<Inventory> inventoryList = inventoryRepository.findByProductId(productId);
        return inventoryList.stream()
                .map(InventoryResponse::fromInventory)
                .collect(Collectors.toList());
    }
    
    public List<InventoryResponse> getInventoryByWarehouse(Long warehouseId) {
        log.info("Fetching inventory by warehouse ID: {}", warehouseId);
        
        // Verify warehouse exists and is active
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + warehouseId));
        
        if (!warehouse.getIsActive()) {
            throw new RuntimeException("Warehouse is inactive with ID: " + warehouseId);
        }
        
        List<Inventory> inventoryList = inventoryRepository.findByWarehouseId(warehouseId);
        return inventoryList.stream()
                .map(InventoryResponse::fromInventory)
                .collect(Collectors.toList());
    }
    
    public InventoryResponse createInventory(InventoryRequest request, Long currentUserId) {
        log.info("Creating inventory for product ID: {} and warehouse ID: {}", request.getProductId(), request.getWarehouseId());
        
        // Validate product exists and is active
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is inactive with ID: " + request.getProductId());
        }
        
        // Validate warehouse exists and is active
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + request.getWarehouseId()));
        
        if (!warehouse.getIsActive()) {
            throw new RuntimeException("Warehouse is inactive with ID: " + request.getWarehouseId());
        }
        
        // Check if inventory already exists for this product and warehouse
        if (inventoryRepository.findByProductIdAndWarehouseId(request.getProductId(), request.getWarehouseId()).isPresent()) {
            throw new RuntimeException("Inventory already exists for product ID: " + request.getProductId() + " and warehouse ID: " + request.getWarehouseId());
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setWarehouse(warehouse);
        inventory.setQuantityOnHand(request.getQuantityOnHand());
        inventory.setQuantityReserved(request.getQuantityReserved());
        inventory.setUpdatedBy(currentUser);
        
        Inventory savedInventory = inventoryRepository.save(inventory);
        log.info("Inventory created successfully with ID: {}", savedInventory.getId());
        
        return InventoryResponse.fromInventory(savedInventory);
    }
    
    public InventoryResponse updateInventory(Long id, InventoryRequest request, Long currentUserId) {
        log.info("Updating inventory with ID: {}", id);
        
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found with ID: " + id));
        
        // Validate product exists and is active
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is inactive with ID: " + request.getProductId());
        }
        
        // Validate warehouse exists and is active
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + request.getWarehouseId()));
        
        if (!warehouse.getIsActive()) {
            throw new RuntimeException("Warehouse is inactive with ID: " + request.getWarehouseId());
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        inventory.setProduct(product);
        inventory.setWarehouse(warehouse);
        inventory.setQuantityOnHand(request.getQuantityOnHand());
        inventory.setQuantityReserved(request.getQuantityReserved());
        inventory.setUpdatedBy(currentUser);
        
        Inventory updatedInventory = inventoryRepository.save(inventory);
        log.info("Inventory updated successfully with ID: {}", updatedInventory.getId());
        
        // Trigger real-time alert checks
        alertService.checkAndCreateLowStockAlert(updatedInventory);
        alertService.checkAndCreateOutOfStockAlert(updatedInventory);
        
        return InventoryResponse.fromInventory(updatedInventory);
    }
    
    public List<InventoryResponse> getLowStockInventory() {
        log.info("Fetching low stock inventory");
        List<Inventory> lowStockList = inventoryRepository.findLowStockInventory();
        return lowStockList.stream()
                .map(InventoryResponse::fromInventory)
                .collect(Collectors.toList());
    }
    
    public List<Inventory> getLowStockInventoryEntities() {
        log.info("Fetching low stock inventory entities");
        return inventoryRepository.findLowStockInventory();
    }
    
    public List<InventoryResponse> getOutOfStockInventory() {
        log.info("Fetching out of stock inventory");
        List<Inventory> outOfStockList = inventoryRepository.findOutOfStockInventory();
        return outOfStockList.stream()
                .map(InventoryResponse::fromInventory)
                .collect(Collectors.toList());
    }
    
    public long getInventoryCount() {
        return inventoryRepository.count();
    }
    
    public long getInventoryCountByProduct(Long productId) {
        return inventoryRepository.countByProductId(productId);
    }
    
    public long getInventoryCountByWarehouse(Long warehouseId) {
        return inventoryRepository.countByWarehouseId(warehouseId);
    }
    
    public InventoryResponse adjustInventory(Long id, int quantityChange, String adjustmentType, Long currentUserId) {
        log.info("Adjusting inventory with ID: {} by quantity: {} for type: {}", id, quantityChange, adjustmentType);
        
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found with ID: " + id));
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Calculate new quantities
        int newQuantityOnHand = inventory.getQuantityOnHand() + quantityChange;
        if (newQuantityOnHand < 0) {
            throw new RuntimeException("Cannot reduce inventory below zero");
        }
        
        // Update inventory
        inventory.setQuantityOnHand(newQuantityOnHand);
        inventory.setUpdatedBy(currentUser);
        
        Inventory updatedInventory = inventoryRepository.save(inventory);
        log.info("Inventory adjusted successfully with ID: {}", updatedInventory.getId());
        
        // Create inventory adjustment alert
        alertService.createInventoryAdjustmentAlert(updatedInventory, adjustmentType, quantityChange, currentUserId);
        
        // Trigger real-time alert checks
        alertService.checkAndCreateLowStockAlert(updatedInventory);
        alertService.checkAndCreateOutOfStockAlert(updatedInventory);
        
        return InventoryResponse.fromInventory(updatedInventory);
    }
} 