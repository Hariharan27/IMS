import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Alert as MuiAlert,
  CircularProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Snackbar,
  Pagination,
  Grid,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Visibility,
  Refresh,
  Warning,
  Error,
  Info,
  CheckCircle,
  Notifications,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '../../components/layout/MainLayout';
import { formatTimestamp } from '../../utils/formatters';
import { 
  alertService, 
  type Alert, 
  type AlertRequest, 
  type AlertStatus,
  type AlertType,
  type AlertSeverity,
  type AlertPriority,
  type ReferenceType
} from '../../services/alertService';

// Alert creation form schema
const alertCreateSchema = z.object({
  alertType: z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'PURCHASE_ORDER_DUE', 'PURCHASE_ORDER_OVERDUE', 'INVENTORY_ADJUSTMENT', 'SYSTEM_ALERT']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  message: z.string().min(1, 'Message is required'),
  referenceType: z.enum(['INVENTORY', 'PURCHASE_ORDER', 'PRODUCT', 'WAREHOUSE', 'SYSTEM']).optional(),
  referenceId: z.number().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  notes: z.string().optional(),
});

type AlertCreateFormData = z.infer<typeof alertCreateSchema>;

const AlertManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [creatingAlert, setCreatingAlert] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlertCreateFormData>({
    resolver: zodResolver(alertCreateSchema),
    defaultValues: {
      alertType: 'SYSTEM_ALERT',
      severity: 'MEDIUM',
      priority: 'NORMAL',
    },
  });

  // Load alerts
  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await alertService.getAlerts({ 
        page, 
        size: 20 
      });
      
      if (response.success) {
        setAlerts(response.data);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / 20));
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
  }, [page]);

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setViewDialogOpen(true);
  };

  const handleCreateAlert = () => {
    reset();
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    reset();
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedAlert(null);
  };

  const onSubmitCreateAlert = async (data: AlertCreateFormData) => {
    try {
      setCreatingAlert(true);
      setError(null);

      const alertData: AlertRequest = {
        alertType: data.alertType,
        severity: data.severity,
        title: data.title,
        message: data.message,
        priority: data.priority,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        notes: data.notes,
      };

      const response = await alertService.createAlert(alertData);

      if (response.success) {
        setCreateDialogOpen(false);
        setSuccess('Alert created successfully');
        loadAlerts();
      } else {
        setError(response.message || 'Failed to create alert');
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('Failed to create alert');
    } finally {
      setCreatingAlert(false);
    }
  };

  const handleStatusUpdate = async (alertId: number, newStatus: AlertStatus) => {
    try {
      setUpdatingStatus(alertId);
      setError(null);

      const response = await alertService.updateAlertStatus(alertId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`
      });

      if (response.success) {
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.id === alertId 
              ? { ...alert, status: newStatus }
              : alert
          )
        );
        setSuccess(`Alert status updated to ${newStatus}`);
      } else {
        setError(response.message || 'Failed to update alert status');
      }
    } catch (err) {
      console.error('Error updating alert status:', err);
      setError('Failed to update alert status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleGenerateAlerts = async () => {
    try {
      setError(null);
      const response = await alertService.generateAlerts();
      
      if (response.success) {
        setSuccess('Alerts generated successfully');
        loadAlerts();
      } else {
        setError(response.message || 'Failed to generate alerts');
      }
    } catch (err) {
      console.error('Error generating alerts:', err);
      setError('Failed to generate alerts');
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

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || alert.alertType === filterType;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesSeverity && matchesStatus && matchesPriority;
  });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterSeverity('all');
    setFilterStatus('all');
    setFilterPriority('all');
  };

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={400}>
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
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleGenerateAlerts}
            >
              Generate Alerts
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateAlert}
            >
              Create Alert
            </Button>
          </Box>
        </Box>

        {/* Error/Success Alerts */}
        {error && (
          <MuiAlert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </MuiAlert>
        )}

        {success && (
          <MuiAlert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </MuiAlert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
                    <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                    <MenuItem value="PURCHASE_ORDER_DUE">PO Due</MenuItem>
                    <MenuItem value="PURCHASE_ORDER_OVERDUE">PO Overdue</MenuItem>
                    <MenuItem value="INVENTORY_ADJUSTMENT">Inventory Adjustment</MenuItem>
                    <MenuItem value="SYSTEM_ALERT">System Alert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    label="Severity"
                  >
                    <MenuItem value="all">All Severities</MenuItem>
                    <MenuItem value="CRITICAL">Critical</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="DISMISSED">Dismissed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Priority"
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="URGENT">Urgent</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="NORMAL">Normal</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={1}>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  fullWidth
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Alert</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {alert.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.message.length > 100 
                              ? `${alert.message.substring(0, 100)}...` 
                              : alert.message
                            }
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.alertType.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getSeverityIcon(alert.severity)}
                          <Chip
                            label={alert.severity}
                            size="small"
                            color={getSeverityColor(alert.severity) as any}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.priority}
                          size="small"
                          color={getPriorityColor(alert.priority) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.status}
                          size="small"
                          color={getStatusColor(alert.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatTimestamp(alert.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {alert.createdBy.firstName} {alert.createdBy.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAlert(alert)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          {alert.status === 'ACTIVE' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleStatusUpdate(alert.id, 'ACKNOWLEDGED')}
                              disabled={updatingStatus === alert.id}
                            >
                              {updatingStatus === alert.id ? <CircularProgress size={16} /> : 'Acknowledge'}
                            </Button>
                          )}
                          
                          {alert.status === 'ACKNOWLEDGED' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleStatusUpdate(alert.id, 'RESOLVED')}
                              disabled={updatingStatus === alert.id}
                            >
                              {updatingStatus === alert.id ? <CircularProgress size={16} /> : 'Resolve'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredAlerts.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No alerts found
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* View Alert Dialog */}
        <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Alert Details
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedAlert && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {selectedAlert.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {selectedAlert.message}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Alert Type
                    </Typography>
                    <Chip
                      label={selectedAlert.alertType.replace(/_/g, ' ')}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Severity
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      {getSeverityIcon(selectedAlert.severity)}
                      <Chip
                        label={selectedAlert.severity}
                        size="small"
                        color={getSeverityColor(selectedAlert.severity) as any}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={selectedAlert.priority}
                      size="small"
                      color={getPriorityColor(selectedAlert.priority) as any}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedAlert.status}
                      size="small"
                      color={getStatusColor(selectedAlert.status) as any}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  
                  {selectedAlert.referenceType && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Reference Type
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedAlert.referenceType}
                      </Typography>
                    </Grid>
                  )}
                  
                  {selectedAlert.referenceId && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Reference ID
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedAlert.referenceId}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Triggered At
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formatTimestamp(selectedAlert.triggeredAt)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formatTimestamp(selectedAlert.createdAt)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedAlert.createdBy.firstName} {selectedAlert.createdBy.lastName}
                    </Typography>
                  </Grid>
                  
                  {selectedAlert.updatedBy && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Updated By
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedAlert.updatedBy.firstName} {selectedAlert.updatedBy.lastName}
                      </Typography>
                    </Grid>
                  )}
                  
                  {selectedAlert.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedAlert.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Create Alert Dialog */}
        <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Create New Alert
            </Typography>
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmitCreateAlert)}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="alertType"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.alertType}>
                        <InputLabel>Alert Type</InputLabel>
                        <Select {...field} label="Alert Type">
                          <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
                          <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
                          <MenuItem value="PURCHASE_ORDER_DUE">Purchase Order Due</MenuItem>
                          <MenuItem value="PURCHASE_ORDER_OVERDUE">Purchase Order Overdue</MenuItem>
                          <MenuItem value="INVENTORY_ADJUSTMENT">Inventory Adjustment</MenuItem>
                          <MenuItem value="SYSTEM_ALERT">System Alert</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="severity"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.severity}>
                        <InputLabel>Severity</InputLabel>
                        <Select {...field} label="Severity">
                          <MenuItem value="LOW">Low</MenuItem>
                          <MenuItem value="MEDIUM">Medium</MenuItem>
                          <MenuItem value="HIGH">High</MenuItem>
                          <MenuItem value="CRITICAL">Critical</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Title"
                        fullWidth
                        error={!!errors.title}
                        helperText={errors.title?.message}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Message"
                        multiline
                        rows={3}
                        fullWidth
                        error={!!errors.message}
                        helperText={errors.message?.message}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.priority}>
                        <InputLabel>Priority</InputLabel>
                        <Select {...field} label="Priority">
                          <MenuItem value="LOW">Low</MenuItem>
                          <MenuItem value="NORMAL">Normal</MenuItem>
                          <MenuItem value="HIGH">High</MenuItem>
                          <MenuItem value="URGENT">Urgent</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="referenceType"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Reference Type (Optional)</InputLabel>
                        <Select {...field} label="Reference Type (Optional)">
                          <MenuItem value="INVENTORY">Inventory</MenuItem>
                          <MenuItem value="PURCHASE_ORDER">Purchase Order</MenuItem>
                          <MenuItem value="PRODUCT">Product</MenuItem>
                          <MenuItem value="WAREHOUSE">Warehouse</MenuItem>
                          <MenuItem value="SYSTEM">System</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="referenceId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Reference ID (Optional)"
                        type="number"
                        fullWidth
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Notes (Optional)"
                        multiline
                        rows={2}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCreateDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={creatingAlert}
              >
                {creatingAlert ? <CircularProgress size={20} /> : 'Create Alert'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
        >
          <MuiAlert onClose={() => setSuccess(null)} severity="success">
            {success}
          </MuiAlert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default AlertManagement; 