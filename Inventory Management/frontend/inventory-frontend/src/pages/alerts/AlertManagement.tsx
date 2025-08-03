import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Notifications,
  Warning,
  Error,
  Info,
  CheckCircle,
  Close,
  FilterList,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '../../components/layout/MainLayout';
import { formatTimestamp, getSeverityColor, getAlertIcon } from '../../utils/formatters';

// Alert form schema
const alertSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.enum(['low_stock', 'order_pending', 'system', 'security']),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface AlertItem {
  id: string;
  type: 'low_stock' | 'order_pending' | 'system' | 'security';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    link: string;
  };
}

const AlertManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showRead, setShowRead] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: '',
      message: '',
      severity: 'medium',
      type: 'system',
    },
  });

  // Load alerts
  const loadAlerts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockAlerts: AlertItem[] = [
        {
          id: '1',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: 'Product "Wireless Mouse" is running low on stock. Current quantity: 8 units',
          severity: 'high',
          timestamp: '2024-01-15T10:30:00Z',
          read: false,
          action: {
            label: 'View Product',
            link: '/products/2',
          },
        },
        {
          id: '2',
          type: 'order_pending',
          title: 'Purchase Order Pending',
          message: 'PO-2024-001 is pending approval from manager',
          severity: 'medium',
          timestamp: '2024-01-15T09:15:00Z',
          read: false,
          action: {
            label: 'Review Order',
            link: '/purchase-orders/1',
          },
        },
        {
          id: '3',
          type: 'system',
          title: 'System Update',
          message: 'Database backup completed successfully',
          severity: 'low',
          timestamp: '2024-01-15T08:00:00Z',
          read: true,
        },
        {
          id: '4',
          type: 'security',
          title: 'Security Alert',
          message: 'Multiple failed login attempts detected from IP 192.168.1.100',
          severity: 'critical',
          timestamp: '2024-01-15T07:45:00Z',
          read: false,
          action: {
            label: 'View Logs',
            link: '/security/logs',
          },
        },
      ];
      setAlerts(mockAlerts);
    } catch (err) {
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      // TODO: Replace with actual API call
      console.log('Marking alert as read:', alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (err) {
      setError('Failed to mark alert as read');
    }
  };

  const handleCreateAlert = () => {
    reset();
    setCreateDialogOpen(true);
  };

  const onSubmitAlert = async (data: AlertFormData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Creating alert:', data);
      setCreateDialogOpen(false);
      loadAlerts();
    } catch (err) {
      setError('Failed to create alert');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'high':
        return <Warning color="warning" />;
      case 'medium':
        return <Info color="info" />;
      case 'low':
        return <CheckCircle color="success" />;
      default:
        return <Info />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesReadStatus = showRead || !alert.read;
    
    return matchesSeverity && matchesType && matchesReadStatus;
  });

  const unreadCount = alerts.filter(alert => !alert.read).length;

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Alert Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and manage system alerts and notifications
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadAlerts}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Notifications />}
              onClick={handleCreateAlert}
            >
              Create Alert
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="low_stock">Low Stock</MenuItem>
                  <MenuItem value="order_pending">Order Pending</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant={showRead ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setShowRead(!showRead)}
              >
                {showRead ? 'Show All' : 'Unread Only'}
              </Button>
              
              <Chip
                label={`${unreadCount} unread`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardContent>
            {filteredAlerts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No alerts found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filterSeverity === 'all' && filterType === 'all' && showRead
                    ? 'All caught up! No alerts to display.'
                    : 'No alerts match the current filters.'
                  }
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredAlerts.map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem
                      sx={{
                        backgroundColor: alert.read ? 'transparent' : 'action.hover',
                        border: alert.read ? 'none' : '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        {getSeverityIcon(alert.severity)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {alert.title}
                            </Typography>
                            <Chip
                              label={alert.severity.toUpperCase()}
                              size="small"
                              sx={{
                                backgroundColor: getSeverityColor(alert.severity),
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
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
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {alert.message}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        {!alert.read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAsRead(alert.id)}
                              color="primary"
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedAlert(alert)}
                            color="primary"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                    {index < filteredAlerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Create Alert Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Alert</DialogTitle>
          <form onSubmit={handleSubmit(onSubmitAlert)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Alert Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Alert Message"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.message}
                      helperText={errors.message?.message}
                    />
                  )}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Controller
                    name="severity"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.severity}>
                        <InputLabel>Severity</InputLabel>
                        <Select {...field} label="Severity">
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="critical">Critical</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.type}>
                        <InputLabel>Type</InputLabel>
                        <Select {...field} label="Type">
                          <MenuItem value="low_stock">Low Stock</MenuItem>
                          <MenuItem value="order_pending">Order Pending</MenuItem>
                          <MenuItem value="system">System</MenuItem>
                          <MenuItem value="security">Security</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : 'Create Alert'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Alert Details Dialog */}
        <Dialog open={!!selectedAlert} onClose={() => setSelectedAlert(null)} maxWidth="sm" fullWidth>
          {selectedAlert && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getSeverityIcon(selectedAlert.severity)}
                  Alert Details
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6">{selectedAlert.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAlert.message}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={selectedAlert.severity.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: getSeverityColor(selectedAlert.severity),
                        color: 'white',
                      }}
                    />
                    <Chip
                      label={selectedAlert.type.replace('_', ' ').toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatTimestamp(selectedAlert.timestamp)}
                  </Typography>
                  {selectedAlert.action && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {selectedAlert.action.label}
                    </Button>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedAlert(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default AlertManagement; 