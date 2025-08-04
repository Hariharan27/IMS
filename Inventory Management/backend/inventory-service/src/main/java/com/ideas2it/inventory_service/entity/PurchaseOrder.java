package com.ideas2it.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "po_number", nullable = false, unique = true, length = 50)
    private String poNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;
    
    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;
    
    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status = OrderStatus.DRAFT;
    
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
    
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PurchaseOrderItem> items = new ArrayList<>();
    
    public enum OrderStatus {
        DRAFT, SUBMITTED, APPROVED, ORDERED, PARTIALLY_RECEIVED, FULLY_RECEIVED, CANCELLED, CLOSED
    }
    
    // Helper methods
    public void addItem(PurchaseOrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }
    
    public void removeItem(PurchaseOrderItem item) {
        items.remove(item);
        item.setPurchaseOrder(null);
    }
    
    public void calculateTotalAmount() {
        this.totalAmount = items.stream()
                .map(PurchaseOrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public boolean canTransitionTo(OrderStatus newStatus) {
        switch (this.status) {
            case DRAFT:
                return newStatus == OrderStatus.SUBMITTED || newStatus == OrderStatus.CANCELLED;
            case SUBMITTED:
                return newStatus == OrderStatus.APPROVED || newStatus == OrderStatus.CANCELLED;
            case APPROVED:
                return newStatus == OrderStatus.ORDERED || newStatus == OrderStatus.CANCELLED;
            case ORDERED:
                return newStatus == OrderStatus.PARTIALLY_RECEIVED || newStatus == OrderStatus.FULLY_RECEIVED || newStatus == OrderStatus.CANCELLED;
            case PARTIALLY_RECEIVED:
                return newStatus == OrderStatus.FULLY_RECEIVED || newStatus == OrderStatus.CANCELLED;
            case FULLY_RECEIVED:
                return newStatus == OrderStatus.CLOSED;
            case CANCELLED:
            case CLOSED:
                return false; // Terminal states
            default:
                return false;
        }
    }
} 