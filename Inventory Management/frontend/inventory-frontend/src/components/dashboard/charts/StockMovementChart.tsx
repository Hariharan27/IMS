import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatNumber, formatChartTooltip } from '../../../utils/formatters';
import type { StockMovementData } from '../../../types/dashboard';

interface StockMovementChartProps {
  data: StockMovementData[];
  loading?: boolean;
  title?: string;
}

const StockMovementChart: React.FC<StockMovementChartProps> = ({ 
  data, 
  loading = false, 
  title = "Stock Movement Trends" 
}) => {
  const chartData = data.map(item => ({
    name: item.date,
    'Stock In': item.in,
    'Stock Out': item.out,
    'Net Change': item.net,
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
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Stock In" 
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Stock Out" 
                stroke="#F44336" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Net Change" 
                stroke="#2196F3" 
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Period: {data.length} days
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Net: {data.reduce((sum, item) => sum + item.net, 0).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockMovementChart; 