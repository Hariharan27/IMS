import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatNumber, formatPercentage } from '../../../utils/formatters';
import { getColorByIndex } from '../../../utils/chartHelpers';
import type { WarehouseDistributionData } from '../../../types/dashboard';

interface WarehouseChartProps {
  data: WarehouseDistributionData[];
  loading?: boolean;
  title?: string;
}

const WarehouseChart: React.FC<WarehouseChartProps> = ({ 
  data, 
  loading = false, 
  title = "Warehouse Distribution" 
}) => {
  const chartData = data.map((item, index) => ({
    name: item.warehouse,
    value: item.products,
    percentage: item.percentage,
    color: getColorByIndex(index, 'primary'),
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
            Products: {formatNumber(data.value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {formatPercentage(data.percentage)}
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Total Warehouses: {data.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Products: {data.reduce((sum, item) => sum + item.products, 0).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WarehouseChart; 