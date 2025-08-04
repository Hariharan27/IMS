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
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
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
          <Box textAlign="center" py={3}>
            <Typography color="text.secondary">
              {showActiveOnly ? 'No active alerts' : 'No alerts found'}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {alerts.map((alert) => (
              <ListItem
                key={alert.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:last-child': { mb: 0 }
                }}
              >
                <ListItemIcon>
                  {getSeverityIcon(alert.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {alert.title}
                      </Typography>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={getSeverityColor(alert.severity) as any}
                      />
                      <Chip
                        label={alert.priority}
                        size="small"
                        color={getPriorityColor(alert.priority) as any}
                      />
                      <Chip
                        label={alert.status}
                        size="small"
                        color={getStatusColor(alert.status) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(alert.triggeredAt)} • {alert.createdBy.firstName} {alert.createdBy.lastName}
                      </Typography>
                      {alert.notes && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Note: {alert.notes}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <Box display="flex" flexDirection="column" gap={0.5}>
                  {alert.status === 'ACTIVE' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(alert.id, 'ACKNOWLEDGED')}
                      disabled={updating === alert.id}
                      startIcon={updating === alert.id ? <CircularProgress size={16} /> : <Visibility />}
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
                    >
                      Dismiss
                    </Button>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}

        {!expanded && alerts.length > 0 && (
          <Box textAlign="center" mt={2}>
            <Button size="small" onClick={handleToggleExpanded}>
              Show {alerts.length} alerts
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertPanel; 