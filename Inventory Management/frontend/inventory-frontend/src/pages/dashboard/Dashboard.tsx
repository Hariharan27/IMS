import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
        change: metrics.totalProductsTrend?.change || 0,
        changeType: metrics.totalProductsTrend?.changeType || 'stable',
        icon: 'inventory',
        color: '#2196F3',
        link: '/products',
      },
      {
        id: 'low-stock',
        title: 'Low Stock Items',
        value: metrics.lowStockItems,
        change: metrics.lowStockTrend?.change || 0,
        changeType: metrics.lowStockTrend?.changeType || 'stable',
        icon: 'warning',
        color: '#FF9800',
        link: '/inventory?filter=low-stock',
      },
      {
        id: 'recent-orders',
        title: 'Recent Orders',
        value: metrics.recentOrders,
        change: metrics.recentOrdersTrend?.change || 0,
        changeType: metrics.recentOrdersTrend?.changeType || 'stable',
        icon: 'shopping_cart',
        color: '#4CAF50',
        link: '/purchase-orders',
      },
      {
        id: 'total-value',
        title: 'Total Value',
        value: metrics.totalValue,
        change: metrics.totalValueTrend?.change || 0,
        changeType: metrics.totalValueTrend?.changeType || 'stable',
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
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'text.primary', 
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' },
              wordBreak: 'break-word',
              lineHeight: 1.2,
            }}
          >
            Welcome back, {user?.firstName || user?.username}!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              wordBreak: 'break-word',
            }}
          >
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
              onClick={() => metric.link && navigate(metric.link)}
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
          gap: { xs: 2, sm: 3 }, 
          mb: 4 
        }}>
          <InventoryChart
            data={categoryDistribution}
            loading={isLoading}
          />
          {/* StockMovementChart temporarily hidden */}
          {/* <StockMovementChart
            data={stockMovements}
            loading={isLoading}
          /> */}
          <WarehouseChart
            data={warehouseDistribution}
            loading={isLoading}
          />
        </Box>

        {/* Recent Activities and Top Products */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
          gap: { xs: 2, sm: 3 },
          mb: 4
        }}>
          <ActivityFeed
            activities={recentActivities}
            loading={isLoading}
            maxItems={8}
          />
          <TopProductsChart
            data={topProducts}
            loading={isLoading}
            limit={8}
          />
        </Box>

        {/* Recent Alerts - Full Width */}
        <Box sx={{ mb: 2 }}>
          <AlertPanel />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default Dashboard; 