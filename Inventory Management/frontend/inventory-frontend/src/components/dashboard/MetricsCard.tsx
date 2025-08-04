import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  ArrowForward,
} from '@mui/icons-material';
import { formatNumber, formatCurrency, formatChange, getChangeColor } from '../../utils/formatters';
import type { MetricCard as MetricCardType } from '../../types/dashboard';

interface MetricsCardProps {
  metric: MetricCardType;
  loading?: boolean;
  onClick?: () => void;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metric, loading = false, onClick }) => {
  const getIcon = (iconName: string) => {
    // You can expand this to include more icons
    switch (iconName) {
      case 'inventory':
        return '📦';
      case 'shopping_cart':
        return '🛒';
      case 'warning':
        return '⚠️';
      case 'dollar':
        return '₹';
      case 'people':
        return '👥';
      case 'warehouse':
        return '🏭';
      case 'clock':
        return '⏰';
      case 'alert':
        return '🚨';
      default:
        return '📊';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'decrease':
        return <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />;
      case 'stable':
        return <Remove sx={{ color: 'text.secondary', fontSize: 16 }} />;
      default:
        return <Remove sx={{ color: 'text.secondary', fontSize: 16 }} />;
    }
  };

  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      if (metric.title.toLowerCase().includes('value') || metric.title.toLowerCase().includes('cost')) {
        return formatCurrency(value);
      }
      return formatNumber(value);
    }
    return value;
  };

  if (loading) {
    return (
      <Card 
        sx={{ 
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          } : {},
        }}
        onClick={onClick}
      >
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="text" width="30%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${metric.color}15 0%, ${metric.color}05 100%)`,
        border: `1px solid ${metric.color}20`,
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${metric.color}30`,
        } : {},
        '&:active': onClick ? {
          transform: 'translateY(0px)',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontSize: '2rem',
                filter: 'grayscale(0.3)',
              }}
            >
              {getIcon(metric.icon)}
            </Typography>
          </Box>
          {onClick && (
            <Tooltip title="View details">
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: metric.color,
                    transform: 'translateX(2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ArrowForward fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            wordBreak: 'break-word',
            lineHeight: 1.2,
          }}
        >
          {formatValue(metric.value)}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            mb: 2,
            fontWeight: 500,
            wordBreak: 'break-word',
            lineHeight: 1.4,
            minHeight: '2.8em', // Ensure consistent height for titles
          }}
        >
          {metric.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {getChangeIcon(metric.changeType)}
          <Typography 
            variant="caption" 
            sx={{ 
              color: getChangeColor(metric.change),
              fontWeight: 600,
              wordBreak: 'break-word',
              lineHeight: 1.3,
            }}
          >
            {formatChange(metric.change)} from last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricsCard; 