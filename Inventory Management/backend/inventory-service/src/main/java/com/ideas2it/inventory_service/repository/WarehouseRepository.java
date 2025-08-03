package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    
    Optional<Warehouse> findByCode(String code);
    
    Optional<Warehouse> findByCodeAndIsActiveTrue(String code);
    
    List<Warehouse> findByIsActiveTrue();
    
    List<Warehouse> findByManagerId(Long managerId);
    
    List<Warehouse> findByManagerIdAndIsActiveTrue(Long managerId);
    
    @Query("SELECT w FROM Warehouse w WHERE w.isActive = true AND " +
           "(LOWER(w.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.code) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Warehouse> searchActiveWarehouses(@Param("search") String search);
    
    boolean existsByCode(String code);
    
    boolean existsByCodeAndIdNot(String code, Long id);
    
    @Query("SELECT COUNT(w) FROM Warehouse w WHERE w.isActive = true")
    long countActiveWarehouses();
} 