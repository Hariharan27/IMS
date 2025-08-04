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
            maxWidth: '200px',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Products: {formatNumber(data.value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', minHeight: 400 }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Box sx={{ flex: 1, minHeight: 250, mt: 2 }}>
            <Skeleton variant="rectangular" height="100%" />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Box sx={{ 
          flex: 1, 
          minHeight: 250, 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Chart Container */}
          <Box sx={{ 
            flex: '0 0 60%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={Math.min(70, window.innerWidth < 768 ? 50 : 70)}
                  innerRadius={Math.min(35, window.innerWidth < 768 ? 25 : 35)}
                  dataKey="value"
                  label={({ name, percentage }) => {
                    // Format percentage to 1 decimal place
                    const formattedPercentage = percentage.toFixed(1);
                    // Truncate long warehouse names
                    const shortName = name.length > 12 ? name.substring(0, 10) + '...' : name;
                    return `${shortName} (${formattedPercentage}%)`;
                  }}
                  labelLine={true}
                  labelLineStyle={{ stroke: '#666', strokeWidth: 1 }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Legend Container */}
          <Box sx={{ 
            flex: '0 0 35%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '10px'
          }}>
            {chartData.map((entry, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1,
                  fontSize: '12px'
                }}
              >
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: entry.color, 
                    borderRadius: '2px',
                    mr: 1,
                    flexShrink: 0
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: '12px',
                    lineHeight: 1.2,
                    wordBreak: 'break-word'
                  }}
                >
                  {entry.name.length > 25 ? entry.name.substring(0, 22) + '...' : entry.name}
                  <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                    ({entry.percentage.toFixed(1)}%)
                  </Box>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}>
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