package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    // Find supplier by code
    Optional<Supplier> findByCodeAndIsActiveTrue(String code);
    
    // Find all active suppliers
    List<Supplier> findByIsActiveTrue();
    
    // Check if supplier exists by code
    boolean existsByCode(String code);
    
    // Check if supplier exists by code excluding current ID (for updates)
    boolean existsByCodeAndIdNot(String code, Long id);
    
    // Search suppliers by name containing (case-insensitive)
    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND s.isActive = true")
    List<Supplier> searchByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Search suppliers by contact person containing (case-insensitive)
    @Query("SELECT s FROM Supplier s WHERE LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND s.isActive = true")
    List<Supplier> searchByContactPersonContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Search suppliers by name or contact person (case-insensitive)
    @Query("SELECT s FROM Supplier s WHERE (LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND s.isActive = true")
    List<Supplier> searchByNameOrContactPersonContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Find suppliers by city
    List<Supplier> findByCityIgnoreCaseAndIsActiveTrue(String city);
    
    // Find suppliers by country
    List<Supplier> findByCountryIgnoreCaseAndIsActiveTrue(String country);
    
    // Count active suppliers
    long countByIsActiveTrue();
    
    // Find suppliers by payment terms
    List<Supplier> findByPaymentTermsAndIsActiveTrue(String paymentTerms);
} 