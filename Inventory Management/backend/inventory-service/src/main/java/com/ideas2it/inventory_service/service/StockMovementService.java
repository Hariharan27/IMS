package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.StockMovementRequest;
import com.ideas2it.inventory_service.dto.StockMovementResponse;
import com.ideas2it.inventory_service.entity.Inventory;
import com.ideas2it.inventory_service.entity.Product;
import com.ideas2it.inventory_service.entity.StockMovement;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.entity.Warehouse;
import com.ideas2it.inventory_service.repository.InventoryRepository;
import com.ideas2it.inventory_service.repository.ProductRepository;
import com.ideas2it.inventory_service.repository.StockMovementRepository;
import com.ideas2it.inventory_service.repository.UserRepository;
import com.ideas2it.inventory_service.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StockMovementService {
    
    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    
    public List<StockMovementResponse> getAllStockMovements() {
        log.info("Fetching all stock movements");
        List<StockMovement> movements = stockMovementRepository.findAll();
        return movements.stream()
                .map(StockMovementResponse::fromStockMovement)
                .collect(Collectors.toList());
    }
    
    public StockMovementResponse getStockMovementById(Long id) {
        log.info("Fetching stock movement by ID: {}", id);
        StockMovement movement = stockMovementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock movement not found with ID: " + id));
        return StockMovementResponse.fromStockMovement(movement);
    }
    
    public List<StockMovementResponse> getStockMovementsByProduct(Long productId) {
        log.info("Fetching stock movements by product ID: {}", productId);
        
        // Verify product exists and is active
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is inactive with ID: " + productId);
        }
        
        List<StockMovement> movements = stockMovementRepository.findByProductIdOrderByMovementDateDesc(productId);
        return movements.stream()
                .map(StockMovementResponse::fromStockMovement)
                .collect(Collectors.toList());
    }
    
    public List<StockMovementResponse> getStockMovementsByWarehouse(Long warehouseId) {
        log.info("Fetching stock movements by warehouse ID: {}", warehouseId);
        
        // Verify warehouse exists and is active
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + warehouseId));
        
        if (!warehouse.getIsActive()) {
            throw new RuntimeException("Warehouse is inactive with ID: " + warehouseId);
        }
        
        List<StockMovement> movements = stockMovementRepository.findByWarehouseIdOrderByMovementDateDesc(warehouseId);
        return movements.stream()
                .map(StockMovementResponse::fromStockMovement)
                .collect(Collectors.toList());
    }
    
    public List<StockMovementResponse> getStockMovementsByMovementType(StockMovement.MovementType movementType) {
        log.info("Fetching stock movements by movement type: {}", movementType);
        List<StockMovement> movements = stockMovementRepository.findByMovementTypeOrderByMovementDateDesc(movementType);
        return movements.stream()
                .map(StockMovementResponse::fromStockMovement)
                .collect(Collectors.toList());
    }
    
    public List<StockMovementResponse> getStockMovementsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching stock movements between {} and {}", startDate, endDate);
        List<StockMovement> movements = stockMovementRepository.findByMovementDateBetweenOrderByMovementDateDesc(startDate, endDate);
        return movements.stream()
                .map(StockMovementResponse::fromStockMovement)
                .collect(Collectors.toList());
    }
    
    public List<StockMovementResponse> getStockMovementsByProductAndDateRange(Long productId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Fetching stock movements for product ID: {} between {} and {}", productId, startDate, endDate);
        List<StockMovement> movements = stockMovementRepository.findByProductIdAndMovementDateBetweenOrderByMovementDateDesc(productId, startDate, endDate);
        return movements.stream()
                .map(StockMovementResponse::fromStockMovement)
                .collect(Collectors.toList());
    }
    
    public Page<StockMovementResponse> getStockMovementsWithPagination(Pageable pageable) {
        log.info("Fetching stock movements with pagination");
        Page<StockMovement> movementsPage = stockMovementRepository.findAllByOrderByMovementDateDesc(pageable);
        return movementsPage.map(StockMovementResponse::fromStockMovement);
    }
    
    public StockMovementResponse createStockMovement(StockMovementRequest request, Long currentUserId) {
        log.info("Creating stock movement for product ID: {} and warehouse ID: {}", request.getProductId(), request.getWarehouseId());
        
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
        log.info("Looking up user with ID: {}", currentUserId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found with ID: " + currentUserId));
        log.info("Found user: {} (ID: {})", currentUser.getUsername(), currentUser.getId());
        
        // Create and save the stock movement
        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setWarehouse(warehouse);
        movement.setMovementType(request.getMovementType());
        movement.setQuantity(request.getQuantity());
        movement.setReferenceType(request.getReferenceType());
        movement.setReferenceId(request.getReferenceId());
        movement.setNotes(request.getNotes());
        movement.setCreatedBy(currentUser);
        
        StockMovement savedMovement = stockMovementRepository.save(movement);
        log.info("Stock movement created successfully with ID: {}", savedMovement.getId());
        
        // Update inventory quantities based on the stock movement
        updateInventoryQuantities(product.getId(), warehouse.getId(), request.getMovementType(), request.getQuantity(), currentUser);
        
        return StockMovementResponse.fromStockMovement(savedMovement);
    }
    
    /**
     * Update inventory quantities based on stock movement
     */
    private void updateInventoryQuantities(Long productId, Long warehouseId, StockMovement.MovementType movementType, Integer quantity, User currentUser) {
        log.info("Updating inventory quantities for product ID: {} and warehouse ID: {} with movement type: {} and quantity: {}", 
                productId, warehouseId, movementType, quantity);
        
        // Find existing inventory record
        Inventory inventory = inventoryRepository.findByProductIdAndWarehouseId(productId, warehouseId)
                .orElse(null);
        
        if (inventory == null) {
            // Create new inventory record if it doesn't exist
            log.info("Creating new inventory record for product ID: {} and warehouse ID: {}", productId, warehouseId);
            inventory = new Inventory();
            inventory.setProduct(productRepository.findById(productId).orElseThrow());
            inventory.setWarehouse(warehouseRepository.findById(warehouseId).orElseThrow());
            inventory.setQuantityOnHand(0);
            inventory.setQuantityReserved(0);
            inventory.setQuantityAvailable(0);
        }
        
        // Update quantities based on movement type
        if (movementType == StockMovement.MovementType.IN) {
            inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantity);
            log.info("Added {} to quantity on hand. New total: {}", quantity, inventory.getQuantityOnHand());
        } else if (movementType == StockMovement.MovementType.OUT) {
            // Check if we have enough stock
            if (inventory.getQuantityOnHand() < quantity) {
                throw new RuntimeException("Insufficient stock. Available: " + inventory.getQuantityOnHand() + ", Requested: " + quantity);
            }
            inventory.setQuantityOnHand(inventory.getQuantityOnHand() - quantity);
            log.info("Removed {} from quantity on hand. New total: {}", quantity, inventory.getQuantityOnHand());
        }
        
        // Update audit fields
        inventory.setUpdatedBy(currentUser);
        inventory.setLastUpdatedAt(LocalDateTime.now());
        
        // Save the updated inventory
        inventoryRepository.save(inventory);
        log.info("Inventory updated successfully for product ID: {} and warehouse ID: {}", productId, warehouseId);
    }
    
    public long getStockMovementCount() {
        return stockMovementRepository.count();
    }
    
    public long getStockMovementCountByProduct(Long productId) {
        return stockMovementRepository.countByProductId(productId);
    }
    
    public long getStockMovementCountByWarehouse(Long warehouseId) {
        return stockMovementRepository.countByWarehouseId(warehouseId);
    }
    
    public long getStockMovementCountByMovementType(StockMovement.MovementType movementType) {
        return stockMovementRepository.countByMovementType(movementType);
    }
    
    public Integer getTotalQuantityByProductAndMovementType(Long productId, StockMovement.MovementType movementType) {
        Integer total = stockMovementRepository.getTotalQuantityByProductAndMovementType(productId, movementType);
        return total != null ? total : 0;
    }
    
    public Integer getTotalQuantityByWarehouseAndMovementType(Long warehouseId, StockMovement.MovementType movementType) {
        Integer total = stockMovementRepository.getTotalQuantityByWarehouseAndMovementType(warehouseId, movementType);
        return total != null ? total : 0;
    }
} 