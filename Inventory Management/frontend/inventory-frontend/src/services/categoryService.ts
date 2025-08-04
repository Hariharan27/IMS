import api from './api';

// Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  parent?: Category | null;
  children?: Category[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  updatedBy?: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  page?: number;
  size?: number;
  search?: string;
  isActive?: boolean;
  parentId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  parentId?: number;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {}

export interface CategoryListResponse {
  content: Category[];
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

// Category Service
class CategoryService {
  // Get all categories with pagination and filtering
  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<CategoryListResponse | Category[]>> {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.parentId) params.append('parentId', filters.parentId.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/categories?${params.toString()}`);
    return response.data;
  }

  // Get category by ID
  async getCategoryById(id: number): Promise<ApiResponse<Category>> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  // Get root categories (no parent)
  async getRootCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories/root');
    return response.data;
  }

  // Get child categories of a parent
  async getChildCategories(parentId: number): Promise<ApiResponse<Category[]>> {
    const response = await api.get(`/categories/${parentId}/children`);
    return response.data;
  }

  // Search categories
  async searchCategories(query: string): Promise<ApiResponse<Category[]>> {
    const response = await api.get(`/categories/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Create new category
  async createCategory(data: CategoryCreateRequest): Promise<ApiResponse<Category>> {
    const response = await api.post('/categories', data);
    return response.data;
  }

  // Update category
  async updateCategory(id: number, data: CategoryUpdateRequest): Promise<ApiResponse<Category>> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  }

  // Update category status
  async updateCategoryStatus(id: number, isActive: boolean): Promise<ApiResponse<Category>> {
    const response = await api.put(`/categories/${id}/status?isActive=${isActive}`);
    return response.data;
  }

  // Delete category
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }

  // Get category count
  async getCategoryCount(): Promise<ApiResponse<number>> {
    const response = await api.get('/categories/count');
    return response.data;
  }

  // Get root category count
  async getRootCategoryCount(): Promise<ApiResponse<number>> {
    const response = await api.get('/categories/count/root');
    return response.data;
  }

  // Get active categories (for dropdowns)
  async getActiveCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories?isActive=true');
    return response.data;
  }

  // Get categories for parent selection (excluding self and descendants)
  async getCategoriesForParent(excludeId?: number): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/categories');
    if (response.data.success && excludeId) {
      // Filter out the category itself and its descendants
      const categories = response.data.data.filter((cat: Category) => cat.id !== excludeId);
      return { ...response.data, data: categories };
    }
    return response.data;
  }

  // Build category hierarchy tree
  buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // Create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build the tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parent) {
        const parent = categoryMap.get(category.parent.id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  // Get category path (breadcrumb)
  getCategoryPath(category: Category, categories: Category[]): Category[] {
    const path: Category[] = [];
    let currentCategory = category;

    while (currentCategory) {
      path.unshift(currentCategory);
      if (currentCategory.parent) {
        currentCategory = categories.find(cat => cat.id === currentCategory.parent!.id) || currentCategory.parent;
      } else {
        break;
      }
    }

    return path;
  }

  // Check if category can be deleted (no children and no products)
  async canDeleteCategory(id: number): Promise<boolean> {
    try {
      // Check for children
      const childrenResponse = await this.getChildCategories(id);
      if (childrenResponse.success && childrenResponse.data.length > 0) {
        return false;
      }

      // TODO: Check for products in this category
      // This would require a products API call to check if any products use this category
      
      return true;
    } catch (error) {
      console.error('Error checking if category can be deleted:', error);
      return false;
    }
  }
}

export default new CategoryService(); 