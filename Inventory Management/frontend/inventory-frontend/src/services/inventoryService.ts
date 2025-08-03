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
    const response = await api.post('/inventory/update', data);
    return response.data;
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
}

export default new InventoryService(); 