package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    // Find movements by product
    List<StockMovement> findByProductIdOrderByMovementDateDesc(Long productId);
    
    // Find movements by warehouse
    List<StockMovement> findByWarehouseIdOrderByMovementDateDesc(Long warehouseId);
    
    // Find movements by product and warehouse
    List<StockMovement> findByProductIdAndWarehouseIdOrderByMovementDateDesc(Long productId, Long warehouseId);
    
    // Find movements by movement type
    List<StockMovement> findByMovementTypeOrderByMovementDateDesc(StockMovement.MovementType movementType);
    
    // Find movements by reference type and reference ID
    List<StockMovement> findByReferenceTypeAndReferenceIdOrderByMovementDateDesc(StockMovement.ReferenceType referenceType, Long referenceId);
    
    // Find movements by date range
    @Query("SELECT sm FROM StockMovement sm WHERE sm.movementDate BETWEEN :startDate AND :endDate ORDER BY sm.movementDate DESC")
    List<StockMovement> findByMovementDateBetweenOrderByMovementDateDesc(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find movements by product and date range
    @Query("SELECT sm FROM StockMovement sm WHERE sm.product.id = :productId AND sm.movementDate BETWEEN :startDate AND :endDate ORDER BY sm.movementDate DESC")
    List<StockMovement> findByProductIdAndMovementDateBetweenOrderByMovementDateDesc(@Param("productId") Long productId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find movements by warehouse and date range
    @Query("SELECT sm FROM StockMovement sm WHERE sm.warehouse.id = :warehouseId AND sm.movementDate BETWEEN :startDate AND :endDate ORDER BY sm.movementDate DESC")
    List<StockMovement> findByWarehouseIdAndMovementDateBetweenOrderByMovementDateDesc(@Param("warehouseId") Long warehouseId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find movements with pagination
    Page<StockMovement> findAllByOrderByMovementDateDesc(Pageable pageable);
    
    // Find movements by product with pagination
    Page<StockMovement> findByProductIdOrderByMovementDateDesc(Long productId, Pageable pageable);
    
    // Find movements by warehouse with pagination
    Page<StockMovement> findByWarehouseIdOrderByMovementDateDesc(Long warehouseId, Pageable pageable);
    
    // Count movements by product
    long countByProductId(Long productId);
    
    // Count movements by warehouse
    long countByWarehouseId(Long warehouseId);
    
    // Count movements by movement type
    long countByMovementType(StockMovement.MovementType movementType);
    
    // Get total quantity moved by product and movement type
    @Query("SELECT SUM(sm.quantity) FROM StockMovement sm WHERE sm.product.id = :productId AND sm.movementType = :movementType")
    Integer getTotalQuantityByProductAndMovementType(@Param("productId") Long productId, @Param("movementType") StockMovement.MovementType movementType);
    
    // Get total quantity moved by warehouse and movement type
    @Query("SELECT SUM(sm.quantity) FROM StockMovement sm WHERE sm.warehouse.id = :warehouseId AND sm.movementType = :movementType")
    Integer getTotalQuantityByWarehouseAndMovementType(@Param("warehouseId") Long warehouseId, @Param("movementType") StockMovement.MovementType movementType);
    
    // Find movements by product, date after, and movement type (for demand analysis)
    @Query("SELECT sm FROM StockMovement sm WHERE sm.product.id = :productId AND sm.movementDate >= :startDate AND sm.movementType = :movementType ORDER BY sm.movementDate DESC")
    List<StockMovement> findByProductIdAndMovementDateAfterAndMovementType(@Param("productId") Long productId, @Param("startDate") LocalDateTime startDate, @Param("movementType") StockMovement.MovementType movementType);
} 