package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    
    // Find by PO number
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    
    // Find by supplier
    List<PurchaseOrder> findBySupplierIdOrderByOrderDateDesc(Long supplierId);
    
    // Find by warehouse
    List<PurchaseOrder> findByWarehouseIdOrderByOrderDateDesc(Long warehouseId);
    
    // Find by status
    List<PurchaseOrder> findByStatusOrderByOrderDateDesc(PurchaseOrder.OrderStatus status);
    
    // Find by supplier and status
    List<PurchaseOrder> findBySupplierIdAndStatusOrderByOrderDateDesc(Long supplierId, PurchaseOrder.OrderStatus status);
    
    // Find by warehouse and status
    List<PurchaseOrder> findByWarehouseIdAndStatusOrderByOrderDateDesc(Long warehouseId, PurchaseOrder.OrderStatus status);
    
    // Find by date range
    @Query("SELECT po FROM PurchaseOrder po WHERE po.orderDate BETWEEN :startDate AND :endDate ORDER BY po.orderDate DESC")
    List<PurchaseOrder> findByOrderDateBetweenOrderByOrderDateDesc(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find by supplier and date range
    @Query("SELECT po FROM PurchaseOrder po WHERE po.supplier.id = :supplierId AND po.orderDate BETWEEN :startDate AND :endDate ORDER BY po.orderDate DESC")
    List<PurchaseOrder> findBySupplierIdAndOrderDateBetweenOrderByOrderDateDesc(@Param("supplierId") Long supplierId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find by warehouse and date range
    @Query("SELECT po FROM PurchaseOrder po WHERE po.warehouse.id = :warehouseId AND po.orderDate BETWEEN :startDate AND :endDate ORDER BY po.orderDate DESC")
    List<PurchaseOrder> findByWarehouseIdAndOrderDateBetweenOrderByOrderDateDesc(@Param("warehouseId") Long warehouseId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find with pagination
    Page<PurchaseOrder> findAllByOrderByOrderDateDesc(Pageable pageable);
    
    // Find by status with pagination
    Page<PurchaseOrder> findByStatusOrderByOrderDateDesc(PurchaseOrder.OrderStatus status, Pageable pageable);
    
    // Find by supplier with pagination
    Page<PurchaseOrder> findBySupplierIdOrderByOrderDateDesc(Long supplierId, Pageable pageable);
    
    // Find by warehouse with pagination
    Page<PurchaseOrder> findByWarehouseIdOrderByOrderDateDesc(Long warehouseId, Pageable pageable);
    
    // Count by status
    long countByStatus(PurchaseOrder.OrderStatus status);
    
    // Count by supplier
    long countBySupplierId(Long supplierId);
    
    // Count by warehouse
    long countByWarehouseId(Long warehouseId);
    
    // Get total amount by supplier
    @Query("SELECT SUM(po.totalAmount) FROM PurchaseOrder po WHERE po.supplier.id = :supplierId")
    java.math.BigDecimal getTotalAmountBySupplier(@Param("supplierId") Long supplierId);
    
    // Get total amount by warehouse
    @Query("SELECT SUM(po.totalAmount) FROM PurchaseOrder po WHERE po.warehouse.id = :warehouseId")
    java.math.BigDecimal getTotalAmountByWarehouse(@Param("warehouseId") Long warehouseId);
    
    // Get total amount by status
    @Query("SELECT SUM(po.totalAmount) FROM PurchaseOrder po WHERE po.status = :status")
    java.math.BigDecimal getTotalAmountByStatus(@Param("status") PurchaseOrder.OrderStatus status);
    
    // Check if PO number exists
    boolean existsByPoNumber(String poNumber);
    
    // Find orders that need approval (SUBMITTED status)
    List<PurchaseOrder> findByStatusOrderByOrderDateAsc(PurchaseOrder.OrderStatus status);
    
    // Find orders that are ready for receiving (APPROVED status)
    List<PurchaseOrder> findByStatusAndExpectedDeliveryDateLessThanEqualOrderByExpectedDeliveryDateAsc(PurchaseOrder.OrderStatus status, LocalDate date);
    
    // Find orders by supplier and date after (for supplier performance tracking)
    @Query("SELECT po FROM PurchaseOrder po WHERE po.supplier.id = :supplierId AND po.orderDate >= :startDate ORDER BY po.orderDate DESC")
    List<PurchaseOrder> findBySupplierIdAndOrderDateAfter(@Param("supplierId") Long supplierId, @Param("startDate") LocalDate startDate);
} 