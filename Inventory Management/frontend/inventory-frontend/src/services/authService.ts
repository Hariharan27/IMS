import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  ApiResponse
} from '../types/auth';
import type { User, UserFilters, UserListResponse, UserUpdateRequest, UserUpdateResponse } from '../types/user';
import { apiPost, apiGet, apiPut, apiDelete, handleApiError } from './api';

export class AuthService {
  // Authentication methods
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiPost<LoginResponse>('/auth/login', credentials);
      
      // Store token and user data
      if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          username: response.data.username,
          role: response.data.role
        }));
      }
      
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiPost<RegisterResponse>('/auth/register', userData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  static clearStorage(): void {
    // Clear local storage without redirect
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // User management methods (Admin only)
  static async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());

      const url = `/users${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiGet<UserListResponse>(url);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await apiGet<ApiResponse<User>>(`/users/${id}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async updateUser(id: number, userData: UserUpdateRequest): Promise<UserUpdateResponse> {
    try {
      const response = await apiPut<UserUpdateResponse>(`/users/${id}`, userData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  static async deleteUser(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiDelete<ApiResponse<null>>(`/users/${id}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Token management
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  static getUserFromStorage(): { username: string; role: string } | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // Token validation
  static isTokenValid(token: string): boolean {
    try {
      // Use a more reliable base64 decode method
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const currentTime = Date.now() / 1000;
      
      console.log('Token validation:', {
        exp: payload.exp,
        currentTime,
        isValid: payload.exp > currentTime
      });
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

export default AuthService; 