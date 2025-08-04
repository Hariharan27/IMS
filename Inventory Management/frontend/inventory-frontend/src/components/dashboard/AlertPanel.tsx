import React, { useState } from 'react';
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
  Button,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Notifications,
  Close,
} from '@mui/icons-material';
import { formatTimestamp, getAlertIcon, getSeverityColor } from '../../utils/formatters';
import type { AlertNotification } from '../../types/dashboard';

interface AlertPanelProps {
  alerts: AlertNotification[];
  loading?: boolean;
  title?: string;
  maxItems?: number;
  onMarkAsRead?: (alertId: string) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ 
  alerts, 
  loading = false, 
  title = "Alerts & Notifications",
  maxItems = 5,
  onMarkAsRead
}) => {
  const [expanded, setExpanded] = useState(false);

  const getAlertIconComponent = (type: string, severity: string) => {
    const iconName = getAlertIcon(type);
    const color = getSeverityColor(severity);
    
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          color: 'white',
          fontSize: '1.2rem',
        }}
      >
        {iconName}
      </Box>
    );
  };

  const getSeverityChip = (severity: string) => {
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

  const handleMarkAsRead = (alertId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(alertId);
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.read);
  const displayedAlerts = expanded ? alerts.slice(0, maxItems) : unreadAlerts.slice(0, maxItems);

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="50%" height={32} />
          <List>
            {[1, 2, 3].map((i) => (
              <ListItem key={i} sx={{ px: 0 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="50%" height={16} />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {unreadAlerts.length > 0 && (
              <Chip
                label={unreadAlerts.length}
                size="small"
                color="error"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={expanded ? "Show less" : "Show more"}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ color: 'text.secondary' }}
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {displayedAlerts.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 200,
            color: 'text.secondary'
          }}>
            <Typography variant="body1">
              No alerts to display
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {displayedAlerts.map((alert) => (
              <ListItem
                key={alert.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderRadius: 1,
                  backgroundColor: alert.read ? 'transparent' : 'action.hover',
                  border: alert.read ? 'none' : '1px solid',
                  borderColor: 'primary.main',
                  mb: 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  {getAlertIconComponent(alert.type, alert.severity)}
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
                        {alert.title}
                      </Typography>
                      {getSeverityChip(alert.severity)}
                      {!alert.read && (
                        <Chip
                          label="NEW"
                          size="small"
                          color="primary"
                          sx={{ fontSize: '0.6rem', height: 16 }}
                        />
                      )}
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
                        {alert.message}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(alert.timestamp)}
                        </Typography>
                        {alert.action && (
                          <Button
                            size="small"
                            variant="text"
                            sx={{ 
                              fontSize: '0.7rem', 
                              p: 0, 
                              minWidth: 'auto',
                              textTransform: 'none',
                              color: 'primary.main',
                              '&:hover': { backgroundColor: 'transparent' }
                            }}
                          >
                            {alert.action.label}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!alert.read && onMarkAsRead && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(alert.id)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
        
        {alerts.length > maxItems && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {expanded 
                ? `Showing ${Math.min(maxItems, alerts.length)} of ${alerts.length} alerts`
                : `${unreadAlerts.length} unread alerts`
              }
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertPanel; 