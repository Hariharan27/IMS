import api from './api';
import type { 
  InventoryItem, 
  StockAdjustmentData, 
  InventorySummary,
  StockMovement 
} from '../types/inventory';

export interface InventoryResponse {
  success: boolean;
  data: InventoryItem[];
  message: string;
  count: number;
}

export interface InventoryItemResponse {
  success: boolean;
  data: InventoryItem;
  message: string;
}

export interface StockAdjustmentResponse {
  success: boolean;
  data: {
    productId: number;
    warehouseId: number;
    quantityOnHand: number;
    quantityReserved: number;
    quantityAvailable: number;
    lastUpdatedAt: string;
  };
  message: string;
}

export interface StockMovementsResponse {
  success: boolean;
  data: {
    content: StockMovement[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  };
  message: string;
}

class InventoryService {
  // Get inventory summary
  async getInventorySummary(params?: {
    page?: number;
    size?: number;
    productId?: number;
    warehouseId?: number;
    stockStatus?: string;
  }): Promise<InventoryResponse> {
    const response = await api.get('/inventory', { params });
    return response.data;
  }

  // Get inventory by product
  async getInventoryByProduct(productId: number): Promise<InventoryItemResponse> {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  }

  // Update inventory (add/remove stock)
  async updateInventory(data: {
    productId: number;
    warehouseId: number;
    quantityChange: number;
    movementType: 'IN' | 'OUT';
    referenceType: string;
    referenceId?: number;
    notes?: string;
  }): Promise<StockAdjustmentResponse> {
    // Transform the data to match backend DTO
    const stockMovementData = {
      productId: data.productId,
      warehouseId: data.warehouseId,
      movementType: data.movementType,
      quantity: Math.abs(data.quantityChange), // Use absolute value for quantity
      referenceType: data.referenceType as any, // Cast to match backend enum
      referenceId: data.referenceId,
      notes: data.notes,
    };
    
    const response = await api.post('/inventory/movements', stockMovementData);
    
    // The backend returns StockMovementResponse, but frontend expects StockAdjustmentResponse
    // We need to transform the response to match the expected format
    const movementResponse = response.data;
    
    // Create a mock StockAdjustmentResponse since the backend doesn't return inventory data directly
    // The inventory will be updated in the backend, so we can return a success response
    return {
      success: movementResponse.success,
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantityOnHand: 0, // This will be updated when we reload inventory
        quantityReserved: 0, // This will be updated when we reload inventory
        quantityAvailable: 0, // This will be updated when we reload inventory
        lastUpdatedAt: new Date().toISOString(),
      },
      message: movementResponse.message || 'Stock movement created successfully',
    };
  }

  // Get stock movements
  async getStockMovements(params?: {
    page?: number;
    size?: number;
    productId?: number;
    warehouseId?: number;
    movementType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StockMovementsResponse> {
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  }

  // Get inventory summary for dashboard
  async getInventorySummaryForDashboard(): Promise<InventorySummary> {
    const response = await api.get('/inventory/summary');
    return response.data;
  }

  // Get low stock items
  async getLowStockItems(): Promise<InventoryItem[]> {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  }

  // Get out of stock items
  async getOutOfStockItems(): Promise<InventoryItem[]> {
    const response = await api.get('/inventory/out-of-stock');
    return response.data;
  }

  // Get inventory by warehouse
  async getInventoryByWarehouse(warehouseId: number): Promise<InventoryItem[]> {
    const response = await api.get(`/inventory/warehouse/${warehouseId}`);
    return response.data;
  }

  // Get inventory alerts
  async getInventoryAlerts(): Promise<any[]> {
    const response = await api.get('/inventory/alerts');
    return response.data;
  }

  // Create new inventory item
  async createInventory(data: {
    productId: number;
    warehouseId: number;
    quantityOnHand: number;
    quantityReserved: number;
    notes?: string;
  }): Promise<InventoryItemResponse> {
    const response = await api.post('/inventory', data);
    return response.data;
  }
}

export default new InventoryService(); 