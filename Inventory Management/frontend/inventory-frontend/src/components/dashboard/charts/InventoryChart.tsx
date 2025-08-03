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
import { formatNumber, formatChartTooltip } from '../../../utils/formatters';
import { getColorByIndex } from '../../../utils/chartHelpers';
import type { CategoryDistributionData } from '../../../types/dashboard';

interface InventoryChartProps {
  data: CategoryDistributionData[];
  loading?: boolean;
  title?: string;
}

const InventoryChart: React.FC<InventoryChartProps> = ({ 
  data, 
  loading = false, 
  title = "Inventory by Category" 
}) => {
  const chartData = data.map((item, index) => ({
    name: item.category,
    products: item.products,
    value: item.value,
    color: getColorByIndex(index, 'primary'),
  }));

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
              <Tooltip 
                formatter={formatChartTooltip}
                labelStyle={{ color: '#333' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              />
              <Bar dataKey="products" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total Categories: {data.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Products: {data.reduce((sum, item) => sum + item.products, 0).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InventoryChart; 