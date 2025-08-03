package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {
    
    // Find items by purchase order
    List<PurchaseOrderItem> findByPurchaseOrderIdOrderByCreatedAtAsc(Long purchaseOrderId);
    
    // Find items by product
    List<PurchaseOrderItem> findByProductIdOrderByCreatedAtDesc(Long productId);
    
    // Find items by purchase order and product
    List<PurchaseOrderItem> findByPurchaseOrderIdAndProductId(Long purchaseOrderId, Long productId);
    
    // Find items that are not fully received
    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.quantityReceived < poi.quantityOrdered")
    List<PurchaseOrderItem> findItemsNotFullyReceived();
    
    // Find items by purchase order that are not fully received
    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.purchaseOrder.id = :purchaseOrderId AND poi.quantityReceived < poi.quantityOrdered")
    List<PurchaseOrderItem> findItemsNotFullyReceivedByPurchaseOrder(@Param("purchaseOrderId") Long purchaseOrderId);
    
    // Find items by product that are not fully received
    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.product.id = :productId AND poi.quantityReceived < poi.quantityOrdered")
    List<PurchaseOrderItem> findItemsNotFullyReceivedByProduct(@Param("productId") Long productId);
    
    // Count items by purchase order
    long countByPurchaseOrderId(Long purchaseOrderId);
    
    // Count items by product
    long countByProductId(Long productId);
    
    // Get total quantity ordered by product
    @Query("SELECT SUM(poi.quantityOrdered) FROM PurchaseOrderItem poi WHERE poi.product.id = :productId")
    Integer getTotalQuantityOrderedByProduct(@Param("productId") Long productId);
    
    // Get total quantity received by product
    @Query("SELECT SUM(poi.quantityReceived) FROM PurchaseOrderItem poi WHERE poi.product.id = :productId")
    Integer getTotalQuantityReceivedByProduct(@Param("productId") Long productId);
    
    // Get total value by purchase order
    @Query("SELECT SUM(poi.totalPrice) FROM PurchaseOrderItem poi WHERE poi.purchaseOrder.id = :purchaseOrderId")
    java.math.BigDecimal getTotalValueByPurchaseOrder(@Param("purchaseOrderId") Long purchaseOrderId);
    
    // Get total value by product
    @Query("SELECT SUM(poi.totalPrice) FROM PurchaseOrderItem poi WHERE poi.product.id = :productId")
    java.math.BigDecimal getTotalValueByProduct(@Param("productId") Long productId);
    
    // Find items with specific quantity range
    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.quantityOrdered BETWEEN :minQuantity AND :maxQuantity")
    List<PurchaseOrderItem> findItemsByQuantityRange(@Param("minQuantity") Integer minQuantity, @Param("maxQuantity") Integer maxQuantity);
    
    // Find items by unit price range
    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.unitPrice BETWEEN :minPrice AND :maxPrice")
    List<PurchaseOrderItem> findItemsByUnitPriceRange(@Param("minPrice") java.math.BigDecimal minPrice, @Param("maxPrice") java.math.BigDecimal maxPrice);
    
    // Find items that are overdue (expected delivery date passed but not fully received)
    @Query("SELECT poi FROM PurchaseOrderItem poi JOIN poi.purchaseOrder po WHERE po.expectedDeliveryDate < CURRENT_DATE AND poi.quantityReceived < poi.quantityOrdered")
    List<PurchaseOrderItem> findOverdueItems();
} 