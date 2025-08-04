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
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  PlayArrow,
  Settings,
  TrendingUp,
  Inventory,
  Warning,
  CheckCircle,
  Schedule,
  AutoAwesome,
  Refresh,
  Visibility,
  ShoppingCart,
  Business,
  LocalShipping,
  AttachMoney,
  Timeline,
  Analytics,
} from '@mui/icons-material';
import MainLayout from '../../components/layout/MainLayout';
import AutomatedPurchaseOrderService from '../../services/automatedPurchaseOrderService';
import { formatDate, formatCurrency } from '../../utils/formatters';

// Local interface definition
interface AutomatedPOStatus {
  automatedWorkflow: {
    schedule: string;
    lastRun: string;
    nextRun: string;
    enabled: boolean;
  };
  businessRules: {
    lowStockThreshold: string;
    minimumOrderQuantity: string;
    leadTime: string;
    safetyStock: string;
  };
  automationFeatures: {
    demandAnalysis: string;
    supplierSelection: string;
    quantityCalculation: string;
    costEstimation: string;
  };
}

const AutomatedPurchaseOrderManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [automatedStatus, setAutomatedStatus] = useState<AutomatedPOStatus | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [reorderSuggestions, setReorderSuggestions] = useState<any[]>([]);
  const [generatingPOs, setGeneratingPOs] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [suggestionsDialogOpen, setSuggestionsDialogOpen] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statusResponse, lowStockResponse, suggestionsResponse] = await Promise.all([
        AutomatedPurchaseOrderService.getAutomatedPOStatus(),
        AutomatedPurchaseOrderService.getLowStockProducts(),
        AutomatedPurchaseOrderService.getReorderSuggestions(),
      ]);

      if (statusResponse.success) {
        setAutomatedStatus(statusResponse.data);
      }
      if (lowStockResponse.success) {
        setLowStockProducts(lowStockResponse.data);
      }
      if (suggestionsResponse.success) {
        setReorderSuggestions(suggestionsResponse.data);
      }
    } catch (err) {
      console.error('Error loading automated PO data:', err);
      setError('Failed to load automated PO data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle generate automated POs
  const handleGenerateAutomatedPOs = async () => {
    try {
      setGeneratingPOs(true);
      setError(null);
      const response = await AutomatedPurchaseOrderService.generateAutomatedPOs();
      
      if (response.success) {
        setSuccess('Automated purchase orders generated successfully!');
        loadData(); // Refresh data
      } else {
        setError(response.message || 'Failed to generate automated POs');
      }
    } catch (err) {
      console.error('Error generating automated POs:', err);
      setError('Failed to generate automated purchase orders');
    } finally {
      setGeneratingPOs(false);
    }
  };

  // Handle generate PO for specific product
  const handleGeneratePOForProduct = async (productId: number, warehouseId: number) => {
    try {
      setError(null);
      const response = await AutomatedPurchaseOrderService.generateAutomatedPOForProduct(productId, warehouseId);
      
      if (response.success) {
        setSuccess(`Automated PO generated for product ID: ${productId}`);
        loadData(); // Refresh data
      } else {
        setError(response.message || 'Failed to generate automated PO');
      }
    } catch (err) {
      console.error('Error generating automated PO for product:', err);
      setError('Failed to generate automated PO for product');
    }
  };

  const getStockLevelColor = (available: number, reorderPoint: number) => {
    if (available === 0) return 'error';
    if (available <= reorderPoint) return 'warning';
    return 'success';
  };

  const getStockLevelText = (available: number, reorderPoint: number) => {
    if (available === 0) return 'Out of Stock';
    if (available <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Automated Purchase Orders
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              Intelligent inventory management with automated reorder suggestions, demand forecasting, and supplier optimization
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setStatusDialogOpen(true)}
            >
              Configuration
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleGenerateAutomatedPOs}
              disabled={generatingPOs}
            >
              {generatingPOs ? <CircularProgress size={20} /> : 'Generate POs'}
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Automation Status Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AutoAwesome color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Automation Status</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Next Run: {automatedStatus?.automatedWorkflow.nextRun || 'Not scheduled'}
                </Typography>
                <Chip 
                  label={automatedStatus?.automatedWorkflow.enabled ? 'Active' : 'Inactive'} 
                  color={automatedStatus?.automatedWorkflow.enabled ? 'success' : 'default'}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Warning color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Low Stock Items</Typography>
                </Box>
                <Typography variant="h4" color="warning.main" mb={1}>
                  {lowStockProducts.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items below reorder point
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Reorder Suggestions</Typography>
                </Box>
                <Typography variant="h4" color="info.main" mb={1}>
                  {reorderSuggestions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-powered recommendations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Low Stock Products Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Low Stock Products</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={loadData}
              >
                Refresh
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Reorder Point</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Suggested Qty</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={`${product.productId}-${product.warehouseId}`} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {product.sku}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{product.warehouseName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.quantityAvailable}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.reorderPoint}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStockLevelText(product.quantityAvailable, product.reorderPoint)}
                          color={getStockLevelColor(product.quantityAvailable, product.reorderPoint) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.suggestedQuantity || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Generate Automated PO">
                          <IconButton
                            size="small"
                            onClick={() => handleGeneratePOForProduct(product.productId, product.warehouseId)}
                            color="primary"
                          >
                            <ShoppingCart />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Reorder Suggestions */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">AI Reorder Suggestions</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                onClick={() => setSuggestionsDialogOpen(true)}
              >
                View Details
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              {reorderSuggestions.slice(0, 6).map((suggestion, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {suggestion.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Suggested: {suggestion.suggestedQuantity} units
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Est. Cost: {formatCurrency(suggestion.estimatedCost)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Configuration Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Automation Configuration</DialogTitle>
          <DialogContent>
            {automatedStatus && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" mb={2}>Workflow Schedule</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Schedule /></ListItemIcon>
                      <ListItemText 
                        primary="Schedule" 
                        secondary={automatedStatus.automatedWorkflow.schedule} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Timeline /></ListItemIcon>
                      <ListItemText 
                        primary="Last Run" 
                        secondary={automatedStatus.automatedWorkflow.lastRun} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircle /></ListItemIcon>
                      <ListItemText 
                        primary="Status" 
                        secondary={automatedStatus.automatedWorkflow.enabled ? 'Active' : 'Inactive'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" mb={2}>Business Rules</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Warning /></ListItemIcon>
                      <ListItemText 
                        primary="Low Stock Threshold" 
                        secondary={automatedStatus.businessRules.lowStockThreshold} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Inventory /></ListItemIcon>
                      <ListItemText 
                        primary="Minimum Order Qty" 
                        secondary={automatedStatus.businessRules.minimumOrderQuantity} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocalShipping /></ListItemIcon>
                      <ListItemText 
                        primary="Lead Time" 
                        secondary={automatedStatus.businessRules.leadTime} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Suggestions Details Dialog */}
        <Dialog open={suggestionsDialogOpen} onClose={() => setSuggestionsDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Reorder Suggestions Details</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Current Stock</TableCell>
                    <TableCell>Suggested Qty</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Est. Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reorderSuggestions.map((suggestion, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{suggestion.productName}</TableCell>
                      <TableCell>{suggestion.supplierName}</TableCell>
                      <TableCell>{suggestion.warehouseName}</TableCell>
                      <TableCell>{suggestion.currentStock}</TableCell>
                      <TableCell>{suggestion.suggestedQuantity}</TableCell>
                      <TableCell>{formatCurrency(suggestion.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(suggestion.estimatedCost)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleGeneratePOForProduct(suggestion.productId, suggestion.warehouseId)}
                        >
                          Generate PO
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuggestionsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default AutomatedPurchaseOrderManagement; 