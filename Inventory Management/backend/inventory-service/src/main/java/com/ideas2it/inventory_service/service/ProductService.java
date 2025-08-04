package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.ProductRequest;
import com.ideas2it.inventory_service.dto.ProductResponse;
import com.ideas2it.inventory_service.dto.PurchaseOrderRequest;
import com.ideas2it.inventory_service.entity.Category;
import com.ideas2it.inventory_service.entity.Product;
import com.ideas2it.inventory_service.entity.Supplier;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.entity.Warehouse;
import com.ideas2it.inventory_service.entity.Inventory;
import com.ideas2it.inventory_service.repository.CategoryRepository;
import com.ideas2it.inventory_service.repository.ProductRepository;
import com.ideas2it.inventory_service.repository.SupplierRepository;
import com.ideas2it.inventory_service.repository.UserRepository;
import com.ideas2it.inventory_service.repository.WarehouseRepository;
import com.ideas2it.inventory_service.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final PurchaseOrderService purchaseOrderService;
    
    public List<ProductResponse> getAllProducts() {
        log.info("Fetching all active products");
        List<Product> products = productRepository.findByIsActiveTrue();
        return products.stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }
    
    public ProductResponse getProductById(Long id) {
        log.info("Fetching product by ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Product is inactive with ID: " + id);
        }
        
        return ProductResponse.fromProduct(product);
    }
    
    public ProductResponse getProductBySku(String sku) {
        log.info("Fetching product by SKU: {}", sku);
        Product product = productRepository.findBySkuAndIsActiveTrue(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        
        return ProductResponse.fromProduct(product);
    }
    
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        log.info("Fetching products by category ID: {}", categoryId);
        
        // Verify category exists and is active
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        
        if (!category.getIsActive()) {
            throw new RuntimeException("Category is inactive with ID: " + categoryId);
        }
        
        List<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
        return products.stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }
    

    
    public List<ProductResponse> searchProducts(String searchTerm) {
        log.info("Searching products with term: {}", searchTerm);
        List<Product> products = productRepository.searchByNameOrDescriptionContainingIgnoreCase(searchTerm);
        return products.stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }
    
    public List<ProductResponse> getProductsByPriceRange(Double minPrice, Double maxPrice) {
        log.info("Fetching products by price range: {} - {}", minPrice, maxPrice);
        List<Product> products = productRepository.findBySellingPriceBetweenAndIsActiveTrue(minPrice, maxPrice);
        return products.stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }
    
    public ProductResponse createProduct(ProductRequest request, Long currentUserId) {
        log.info("Creating new product: {}", request.getName());
        
        // Validate SKU uniqueness
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Product with SKU '" + request.getSku() + "' already exists");
        }
        
        // Validate category if provided
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
            
            if (!category.getIsActive()) {
                throw new RuntimeException("Category is inactive with ID: " + request.getCategoryId());
            }
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setSku(request.getSku().toUpperCase()); // Ensure uppercase
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setModel(request.getModel());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setUnitOfMeasure(request.getUnitOfMeasure() != null ? request.getUnitOfMeasure() : "PCS");
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setReorderPoint(request.getReorderPoint() != null ? request.getReorderPoint() : 0);
        product.setReorderQuantity(request.getReorderQuantity() != null ? request.getReorderQuantity() : 0);
        product.setIsActive(true);
        product.setCreatedBy(currentUser);
        product.setUpdatedBy(currentUser);
        
        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getId());
        
        // Automatically create inventory records for all active warehouses
        createInventoryForAllWarehouses(savedProduct, currentUser);
        
        // Automatically generate purchase order for new product
        generateInitialPurchaseOrder(savedProduct, currentUser);
        
        return ProductResponse.fromProduct(savedProduct);
    }
    
    public ProductResponse updateProduct(Long id, ProductRequest request, Long currentUserId) {
        log.info("Updating product with ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        if (!product.getIsActive()) {
            throw new RuntimeException("Cannot update inactive product with ID: " + id);
        }
        
        // Validate SKU uniqueness (excluding current product)
        if (!product.getSku().equalsIgnoreCase(request.getSku()) &&
                productRepository.existsBySkuAndIdNot(request.getSku().toUpperCase(), id)) {
            throw new RuntimeException("Product with SKU '" + request.getSku() + "' already exists");
        }
        

        
        // Validate category if provided
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
            
            if (!category.getIsActive()) {
                throw new RuntimeException("Category is inactive with ID: " + request.getCategoryId());
            }
        }
        

        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setSku(request.getSku().toUpperCase()); // Ensure uppercase
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setModel(request.getModel());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setUnitOfMeasure(request.getUnitOfMeasure() != null ? request.getUnitOfMeasure() : "PCS");
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setReorderPoint(request.getReorderPoint() != null ? request.getReorderPoint() : 0);
        product.setReorderQuantity(request.getReorderQuantity() != null ? request.getReorderQuantity() : 0);
        product.setUpdatedBy(currentUser);
        
        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully with ID: {}", updatedProduct.getId());
        
        return ProductResponse.fromProduct(updatedProduct);
    }
    
    public ProductResponse updateProductStatus(Long id, Boolean isActive, Long currentUserId) {
        log.info("Updating product status with ID: {} to active: {}", id, isActive);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        product.setIsActive(isActive);
        product.setUpdatedBy(currentUser);
        
        Product updatedProduct = productRepository.save(product);
        log.info("Product status updated successfully with ID: {}", updatedProduct.getId());
        
        return ProductResponse.fromProduct(updatedProduct);
    }
    
    public void deleteProduct(Long id, Long currentUserId) {
        log.info("Deleting product with ID: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Soft delete
        product.setIsActive(false);
        product.setUpdatedBy(currentUser);
        productRepository.save(product);
        
        log.info("Product deleted successfully with ID: {}", id);
    }
    
    public long getProductCount() {
        return productRepository.countByIsActiveTrue();
    }
    
    public long getProductCountByCategory(Long categoryId) {
        return productRepository.countByCategoryIdAndIsActiveTrue(categoryId);
    }
    
    public void deleteAllProducts() {
        log.info("Deleting all products");
        try {
            // First delete all inventory records
            inventoryRepository.deleteAll();
            log.info("Deleted all inventory records");
            
            // Then delete all products
            productRepository.deleteAll();
            log.info("Deleted all products");
        } catch (Exception e) {
            log.error("Error deleting all products: {}", e.getMessage());
            throw new RuntimeException("Failed to delete all products: " + e.getMessage());
        }
    }
    
    /**
     * Automatically create inventory records for all active warehouses when a product is created
     */
    private void createInventoryForAllWarehouses(Product product, User currentUser) {
        log.info("Creating inventory records for product '{}' in all active warehouses", product.getName());
        
        // Get all active warehouses
        List<Warehouse> activeWarehouses = warehouseRepository.findByIsActiveTrue();
        
        if (activeWarehouses.isEmpty()) {
            log.warn("No active warehouses found. Cannot create inventory records for product: {}", product.getName());
            return;
        }
        
        // Create inventory records for each warehouse
        for (Warehouse warehouse : activeWarehouses) {
            try {
                // Check if inventory already exists for this product-warehouse combination
                Optional<Inventory> existingInventory = inventoryRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId());
                if (existingInventory.isEmpty()) {
                    Inventory inventory = new Inventory();
                    inventory.setProduct(product);
                    inventory.setWarehouse(warehouse);
                    inventory.setQuantityOnHand(0);
                    inventory.setQuantityReserved(0);
                    inventory.setQuantityAvailable(0);
                    inventory.setUpdatedBy(currentUser);
                    
                    log.info("=== CREATING INVENTORY DEBUG ===");
                    log.info("Creating inventory for product '{}' in warehouse '{}' with quantity: {}", 
                            product.getName(), warehouse.getName(), inventory.getQuantityOnHand());
                    
                    Inventory savedInventory = inventoryRepository.save(inventory);
                    log.info("Created inventory record for product '{}' in warehouse '{}' with ID: {} and quantity: {}", 
                            product.getName(), warehouse.getName(), savedInventory.getId(), savedInventory.getQuantityOnHand());
                } else {
                    log.info("Inventory record already exists for product '{}' in warehouse '{}'", 
                            product.getName(), warehouse.getName());
                }
            } catch (Exception e) {
                log.error("Error creating inventory record for product '{}' in warehouse '{}': {}", 
                        product.getName(), warehouse.getName(), e.getMessage());
                // Continue with other warehouses even if one fails
            }
        }
        
        log.info("Completed inventory creation for product '{}' across {} warehouses", 
                product.getName(), activeWarehouses.size());
    }
    
    /**
     * Automatically generate initial purchase order for new product
     */
    private void generateInitialPurchaseOrder(Product product, User currentUser) {
        log.info("Generating initial purchase order for new product: {}", product.getName());
        
        try {
            // Find best supplier for this product
            List<Supplier> activeSuppliers = supplierRepository.findByIsActiveTrue();
            if (activeSuppliers.isEmpty()) {
                log.warn("No active suppliers found. Cannot generate initial PO for product: {}", product.getName());
                return;
            }
            
            Supplier bestSupplier = activeSuppliers.get(0); // For now, use first supplier
            
            // Get all active warehouses
            List<Warehouse> activeWarehouses = warehouseRepository.findByIsActiveTrue();
            if (activeWarehouses.isEmpty()) {
                log.warn("No active warehouses found. Cannot generate initial PO for product: {}", product.getName());
                return;
            }
            
            // Create initial PO for each warehouse
            for (Warehouse warehouse : activeWarehouses) {
                try {
                    // Calculate initial order quantity
                    int initialQuantity = product.getReorderQuantity() != null ? product.getReorderQuantity() : 10;
                    
                    // Create PO request
                    PurchaseOrderRequest poRequest = new PurchaseOrderRequest();
                    poRequest.setSupplierId(bestSupplier.getId());
                    poRequest.setWarehouseId(warehouse.getId());
                    poRequest.setOrderDate(java.time.LocalDate.now());
                    poRequest.setExpectedDeliveryDate(java.time.LocalDate.now().plusDays(7));
                    poRequest.setNotes("Initial stock order for new product: " + product.getName());
                    
                    // Create PO item
                    PurchaseOrderRequest.PurchaseOrderItemRequest itemRequest = new PurchaseOrderRequest.PurchaseOrderItemRequest();
                    itemRequest.setProductId(product.getId());
                    itemRequest.setQuantityOrdered(initialQuantity);
                    itemRequest.setUnitPrice(product.getCostPrice() != null ? product.getCostPrice() : java.math.BigDecimal.ZERO);
                    itemRequest.setNotes("Initial stock for new product");
                    
                    poRequest.setItems(java.util.Arrays.asList(itemRequest));
                    
                    // Create the PO using PurchaseOrderService
                    purchaseOrderService.createPurchaseOrder(poRequest, currentUser.getId());
                    
                    log.info("Generated initial PO for product '{}' in warehouse '{}': {} units", 
                            product.getName(), warehouse.getName(), initialQuantity);
                            
                } catch (Exception e) {
                    log.error("Error generating initial PO for product '{}' in warehouse '{}': {}", 
                            product.getName(), warehouse.getName(), e.getMessage());
                }
            }
            
            log.info("Completed initial PO generation for product '{}' across {} warehouses", 
                    product.getName(), activeWarehouses.size());
                    
        } catch (Exception e) {
            log.error("Error in generateInitialPurchaseOrder for product '{}': {}", 
                    product.getName(), e.getMessage());
        }
    }
} 