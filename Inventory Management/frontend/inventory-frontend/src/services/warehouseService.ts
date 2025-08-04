import api from './api';

// Types
export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  managerId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseCreateRequest {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  managerId?: number;
  isActive: boolean;
}

export interface WarehouseUpdateRequest extends Partial<WarehouseCreateRequest> {}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  count?: number;
}

// Warehouse Service
class WarehouseService {
  // Get all warehouses
  async getWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    const response = await api.get('/warehouses');
    return response.data;
  }

  // Get active warehouses only
  async getActiveWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    const response = await api.get('/warehouses?isActive=true');
    return response.data;
  }

  // Get warehouse by ID
  async getWarehouseById(id: number): Promise<ApiResponse<Warehouse>> {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  }

  // Create new warehouse
  async createWarehouse(data: WarehouseCreateRequest): Promise<ApiResponse<Warehouse>> {
    const response = await api.post('/warehouses', data);
    return response.data;
  }

  // Update warehouse
  async updateWarehouse(id: number, data: WarehouseUpdateRequest): Promise<ApiResponse<Warehouse>> {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
  }

  // Delete warehouse (soft delete)
  async deleteWarehouse(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  }

  // Get warehouse count
  async getWarehouseCount(): Promise<ApiResponse<number>> {
    const response = await api.get('/warehouses/count');
    return response.data;
  }
}

export default new WarehouseService(); 