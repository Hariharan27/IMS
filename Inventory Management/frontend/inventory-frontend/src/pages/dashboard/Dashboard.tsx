import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import MainLayout from '../../components/layout/MainLayout';
import MetricsCard from '../../components/dashboard/MetricsCard';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import AlertPanel from '../../components/dashboard/AlertPanel';
import InventoryChart from '../../components/dashboard/charts/InventoryChart';
import StockMovementChart from '../../components/dashboard/charts/StockMovementChart';
import WarehouseChart from '../../components/dashboard/charts/WarehouseChart';
import TopProductsChart from '../../components/dashboard/charts/TopProductsChart';
import type { MetricCard as MetricCardType } from '../../types/dashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    metrics, 
    quickActions, 
    recentActivities, 
    alerts, 
    stockMovements, 
    topProducts, 
    warehouseDistribution, 
    categoryDistribution,
    isLoading, 
    error, 
    markAlertAsRead 
  } = useDashboard();

  // Create metric cards from dashboard data
  const createMetricCards = (): MetricCardType[] => {
    if (!metrics) return [];
    
    return [
      {
        id: 'total-products',
        title: 'Total Products',
        value: metrics.totalProducts,
        change: 12.5,
        changeType: 'increase',
        icon: 'inventory',
        color: '#2196F3',
        link: '/products',
      },
      {
        id: 'low-stock',
        title: 'Low Stock Items',
        value: metrics.lowStockItems,
        change: -5.2,
        changeType: 'decrease',
        icon: 'warning',
        color: '#FF9800',
        link: '/inventory?filter=low-stock',
      },
      {
        id: 'recent-orders',
        title: 'Recent Orders',
        value: metrics.recentOrders,
        change: 8.7,
        changeType: 'increase',
        icon: 'shopping_cart',
        color: '#4CAF50',
        link: '/purchase-orders',
      },
      {
        id: 'total-value',
        title: 'Total Value',
        value: metrics.totalValue,
        change: 15.3,
        changeType: 'increase',
        icon: 'dollar',
        color: '#9C27B0',
        link: '/reports/valuation',
      },
    ];
  };

  const metricCards = createMetricCards();

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'grey.50'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
            Welcome back, {user?.firstName || user?.username}!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Here's what's happening with your inventory today.
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Metrics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          {metricCards.map((metric) => (
            <MetricsCard
              key={metric.id}
              metric={metric}
              loading={isLoading}
            />
          ))}
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <QuickActions
            actions={quickActions}
            loading={isLoading}
          />
        </Box>

        {/* Charts and Analytics */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
          gap: 3, 
          mb: 4 
        }}>
          <InventoryChart
            data={categoryDistribution}
            loading={isLoading}
          />
          <StockMovementChart
            data={stockMovements}
            loading={isLoading}
          />
          <WarehouseChart
            data={warehouseDistribution}
            loading={isLoading}
          />
          <TopProductsChart
            data={topProducts}
            loading={isLoading}
            limit={8}
          />
        </Box>

        {/* Activity Feed and Alerts */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
          gap: 3 
        }}>
          <ActivityFeed
            activities={recentActivities}
            loading={isLoading}
            maxItems={8}
          />
          <AlertPanel
            alerts={alerts}
            loading={isLoading}
            onMarkAsRead={markAlertAsRead}
          />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Dashboard; 