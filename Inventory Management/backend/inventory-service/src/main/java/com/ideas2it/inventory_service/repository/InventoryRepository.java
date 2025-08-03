package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    // Find inventory by product and warehouse
    Optional<Inventory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);
    
    // Find all inventory for a specific product
    List<Inventory> findByProductId(Long productId);
    
    // Find all inventory for a specific warehouse
    List<Inventory> findByWarehouseId(Long warehouseId);
    
    // Find inventory with low stock (quantity_available <= reorder_point)
    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable <= i.product.reorderPoint AND i.product.isActive = true")
    List<Inventory> findLowStockInventory();
    
    // Find inventory with out of stock (quantity_available = 0)
    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable = 0 AND i.product.isActive = true")
    List<Inventory> findOutOfStockInventory();
    
    // Find inventory with stock below threshold
    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable <= :threshold AND i.product.isActive = true")
    List<Inventory> findInventoryBelowThreshold(@Param("threshold") Integer threshold);
    
    // Count total inventory items
    long count();
    
    // Count inventory by warehouse
    long countByWarehouseId(Long warehouseId);
    
    // Count inventory by product
    long countByProductId(Long productId);
    
    // Find inventory with positive stock
    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable > 0 AND i.product.isActive = true")
    List<Inventory> findInventoryWithStock();
    
    // Find inventory by product and warehouse with stock
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.warehouse.id = :warehouseId AND i.quantityAvailable > 0")
    Optional<Inventory> findInventoryWithStockByProductAndWarehouse(@Param("productId") Long productId, @Param("warehouseId") Long warehouseId);
} 