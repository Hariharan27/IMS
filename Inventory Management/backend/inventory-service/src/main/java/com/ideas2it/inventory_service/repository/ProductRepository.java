package com.ideas2it.inventory_service.repository;

import com.ideas2it.inventory_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find product by SKU
    Optional<Product> findBySkuAndIsActiveTrue(String sku);
    
    // Find all active products
    List<Product> findByIsActiveTrue();
    
    // Check if product exists by SKU
    boolean existsBySku(String sku);
    
    // Check if product exists by SKU excluding current ID (for updates)
    boolean existsBySkuAndIdNot(String sku, Long id);
    
    // Find products by category
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    // Search products by name containing (case-insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND p.isActive = true")
    List<Product> searchByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Search products by description containing (case-insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND p.isActive = true")
    List<Product> searchByDescriptionContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Search products by name or description (case-insensitive)
    @Query("SELECT p FROM Product p WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND p.isActive = true")
    List<Product> searchByNameOrDescriptionContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    // Find products by price range
    @Query("SELECT p FROM Product p WHERE p.sellingPrice BETWEEN :minPrice AND :maxPrice AND p.isActive = true")
    List<Product> findBySellingPriceBetweenAndIsActiveTrue(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    
    // Find products above minimum price
    @Query("SELECT p FROM Product p WHERE p.sellingPrice >= :minPrice AND p.isActive = true")
    List<Product> findBySellingPriceGreaterThanEqualAndIsActiveTrue(@Param("minPrice") Double minPrice);
    
    // Find products below maximum price
    @Query("SELECT p FROM Product p WHERE p.sellingPrice <= :maxPrice AND p.isActive = true")
    List<Product> findBySellingPriceLessThanEqualAndIsActiveTrue(@Param("maxPrice") Double maxPrice);
    
    // Count active products
    long countByIsActiveTrue();
    
    // Count products by category
    long countByCategoryIdAndIsActiveTrue(Long categoryId);
    
    
 
} 