import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatTimestamp, getActivityIcon, getSeverityColor } from '../../utils/formatters';
import type { ActivityItem } from '../../types/dashboard';

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  title?: string;
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  loading = false, 
  title = "Recent Activities",
  maxItems = 10
}) => {
  const navigate = useNavigate();

  const getActivityIconComponent = (type: string) => {
    const iconName = getActivityIcon(type);
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
          fontSize: '1.2rem',
        }}
      >
        {iconName}
      </Box>
    );
  };

  const getSeverityChip = (severity?: string) => {
    if (!severity) return null;
    
    return (
      <Chip
        label={severity.toUpperCase()}
        size="small"
        sx={{
          backgroundColor: getSeverityColor(severity),
          color: 'white',
          fontSize: '0.7rem',
          height: 20,
        }}
      />
    );
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} />
          <List>
            {[1, 2, 3, 4, 5].map((i) => (
              <ListItem key={i} sx={{ px: 0 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activities.length} activities
          </Typography>
        </Box>
        
        {displayedActivities.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 200,
            color: 'text.secondary'
          }}>
            <Typography variant="body1">
              No recent activities
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {displayedActivities.map((activity) => (
              <ListItem
                key={activity.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  cursor: activity.link ? 'pointer' : 'default',
                  borderRadius: 1,
                  '&:hover': activity.link ? {
                    backgroundColor: 'action.hover',
                  } : {},
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => handleActivityClick(activity)}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  {getActivityIconComponent(activity.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          wordBreak: 'break-word',
                          lineHeight: 1.3,
                        }}
                      >
                        {activity.title}
                      </Typography>
                      {getSeverityChip(activity.severity)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                        }}
                      >
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                        {activity.user && (
                          <Typography variant="caption" color="text.secondary">
                            by {activity.user}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
                
                {activity.link && (
                  <Tooltip title="View details">
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      <ArrowForward fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItem>
            ))}
          </List>
        )}
        
        {activities.length > maxItems && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {maxItems} of {activities.length} activities
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed; 