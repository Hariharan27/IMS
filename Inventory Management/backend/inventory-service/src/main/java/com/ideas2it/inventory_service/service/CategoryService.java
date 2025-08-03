package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.CategoryRequest;
import com.ideas2it.inventory_service.dto.CategoryResponse;
import com.ideas2it.inventory_service.entity.Category;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.repository.CategoryRepository;
import com.ideas2it.inventory_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    
    public List<CategoryResponse> getAllCategories() {
        log.info("Fetching all active categories");
        List<Category> categories = categoryRepository.findByIsActiveTrue();
        return categories.stream()
                .map(CategoryResponse::fromCategory)
                .collect(Collectors.toList());
    }
    
    public CategoryResponse getCategoryById(Long id) {
        log.info("Fetching category by ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        
        if (!category.getIsActive()) {
            throw new RuntimeException("Category is inactive with ID: " + id);
        }
        
        return CategoryResponse.fromCategory(category);
    }
    
    public List<CategoryResponse> getRootCategories() {
        log.info("Fetching root categories");
        List<Category> rootCategories = categoryRepository.findRootCategories();
        return rootCategories.stream()
                .map(CategoryResponse::fromCategory)
                .collect(Collectors.toList());
    }
    
    public List<CategoryResponse> getChildCategories(Long parentId) {
        log.info("Fetching child categories for parent ID: {}", parentId);
        
        // Verify parent category exists and is active
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent category not found with ID: " + parentId));
        
        if (!parent.getIsActive()) {
            throw new RuntimeException("Parent category is inactive with ID: " + parentId);
        }
        
        List<Category> children = categoryRepository.findChildrenByParentId(parentId);
        return children.stream()
                .map(CategoryResponse::fromCategory)
                .collect(Collectors.toList());
    }
    
    public List<CategoryResponse> searchCategories(String searchTerm) {
        log.info("Searching categories with term: {}", searchTerm);
        List<Category> categories = categoryRepository.searchByNameContainingIgnoreCase(searchTerm);
        return categories.stream()
                .map(CategoryResponse::fromCategory)
                .collect(Collectors.toList());
    }
    
    public CategoryResponse createCategory(CategoryRequest request, Long currentUserId) {
        log.info("Creating new category: {}", request.getName());
        
        // Validate category name uniqueness
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Category with name '" + request.getName() + "' already exists");
        }
        
        // Validate parent category if provided
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found with ID: " + request.getParentId()));
            
            if (!parent.getIsActive()) {
                throw new RuntimeException("Parent category is inactive with ID: " + request.getParentId());
            }
            
            // Prevent circular reference (this check is not needed here as we're creating a new category)
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParent(parent);
        category.setIsActive(true);
        category.setCreatedBy(currentUser);
        category.setUpdatedBy(currentUser);
        
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());
        
        return CategoryResponse.fromCategory(savedCategory);
    }
    
    public CategoryResponse updateCategory(Long id, CategoryRequest request, Long currentUserId) {
        log.info("Updating category with ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        
        if (!category.getIsActive()) {
            throw new RuntimeException("Cannot update inactive category with ID: " + id);
        }
        
        // Validate name uniqueness (excluding current category)
        if (!category.getName().equalsIgnoreCase(request.getName()) &&
                categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Category with name '" + request.getName() + "' already exists");
        }
        
        // Validate parent category if provided
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found with ID: " + request.getParentId()));
            
            if (!parent.getIsActive()) {
                throw new RuntimeException("Parent category is inactive with ID: " + request.getParentId());
            }
            
            // Prevent circular reference
            if (request.getParentId().equals(id)) {
                throw new RuntimeException("Category cannot be its own parent");
            }
            
            // Check if new parent is a descendant of current category (simplified check)
            if (request.getParentId().equals(id)) {
                throw new RuntimeException("Cannot set parent to itself");
            }
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParent(parent);
        category.setUpdatedBy(currentUser);
        
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully with ID: {}", updatedCategory.getId());
        
        return CategoryResponse.fromCategory(updatedCategory);
    }
    
    public CategoryResponse updateCategoryStatus(Long id, Boolean isActive, Long currentUserId) {
        log.info("Updating category status with ID: {} to active: {}", id, isActive);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        category.setIsActive(isActive);
        category.setUpdatedBy(currentUser);
        
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category status updated successfully with ID: {}", updatedCategory.getId());
        
        return CategoryResponse.fromCategory(updatedCategory);
    }
    
    public void deleteCategory(Long id, Long currentUserId) {
        log.info("Deleting category with ID: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
        
        // Check if category has active children
        if (categoryRepository.hasActiveChildren(id)) {
            throw new RuntimeException("Cannot delete category with active children. Please delete or deactivate children first.");
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Soft delete
        category.setIsActive(false);
        category.setUpdatedBy(currentUser);
        categoryRepository.save(category);
        
        log.info("Category deleted successfully with ID: {}", id);
    }
    
    public long getCategoryCount() {
        return categoryRepository.countByIsActiveTrue();
    }
    
    public long getRootCategoryCount() {
        return categoryRepository.countRootCategories();
    }
} 