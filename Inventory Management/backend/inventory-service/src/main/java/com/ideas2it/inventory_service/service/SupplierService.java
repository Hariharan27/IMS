package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.SupplierRequest;
import com.ideas2it.inventory_service.dto.SupplierResponse;
import com.ideas2it.inventory_service.entity.Supplier;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.repository.SupplierRepository;
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
public class SupplierService {
    
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    
    public List<SupplierResponse> getAllSuppliers() {
        log.info("Fetching all active suppliers");
        List<Supplier> suppliers = supplierRepository.findByIsActiveTrue();
        return suppliers.stream()
                .map(SupplierResponse::fromSupplier)
                .collect(Collectors.toList());
    }
    
    public SupplierResponse getSupplierById(Long id) {
        log.info("Fetching supplier by ID: {}", id);
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));
        
        if (!supplier.getIsActive()) {
            throw new RuntimeException("Supplier is inactive with ID: " + id);
        }
        
        return SupplierResponse.fromSupplier(supplier);
    }
    
    public SupplierResponse getSupplierByCode(String code) {
        log.info("Fetching supplier by code: {}", code);
        Supplier supplier = supplierRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Supplier not found with code: " + code));
        
        return SupplierResponse.fromSupplier(supplier);
    }
    
    public List<SupplierResponse> searchSuppliers(String searchTerm) {
        log.info("Searching suppliers with term: {}", searchTerm);
        List<Supplier> suppliers = supplierRepository.searchByNameOrContactPersonContainingIgnoreCase(searchTerm);
        return suppliers.stream()
                .map(SupplierResponse::fromSupplier)
                .collect(Collectors.toList());
    }
    
    public List<SupplierResponse> getSuppliersByCity(String city) {
        log.info("Fetching suppliers by city: {}", city);
        List<Supplier> suppliers = supplierRepository.findByCityIgnoreCaseAndIsActiveTrue(city);
        return suppliers.stream()
                .map(SupplierResponse::fromSupplier)
                .collect(Collectors.toList());
    }
    
    public List<SupplierResponse> getSuppliersByCountry(String country) {
        log.info("Fetching suppliers by country: {}", country);
        List<Supplier> suppliers = supplierRepository.findByCountryIgnoreCaseAndIsActiveTrue(country);
        return suppliers.stream()
                .map(SupplierResponse::fromSupplier)
                .collect(Collectors.toList());
    }
    
    public List<SupplierResponse> getSuppliersByPaymentTerms(String paymentTerms) {
        log.info("Fetching suppliers by payment terms: {}", paymentTerms);
        List<Supplier> suppliers = supplierRepository.findByPaymentTermsAndIsActiveTrue(paymentTerms);
        return suppliers.stream()
                .map(SupplierResponse::fromSupplier)
                .collect(Collectors.toList());
    }
    
    public SupplierResponse createSupplier(SupplierRequest request, Long currentUserId) {
        log.info("Creating new supplier: {}", request.getName());
        
        // Validate supplier code uniqueness
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Supplier with code '" + request.getCode() + "' already exists");
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        Supplier supplier = new Supplier();
        supplier.setName(request.getName());
        supplier.setCode(request.getCode().toUpperCase()); // Ensure uppercase
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setCountry(request.getCountry());
        supplier.setPostalCode(request.getPostalCode());
        supplier.setTaxId(request.getTaxId());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setIsActive(true);
        supplier.setCreatedBy(currentUser);
        supplier.setUpdatedBy(currentUser);
        
        Supplier savedSupplier = supplierRepository.save(supplier);
        log.info("Supplier created successfully with ID: {}", savedSupplier.getId());
        
        return SupplierResponse.fromSupplier(savedSupplier);
    }
    
    public SupplierResponse updateSupplier(Long id, SupplierRequest request, Long currentUserId) {
        log.info("Updating supplier with ID: {}", id);
        
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));
        
        if (!supplier.getIsActive()) {
            throw new RuntimeException("Cannot update inactive supplier with ID: " + id);
        }
        
        // Validate code uniqueness (excluding current supplier)
        if (!supplier.getCode().equalsIgnoreCase(request.getCode()) &&
                supplierRepository.existsByCodeAndIdNot(request.getCode().toUpperCase(), id)) {
            throw new RuntimeException("Supplier with code '" + request.getCode() + "' already exists");
        }
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        supplier.setName(request.getName());
        supplier.setCode(request.getCode().toUpperCase()); // Ensure uppercase
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setCountry(request.getCountry());
        supplier.setPostalCode(request.getPostalCode());
        supplier.setTaxId(request.getTaxId());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setUpdatedBy(currentUser);
        
        Supplier updatedSupplier = supplierRepository.save(supplier);
        log.info("Supplier updated successfully with ID: {}", updatedSupplier.getId());
        
        return SupplierResponse.fromSupplier(updatedSupplier);
    }
    
    public SupplierResponse updateSupplierStatus(Long id, Boolean isActive, Long currentUserId) {
        log.info("Updating supplier status with ID: {} to active: {}", id, isActive);
        
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        supplier.setIsActive(isActive);
        supplier.setUpdatedBy(currentUser);
        
        Supplier updatedSupplier = supplierRepository.save(supplier);
        log.info("Supplier status updated successfully with ID: {}", updatedSupplier.getId());
        
        return SupplierResponse.fromSupplier(updatedSupplier);
    }
    
    public void deleteSupplier(Long id, Long currentUserId) {
        log.info("Deleting supplier with ID: {}", id);
        
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + id));
        
        // Get current user for audit
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Soft delete
        supplier.setIsActive(false);
        supplier.setUpdatedBy(currentUser);
        supplierRepository.save(supplier);
        
        log.info("Supplier deleted successfully with ID: {}", id);
    }
    
    public long getSupplierCount() {
        return supplierRepository.countByIsActiveTrue();
    }
} 