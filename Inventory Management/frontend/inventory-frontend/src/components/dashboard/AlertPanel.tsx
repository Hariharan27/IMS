import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Collapse,
  Button,
  CircularProgress,
  Alert as MuiAlert,
  Tooltip,
  Avatar,
  Divider,
  Badge,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Visibility,
  VisibilityOff,
  Refresh,
  Notifications,
  NotificationsActive,
  NotificationsNone,
} from '@mui/icons-material';
import { alertService, type Alert, type AlertStatus } from '../../services/alertService';
import { formatTimestamp } from '../../utils/formatters';

interface AlertPanelProps {
  showActiveOnly?: boolean;
  maxAlerts?: number;
  title?: string;
}

const AlertPanel: React.FC<AlertPanelProps> = ({
  showActiveOnly = true,
  maxAlerts = 5,
  title = 'Recent Alerts'
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = showActiveOnly 
        ? await alertService.getActiveAlerts()
        : await alertService.getAlerts({ size: maxAlerts });
      
      if (response.success) {
        setAlerts(response.data.slice(0, maxAlerts));
      } else {
        setError(response.message || 'Failed to load alerts');
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError('Failed to load alerts');
      // Set empty array to prevent UI breaking
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [showActiveOnly, maxAlerts]);

  const handleStatusUpdate = async (alertId: number, newStatus: AlertStatus) => {
    try {
      setUpdating(alertId);
      const response = await alertService.updateAlertStatus(alertId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });
      
      if (response.success) {
        // Update the alert in the local state
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: newStatus }
              : alert
          )
        );
      } else {
        setError(response.message || 'Failed to update alert status');
      }
    } catch (err) {
      console.error('Error updating alert status:', err);
      setError('Failed to update alert status');
    } finally {
      setUpdating(null);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Error color="error" />;
      case 'HIGH':
        return <Warning color="warning" />;
      case 'MEDIUM':
        return <Info color="info" />;
      case 'LOW':
        return <CheckCircle color="success" />;
      default:
        return <Info color="info" />;
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'LOW_STOCK':
        return <Warning color="warning" />;
      case 'OUT_OF_STOCK':
        return <Error color="error" />;
      case 'PURCHASE_ORDER_DUE':
        return <Info color="info" />;
      case 'PURCHASE_ORDER_OVERDUE':
        return <Error color="error" />;
      case 'INVENTORY_ADJUSTMENT':
        return <Info color="info" />;
      case 'SYSTEM_ALERT':
        return <Warning color="warning" />;
      default:
        return <Notifications color="info" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'error';
      case 'ACKNOWLEDGED':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'DISMISSED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'NORMAL':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleRefresh = () => {
    loadAlerts();
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Badge badgeContent={alerts.length} color="error">
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <NotificationsActive />
              </Avatar>
            </Badge>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh alerts">
              <IconButton size="small" onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title={expanded ? "Show less" : "Show more"}>
              <IconButton size="small" onClick={handleToggleExpanded}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </MuiAlert>
        )}

        {alerts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary" variant="body1">
              {showActiveOnly ? 'No active alerts' : 'No alerts found'}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              All systems are running smoothly
            </Typography>
          </Box>
        ) : (
          <List dense>
            {alerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    '&:last-child': { mb: 0 },
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      boxShadow: 1,
                    },
                    transition: 'all 0.2s ease-in-out',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2} width="100%">
                    <ListItemIcon sx={{ mt: 0 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: getSeverityColor(alert.severity) === 'error' ? 'error.main' : 
                                 getSeverityColor(alert.severity) === 'warning' ? 'warning.main' : 
                                 getSeverityColor(alert.severity) === 'info' ? 'info.main' : 'success.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        {getAlertIcon(alert.alertType)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1, minWidth: 0 }}>
                            {alert.title}
                          </Typography>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            <Chip
                              label={alert.severity}
                              size="small"
                              color={getSeverityColor(alert.severity) as any}
                              variant="outlined"
                            />
                            <Chip
                              label={alert.priority}
                              size="small"
                              color={getPriorityColor(alert.priority) as any}
                              variant="outlined"
                            />
                            <Chip
                              label={alert.status}
                              size="small"
                              color={getStatusColor(alert.status) as any}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" mb={0.5} sx={{ wordBreak: 'break-word' }}>
                            {alert.message}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(alert.triggeredAt)}
                            </Typography>
                            {alert.createdBy && alert.createdBy.firstName && alert.createdBy.lastName && (
                              <Typography variant="caption" color="text.secondary">
                                • by {alert.createdBy.firstName} {alert.createdBy.lastName}
                              </Typography>
                            )}
                          </Box>
                          {alert.notes && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Note: {alert.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </Box>
                  
                  {/* Action buttons in a separate row */}
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap" justifyContent="flex-end">
                    {alert.status === 'ACTIVE' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(alert.id, 'ACKNOWLEDGED')}
                        disabled={updating === alert.id}
                        startIcon={updating === alert.id ? <CircularProgress size={16} /> : <Visibility />}
                        sx={{ minWidth: 100 }}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status === 'ACKNOWLEDGED' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(alert.id, 'RESOLVED')}
                        disabled={updating === alert.id}
                        startIcon={updating === alert.id ? <CircularProgress size={16} /> : <CheckCircle />}
                        sx={{ minWidth: 100 }}
                      >
                        Resolve
                      </Button>
                    )}
                    {alert.status === 'ACTIVE' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusUpdate(alert.id, 'DISMISSED')}
                        disabled={updating === alert.id}
                        startIcon={updating === alert.id ? <CircularProgress size={16} /> : <VisibilityOff />}
                        sx={{ minWidth: 100 }}
                      >
                        Dismiss
                      </Button>
                    )}
                  </Box>
                </ListItem>
                {index < alerts.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        )}

        {!expanded && alerts.length > maxAlerts && (
          <Box textAlign="center" mt={2}>
            <Button 
              size="small" 
              variant="outlined"
              onClick={handleToggleExpanded}
              startIcon={<ExpandMore />}
            >
              Show all {alerts.length} alerts
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertPanel; 