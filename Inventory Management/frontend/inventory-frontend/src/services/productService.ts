import api from './api';

// Types
export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: {
    id: number;
    name: string;
    description?: string;
  };
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: string;
  unitOfMeasure: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface ProductFilters {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductCreateRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: string;
  unitOfMeasure: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {}

export interface ProductListResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  count?: number;
}

// Product Service
class ProductService {
  // Get all products with pagination and filtering
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<ProductListResponse | Product[]>> {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  }

  // Get product by ID
  async getProductById(id: number): Promise<ApiResponse<Product>> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  // Create new product
  async createProduct(data: ProductCreateRequest): Promise<ApiResponse<Product>> {
    const response = await api.post('/products', data);
    return response.data;
  }

  // Update product
  async updateProduct(id: number, data: ProductUpdateRequest): Promise<ApiResponse<Product>> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  }

  // Delete product (soft delete)
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  // Get all categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories');
    return response.data;
  }

  // Get active categories only
  async getActiveCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories?isActive=true');
    return response.data;
  }

  // Search products
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    const response = await api.get(`/products?search=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Get products by category
  async getProductsByCategory(categoryId: number): Promise<ApiResponse<Product[]>> {
    const response = await api.get(`/products?categoryId=${categoryId}`);
    return response.data;
  }

  // Get low stock products
  async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/products?stockStatus=LOW_STOCK');
    return response.data;
  }

  // Get out of stock products
  async getOutOfStockProducts(): Promise<ApiResponse<Product[]>> {
    const response = await api.get('/products?stockStatus=OUT_OF_STOCK');
    return response.data;
  }

  // Bulk operations (future implementation)
  async bulkUpdateProducts(updates: Array<{ id: number; data: ProductUpdateRequest }>): Promise<ApiResponse<Product[]>> {
    const response = await api.put('/products/bulk', { updates });
    return response.data;
  }

  async bulkDeleteProducts(ids: number[]): Promise<ApiResponse<void>> {
    const response = await api.delete('/products/bulk', { data: { ids } });
    return response.data;
  }

  // Export products
  async exportProducts(filters: ProductFilters = {}, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    params.append('format', format);

    const response = await api.get(`/products/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  }

  // Import products
  async importProducts(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}

export default new ProductService(); 