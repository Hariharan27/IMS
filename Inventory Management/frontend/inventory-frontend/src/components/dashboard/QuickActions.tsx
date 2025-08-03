import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { QuickAction } from '../../types/dashboard';
import type { UserRole } from '../../types/user';

interface QuickActionsProps {
  actions: QuickAction[];
  loading?: boolean;
  title?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions, 
  loading = false, 
  title = "Quick Actions" 
}) => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'add_product':
        return '📦';
      case 'view_inventory':
        return '📋';
      case 'create_order':
        return '🛒';
      case 'view_reports':
        return '📊';
      case 'manage_users':
        return '👥';
      case 'manage_suppliers':
        return '🏭';
      case 'view_alerts':
        return '🚨';
      case 'settings':
        return '⚙️';
      default:
        return '📋';
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.link) {
      navigate(action.link);
    }
  };

  const filteredActions = (Array.isArray(actions) ? actions : []).filter(action => 
    hasAnyRole(action.roles as UserRole[])
  );

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} />
          <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={80} />
            ))}
          </Box>
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
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 2 
        }}>
          {filteredActions.map((action) => (
            <Button
              key={action.id}
              variant="outlined"
              onClick={() => handleActionClick(action)}
              sx={{
                height: 80,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                borderColor: action.color,
                color: action.color,
                '&:hover': {
                  backgroundColor: `${action.color}10`,
                  borderColor: action.color,
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                {getIcon(action.icon)}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {action.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                {action.description}
              </Typography>
            </Button>
          ))}
        </Box>

        {filteredActions.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 200,
            color: 'text.secondary'
          }}>
            <Typography variant="body1">
              No actions available for your role
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions; 