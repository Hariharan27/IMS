package com.ideas2it.inventory_service.service;

import com.ideas2it.inventory_service.dto.WarehouseRequest;
import com.ideas2it.inventory_service.dto.WarehouseResponse;
import com.ideas2it.inventory_service.entity.User;
import com.ideas2it.inventory_service.entity.Warehouse;
import com.ideas2it.inventory_service.repository.UserRepository;
import com.ideas2it.inventory_service.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WarehouseService {
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findByIsActiveTrue()
                .stream()
                .map(WarehouseResponse::fromWarehouse)
                .collect(Collectors.toList());
    }
    
    public WarehouseResponse getWarehouseById(Long id) {
        Optional<Warehouse> warehouseOpt = warehouseRepository.findById(id);
        if (warehouseOpt.isEmpty() || !warehouseOpt.get().getIsActive()) {
            throw new RuntimeException("Warehouse not found");
        }
        return WarehouseResponse.fromWarehouse(warehouseOpt.get());
    }
    
    public WarehouseResponse getWarehouseByCode(String code) {
        Optional<Warehouse> warehouseOpt = warehouseRepository.findByCodeAndIsActiveTrue(code);
        if (warehouseOpt.isEmpty()) {
            throw new RuntimeException("Warehouse not found");
        }
        return WarehouseResponse.fromWarehouse(warehouseOpt.get());
    }
    
    public WarehouseResponse createWarehouse(WarehouseRequest request, Long currentUserId) {
        // Check if warehouse code already exists
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Warehouse code already exists");
        }
        
        // Validate manager if provided
        User manager = null;
        if (request.getManagerId() != null) {
            Optional<User> managerOpt = userRepository.findById(request.getManagerId());
            if (managerOpt.isEmpty()) {
                throw new RuntimeException("Manager not found");
            }
            manager = managerOpt.get();
        }
        
        // Get current user for audit
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        if (currentUserOpt.isEmpty()) {
            throw new RuntimeException("Current user not found");
        }
        
        Warehouse warehouse = new Warehouse();
        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode().toUpperCase());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setCountry(request.getCountry());
        warehouse.setPostalCode(request.getPostalCode());
        warehouse.setPhone(request.getPhone());
        warehouse.setEmail(request.getEmail());
        warehouse.setManager(manager);
        warehouse.setIsActive(true);
        warehouse.setCreatedBy(currentUserOpt.get());
        warehouse.setUpdatedBy(currentUserOpt.get());
        
        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        return WarehouseResponse.fromWarehouse(savedWarehouse);
    }
    
    public WarehouseResponse updateWarehouse(Long id, WarehouseRequest request, Long currentUserId) {
        Optional<Warehouse> warehouseOpt = warehouseRepository.findById(id);
        if (warehouseOpt.isEmpty() || !warehouseOpt.get().getIsActive()) {
            throw new RuntimeException("Warehouse not found");
        }
        
        Warehouse warehouse = warehouseOpt.get();
        
        // Check if code is being changed and if it already exists
        if (!warehouse.getCode().equals(request.getCode()) && 
            warehouseRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new RuntimeException("Warehouse code already exists");
        }
        
        // Validate manager if provided
        User manager = null;
        if (request.getManagerId() != null) {
            Optional<User> managerOpt = userRepository.findById(request.getManagerId());
            if (managerOpt.isEmpty()) {
                throw new RuntimeException("Manager not found");
            }
            manager = managerOpt.get();
        }
        
        // Get current user for audit
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        if (currentUserOpt.isEmpty()) {
            throw new RuntimeException("Current user not found");
        }
        
        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode().toUpperCase());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setCountry(request.getCountry());
        warehouse.setPostalCode(request.getPostalCode());
        warehouse.setPhone(request.getPhone());
        warehouse.setEmail(request.getEmail());
        warehouse.setManager(manager);
        warehouse.setUpdatedBy(currentUserOpt.get());
        
        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        return WarehouseResponse.fromWarehouse(savedWarehouse);
    }
    
    public WarehouseResponse updateWarehouseStatus(Long id, boolean isActive, Long currentUserId) {
        Optional<Warehouse> warehouseOpt = warehouseRepository.findById(id);
        if (warehouseOpt.isEmpty()) {
            throw new RuntimeException("Warehouse not found");
        }
        
        // Get current user for audit
        Optional<User> currentUserOpt = userRepository.findById(currentUserId);
        if (currentUserOpt.isEmpty()) {
            throw new RuntimeException("Current user not found");
        }
        
        Warehouse warehouse = warehouseOpt.get();
        warehouse.setIsActive(isActive);
        warehouse.setUpdatedBy(currentUserOpt.get());
        
        Warehouse savedWarehouse = warehouseRepository.save(warehouse);
        return WarehouseResponse.fromWarehouse(savedWarehouse);
    }
    
    public List<WarehouseResponse> searchWarehouses(String searchTerm) {
        return warehouseRepository.searchActiveWarehouses(searchTerm)
                .stream()
                .map(WarehouseResponse::fromWarehouse)
                .collect(Collectors.toList());
    }
    
    public long getActiveWarehouseCount() {
        return warehouseRepository.countActiveWarehouses();
    }
} 