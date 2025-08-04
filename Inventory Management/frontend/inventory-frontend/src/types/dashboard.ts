export interface TrendData {
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
}

export interface DashboardMetrics {
  totalProducts: number;
  totalProductsTrend?: TrendData;
  lowStockItems: number;
  lowStockTrend?: TrendData;
  recentOrders: number;
  recentOrdersTrend?: TrendData;
  totalValue: number;
  totalValueTrend?: TrendData;
  activeSuppliers: number;
  totalWarehouses: number;
  pendingOrders: number;
  criticalAlerts: number;
}

export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  icon: string;
  color: string;
  link?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
  roles: string[];
}

export interface ActivityItem {
  id: string;
  type: 'stock_movement' | 'new_product' | 'order_created' | 'alert' | 'user_action';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  link?: string;
}

export interface AlertNotification {
  id: string;
  type: 'low_stock' | 'order_pending' | 'system' | 'security';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    link: string;
  };
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface StockMovementData {
  date: string;
  in: number;
  out: number;
  net: number;
}

export interface TopProductData {
  name: string;
  quantity: number;
  value: number;
  category: string;
}

export interface WarehouseDistributionData {
  warehouse: string;
  products: number;
  value: number;
  percentage: number;
}

export interface CategoryDistributionData {
  category: string;
  products: number;
  value: number;
  percentage: number;
}

export interface PerformanceMetrics {
  inventoryTurnover: number;
  stockAccuracy: number;
  orderFulfillment: number;
  supplierPerformance: number;
}

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  warehouse?: string;
  category?: string;
  supplier?: string;
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  quickActions: QuickAction[];
  recentActivities: ActivityItem[];
  alerts: AlertNotification[];
  stockMovements: StockMovementData[];
  topProducts: TopProductData[];
  warehouseDistribution: WarehouseDistributionData[];
  categoryDistribution: CategoryDistributionData[];
  performanceMetrics: PerformanceMetrics | null;
  filters: DashboardFilters;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    metrics: DashboardMetrics;
    quickActions: QuickAction[];
    recentActivities: ActivityItem[];
    alerts: AlertNotification[];
    stockMovements: StockMovementData[];
    topProducts: TopProductData[];
    warehouseDistribution: WarehouseDistributionData[];
    categoryDistribution: CategoryDistributionData[];
    performanceMetrics: PerformanceMetrics;
  };
  message: string;
} 