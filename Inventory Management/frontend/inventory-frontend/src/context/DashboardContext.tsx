import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  DashboardState, 
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
import DashboardService from '../services/dashboardService';
import { useAuth } from './AuthContext';

// Initial state
const initialState: DashboardState = {
  metrics: null,
  quickActions: [],
  recentActivities: [],
  alerts: [],
  stockMovements: [],
  topProducts: [],
  warehouseDistribution: [],
  categoryDistribution: [],
  performanceMetrics: null,
  filters: {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0], // today
    },
  },
  isLoading: false,
  error: null,
};

// Action types
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_METRICS'; payload: DashboardMetrics }
  | { type: 'SET_QUICK_ACTIONS'; payload: QuickAction[] }
  | { type: 'SET_RECENT_ACTIVITIES'; payload: ActivityItem[] }
  | { type: 'SET_ALERTS'; payload: AlertNotification[] }
  | { type: 'SET_STOCK_MOVEMENTS'; payload: StockMovementData[] }
  | { type: 'SET_TOP_PRODUCTS'; payload: TopProductData[] }
  | { type: 'SET_WAREHOUSE_DISTRIBUTION'; payload: WarehouseDistributionData[] }
  | { type: 'SET_CATEGORY_DISTRIBUTION'; payload: CategoryDistributionData[] }
  | { type: 'SET_PERFORMANCE_METRICS'; payload: PerformanceMetrics }
  | { type: 'SET_FILTERS'; payload: DashboardFilters }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'REFRESH_DASHBOARD' };

// Reducer
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_QUICK_ACTIONS':
      return { ...state, quickActions: action.payload };
    case 'SET_RECENT_ACTIVITIES':
      return { ...state, recentActivities: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_STOCK_MOVEMENTS':
      return { ...state, stockMovements: action.payload };
    case 'SET_TOP_PRODUCTS':
      return { ...state, topProducts: action.payload };
    case 'SET_WAREHOUSE_DISTRIBUTION':
      return { ...state, warehouseDistribution: action.payload };
    case 'SET_CATEGORY_DISTRIBUTION':
      return { ...state, categoryDistribution: action.payload };
    case 'SET_PERFORMANCE_METRICS':
      return { ...state, performanceMetrics: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload ? { ...alert, read: true } : alert
        ),
      };
    case 'REFRESH_DASHBOARD':
      return { ...state, isLoading: true, error: null };
    default:
      return state;
  }
};

// Context interface
interface DashboardContextType extends DashboardState {
  loadDashboard: (filters?: DashboardFilters) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  updateFilters: (filters: DashboardFilters) => void;
  markAlertAsRead: (alertId: string) => Promise<void>;
  clearError: () => void;
}

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load dashboard data
  const loadDashboard = async (filters?: DashboardFilters) => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const dashboardData = await DashboardService.getDashboardData(filters || state.filters);

      if (dashboardData.success) {
        dispatch({ type: 'SET_METRICS', payload: dashboardData.data.metrics });
        dispatch({ type: 'SET_QUICK_ACTIONS', payload: dashboardData.data.quickActions?.data || [] });
        dispatch({ type: 'SET_RECENT_ACTIVITIES', payload: dashboardData.data.recentActivities?.data || [] });
        dispatch({ type: 'SET_ALERTS', payload: dashboardData.data.alerts?.data || [] });
        dispatch({ type: 'SET_STOCK_MOVEMENTS', payload: dashboardData.data.stockMovements?.data || [] });
        dispatch({ type: 'SET_TOP_PRODUCTS', payload: dashboardData.data.topProducts?.data || [] });
        dispatch({ type: 'SET_WAREHOUSE_DISTRIBUTION', payload: dashboardData.data.warehouseDistribution?.data || [] });
        dispatch({ type: 'SET_CATEGORY_DISTRIBUTION', payload: dashboardData.data.categoryDistribution?.data || [] });
        dispatch({ type: 'SET_PERFORMANCE_METRICS', payload: dashboardData.data.performanceMetrics });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load dashboard' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh dashboard
  const refreshDashboard = async () => {
    dispatch({ type: 'REFRESH_DASHBOARD' });
    await loadDashboard();
  };

  // Update filters
  const updateFilters = (filters: DashboardFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    loadDashboard(filters);
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId: string) => {
    try {
      await DashboardService.markAlertAsRead(alertId);
      dispatch({ type: 'MARK_ALERT_READ', payload: alertId });
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Load dashboard on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
    }
  }, [isAuthenticated]);

  // Auto-refresh dashboard every 5 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshDashboard();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: DashboardContextType = {
    ...state,
    loadDashboard,
    refreshDashboard,
    updateFilters,
    markAlertAsRead,
    clearError,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

// Custom hook to use dashboard context
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext; 