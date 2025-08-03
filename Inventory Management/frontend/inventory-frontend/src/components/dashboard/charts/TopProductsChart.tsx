import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatNumber, formatCurrency } from '../../../utils/formatters';
import { getColorByIndex } from '../../../utils/chartHelpers';
import type { TopProductData } from '../../../types/dashboard';

interface TopProductsChartProps {
  data: TopProductData[];
  loading?: boolean;
  title?: string;
  limit?: number;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ 
  data, 
  loading = false, 
  title = "Top Products",
  limit = 10
}) => {
  const chartData = data
    .slice(0, limit)
    .map((item, index) => ({
      name: item.name,
      quantity: item.quantity,
      value: item.value,
      category: item.category,
      color: getColorByIndex(index, 'success'),
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Category: {data.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quantity: {formatNumber(data.quantity)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Value: {formatCurrency(data.value)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing top {Math.min(limit, data.length)} products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Value: {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopProductsChart; 