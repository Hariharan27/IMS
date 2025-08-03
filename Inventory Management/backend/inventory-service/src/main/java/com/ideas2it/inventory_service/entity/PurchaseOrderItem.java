package com.ideas2it.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(name = "quantity_ordered", nullable = false)
    private Integer quantityOrdered;
    
    @Column(name = "quantity_received", nullable = false)
    private Integer quantityReceived = 0;
    
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public void calculateTotalPrice() {
        this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantityOrdered));
    }
    
    public Integer getRemainingQuantity() {
        return this.quantityOrdered - this.quantityReceived;
    }
    
    public boolean isFullyReceived() {
        return this.quantityReceived >= this.quantityOrdered;
    }
    
    public boolean isPartiallyReceived() {
        return this.quantityReceived > 0 && this.quantityReceived < this.quantityOrdered;
    }
    
    public boolean canReceiveQuantity(Integer quantityToReceive) {
        return this.quantityReceived + quantityToReceive <= this.quantityOrdered;
    }
    
    public void receiveQuantity(Integer quantityToReceive) {
        if (canReceiveQuantity(quantityToReceive)) {
            this.quantityReceived += quantityToReceive;
        } else {
            throw new IllegalArgumentException("Cannot receive more than ordered quantity");
        }
    }
} 