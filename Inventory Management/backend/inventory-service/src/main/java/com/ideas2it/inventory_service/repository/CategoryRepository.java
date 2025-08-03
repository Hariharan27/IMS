package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find root categories (no parent)
    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.isActive = true")
    List<Category> findRootCategories();
    
    // Find child categories by parent ID
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId AND c.isActive = true")
    List<Category> findChildrenByParentId(@Param("parentId") Long parentId);
    
    // Find all active categories
    List<Category> findByIsActiveTrue();
    
    // Find category by name (case-insensitive)
    Optional<Category> findByNameIgnoreCaseAndIsActiveTrue(String name);
    
    // Check if category exists by name
    boolean existsByNameIgnoreCase(String name);
    
    // Check if category exists by name excluding current ID (for updates)
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    
    // Search categories by name containing (case-insensitive)
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND c.isActive = true")
    List<Category> searchByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Find categories by parent ID
    List<Category> findByParentIdAndIsActiveTrue(Long parentId);
    
    // Count active categories
    long countByIsActiveTrue();
    
    // Count root categories
    @Query("SELECT COUNT(c) FROM Category c WHERE c.parent IS NULL AND c.isActive = true")
    long countRootCategories();
    
    // Find all descendants of a category (simplified - will be handled in service layer)
    @Query("SELECT c FROM Category c WHERE c.parent.id = :categoryId AND c.isActive = true")
    List<Category> findDirectChildren(@Param("categoryId") Long categoryId);
    
    // Check if category has children
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.parent.id = :categoryId AND c.isActive = true")
    boolean hasActiveChildren(@Param("categoryId") Long categoryId);
} 