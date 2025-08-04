import api from './api';
import type { User } from '../types/user';

// Alert Types based on backend enums
export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PURCHASE_ORDER_DUE' | 'PURCHASE_ORDER_OVERDUE' | 'INVENTORY_ADJUSTMENT' | 'SYSTEM_ALERT';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type ReferenceType = 'INVENTORY' | 'PURCHASE_ORDER' | 'PRODUCT' | 'WAREHOUSE' | 'SYSTEM';

// Alert interface matching backend AlertResponse
export interface Alert {
  id: number;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  referenceType: ReferenceType | null;
  referenceId: number | null;
  status: AlertStatus;
  priority: AlertPriority;
  triggeredAt: string;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy: User | null;
  isActive: boolean;
  isResolved: boolean;
  isUnresolved: boolean;
}

// Alert request interface for creating alerts
export interface AlertRequest {
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  referenceType?: ReferenceType;
  referenceId?: number;
  priority: AlertPriority;
  notes?: string;
}

// Status update request
export interface StatusUpdateRequest {
  status: AlertStatus;
  notes?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  count?: number;
}

// Paginated response for alerts
export interface AlertListResponse extends ApiResponse<Alert[]> {
  count: number;
}

// Filters for alert queries
export interface AlertFilters {
  page?: number;
  size?: number;
  alertType?: AlertType;
  severity?: AlertSeverity;
  priority?: AlertPriority;
  status?: AlertStatus;
  referenceType?: ReferenceType;
  referenceId?: number;
}

class AlertService {
  // Get all alerts with pagination
  async getAlerts(filters?: AlertFilters): Promise<AlertListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.page !== undefined) params.append('page', filters.page.toString());
      if (filters?.size !== undefined) params.append('size', filters.size.toString());

      const url = `/alerts${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get<AlertListResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch alerts');
    }
  }

  // Get alert by ID
  async getAlertById(id: number): Promise<ApiResponse<Alert>> {
    try {
      const response = await api.get<ApiResponse<Alert>>(`/alerts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert:', error);
      throw new Error('Failed to fetch alert');
    }
  }

  // Get active alerts
  async getActiveAlerts(): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>('/alerts/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      throw new Error('Failed to fetch active alerts');
    }
  }

  // Get unresolved alerts
  async getUnresolvedAlerts(): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>('/alerts/unresolved');
      return response.data;
    } catch (error) {
      console.error('Error fetching unresolved alerts:', error);
      throw new Error('Failed to fetch unresolved alerts');
    }
  }

  // Get alerts by type
  async getAlertsByType(alertType: AlertType): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>(`/alerts/type/${alertType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts by type:', error);
      throw new Error('Failed to fetch alerts by type');
    }
  }

  // Get alerts by severity
  async getAlertsBySeverity(severity: AlertSeverity): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>(`/alerts/severity/${severity}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts by severity:', error);
      throw new Error('Failed to fetch alerts by severity');
    }
  }

  // Get alerts by priority
  async getAlertsByPriority(priority: AlertPriority): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>(`/alerts/priority/${priority}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts by priority:', error);
      throw new Error('Failed to fetch alerts by priority');
    }
  }

  // Get critical alerts
  async getCriticalAlerts(): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>('/alerts/critical');
      return response.data;
    } catch (error) {
      console.error('Error fetching critical alerts:', error);
      throw new Error('Failed to fetch critical alerts');
    }
  }

  // Get urgent alerts
  async getUrgentAlerts(): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>('/alerts/urgent');
      return response.data;
    } catch (error) {
      console.error('Error fetching urgent alerts:', error);
      throw new Error('Failed to fetch urgent alerts');
    }
  }

  // Get recent alerts
  async getRecentAlerts(): Promise<AlertListResponse> {
    try {
      const response = await api.get<AlertListResponse>('/alerts/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      throw new Error('Failed to fetch recent alerts');
    }
  }

  // Create new alert
  async createAlert(alertData: AlertRequest): Promise<ApiResponse<Alert>> {
    try {
      const response = await api.post<ApiResponse<Alert>>('/alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw new Error('Failed to create alert');
    }
  }

  // Update alert status
  async updateAlertStatus(id: number, statusData: StatusUpdateRequest): Promise<ApiResponse<Alert>> {
    try {
      const response = await api.put<ApiResponse<Alert>>(`/alerts/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw new Error('Failed to update alert status');
    }
  }

  // Generate alerts
  async generateAlerts(): Promise<ApiResponse<null>> {
    try {
      const response = await api.post<ApiResponse<null>>('/alerts/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw new Error('Failed to generate alerts');
    }
  }

  // Get alert count
  async getAlertCount(): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>('/alerts/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert count:', error);
      throw new Error('Failed to fetch alert count');
    }
  }

  // Get active alert count
  async getActiveAlertCount(): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>('/alerts/count/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active alert count:', error);
      throw new Error('Failed to fetch active alert count');
    }
  }

  // Get unresolved alert count
  async getUnresolvedAlertCount(): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>('/alerts/count/unresolved');
      return response.data;
    } catch (error) {
      console.error('Error fetching unresolved alert count:', error);
      throw new Error('Failed to fetch unresolved alert count');
    }
  }

  // Get alert count by type
  async getAlertCountByType(alertType: AlertType): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>(`/alerts/count/type/${alertType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert count by type:', error);
      throw new Error('Failed to fetch alert count by type');
    }
  }

  // Get alert count by severity
  async getAlertCountBySeverity(severity: AlertSeverity): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>(`/alerts/count/severity/${severity}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert count by severity:', error);
      throw new Error('Failed to fetch alert count by severity');
    }
  }

  // Get alert count by priority
  async getAlertCountByPriority(priority: AlertPriority): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>(`/alerts/count/priority/${priority}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching alert count by priority:', error);
      throw new Error('Failed to fetch alert count by priority');
    }
  }

  // Get critical alert count
  async getCriticalAlertCount(): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>('/alerts/count/critical');
      return response.data;
    } catch (error) {
      console.error('Error fetching critical alert count:', error);
      throw new Error('Failed to fetch critical alert count');
    }
  }

  // Get urgent alert count
  async getUrgentAlertCount(): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<ApiResponse<number>>('/alerts/count/urgent');
      return response.data;
    } catch (error) {
      console.error('Error fetching urgent alert count:', error);
      throw new Error('Failed to fetch urgent alert count');
    }
  }
}

export const alertService = new AlertService();
export default alertService; 