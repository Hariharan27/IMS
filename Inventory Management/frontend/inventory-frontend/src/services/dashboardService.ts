import type { 
  DashboardResponse, 
  DashboardFilters,
  DashboardMetrics,
  QuickAction,
  ActivityItem,
  AlertNotification,
  StockMovementData,
  TopProductData,
  WarehouseDistributionData,
  CategoryDistributionData,
  PerformanceMetrics
} from '../types/dashboard';
import { apiGet, handleApiError } from './api';

export class DashboardService {
  // Get all dashboard data
  static async getDashboardData(filters?: DashboardFilters): Promise<DashboardResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters?.warehouse) params.append('warehouse', filters.warehouse);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.supplier) params.append('supplier', filters.supplier);

      const url = `/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiGet<DashboardResponse>(url);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get dashboard metrics
  static async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiGet<{ success: boolean; data: DashboardMetrics; message: string }>('/dashboard/metrics');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get quick actions
  static async getQuickActions(): Promise<QuickAction[]> {
    try {
      const response = await apiGet<{ success: boolean; data: QuickAction[]; message: string }>('/dashboard/quick-actions');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get recent activities
  static async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    try {
      const response = await apiGet<{ success: boolean; data: ActivityItem[]; message: string }>(`/dashboard/activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get alerts
  static async getAlerts(): Promise<AlertNotification[]> {
    try {
      const response = await apiGet<{ success: boolean; data: AlertNotification[]; message: string }>('/dashboard/alerts');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get stock movements
  static async getStockMovements(filters?: DashboardFilters): Promise<StockMovementData[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }

      const url = `/dashboard/stock-movements${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiGet<{ success: boolean; data: StockMovementData[]; message: string }>(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get top products
  static async getTopProducts(limit: number = 10): Promise<TopProductData[]> {
    try {
      const response = await apiGet<{ success: boolean; data: TopProductData[]; message: string }>(`/dashboard/top-products?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get warehouse distribution
  static async getWarehouseDistribution(): Promise<WarehouseDistributionData[]> {
    try {
      const response = await apiGet<{ success: boolean; data: WarehouseDistributionData[]; message: string }>('/dashboard/warehouse-distribution');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get category distribution
  static async getCategoryDistribution(): Promise<CategoryDistributionData[]> {
    try {
      const response = await apiGet<{ success: boolean; data: CategoryDistributionData[]; message: string }>('/dashboard/category-distribution');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get performance metrics
  static async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await apiGet<{ success: boolean; data: PerformanceMetrics; message: string }>('/dashboard/performance');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Mark alert as read
  static async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await apiGet<{ success: boolean; message: string }>(`/dashboard/alerts/${alertId}/read`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Refresh dashboard data
  static async refreshDashboard(): Promise<DashboardResponse> {
    return this.getDashboardData();
  }
}

export default DashboardService; 