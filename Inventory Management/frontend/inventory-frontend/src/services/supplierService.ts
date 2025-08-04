import api from './api';
import type { Supplier } from '../types/purchaseOrder';
import type { SupplierCreateRequest, SupplierUpdateRequest, ApiResponse } from '../types/supplier';

class SupplierService {
  // Get all suppliers
  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    const response = await api.get('/suppliers');
    return response.data;
  }

  // Get active suppliers only
  async getActiveSuppliers(): Promise<ApiResponse<Supplier[]>> {
    const response = await api.get('/suppliers?isActive=true');
    return response.data;
  }

  // Get supplier by ID
  async getSupplierById(id: number): Promise<ApiResponse<Supplier>> {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  }

  // Create new supplier
  async createSupplier(data: SupplierCreateRequest): Promise<ApiResponse<Supplier>> {
    const response = await api.post('/suppliers', data);
    return response.data;
  }

  // Update supplier
  async updateSupplier(id: number, data: SupplierUpdateRequest): Promise<ApiResponse<Supplier>> {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  }

  // Delete supplier (soft delete)
  async deleteSupplier(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }

  // Get supplier count
  async getSupplierCount(): Promise<ApiResponse<number>> {
    const response = await api.get('/suppliers/count');
    return response.data;
  }
}

export default new SupplierService(); 