import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Add,
  Remove,
  Warning,
  Inventory,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '../../components/layout/MainLayout';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import InventoryService from '../../services/inventoryService';
import ProductService from '../../services/productService';
import WarehouseService from '../../services/warehouseService';
import type { InventoryItem, StockAdjustmentData } from '../../types/inventory';

// Stock adjustment form schema
const stockAdjustmentSchema = z.object({
  quantity: z.string().min(1, 'Quantity is required'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

// Inventory creation form schema
const inventoryCreationSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  quantityOnHand: z.string().min(1, 'Quantity is required'),
  quantityReserved: z.string().min(1, 'Reserved quantity is required'),
  notes: z.string().optional(),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;
type InventoryCreationFormData = z.infer<typeof inventoryCreationSchema>;

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      quantity: '',
      reason: '',
      notes: '',
    },
  });

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<InventoryCreationFormData>({
    resolver: zodResolver(inventoryCreationSchema),
    defaultValues: {
      productId: '',
      warehouseId: '',
      quantityOnHand: '',
      quantityReserved: '',
      notes: '',
    },
  });



  // Load inventory data
  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await InventoryService.getInventorySummary({
        page: 0,
        size: 100,
        stockStatus: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
      });
      
      if (response.success) {
        setInventory(response.data);
      } else {
        setError('Failed to load inventory data');
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  // Load products and warehouses for creation
  const loadProductsAndWarehouses = async () => {
    try {
      // Load products using ProductService
      const productsResponse = await ProductService.getProducts({ isActive: true });
      if (productsResponse.success) {
        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data.content;
        setProducts(productsData);
      }

      // Load warehouses using WarehouseService
      const warehousesResponse = await WarehouseService.getActiveWarehouses();
      if (warehousesResponse.success) {
        setWarehouses(warehousesResponse.data);
      }
    } catch (err) {
      console.error('Error loading products/warehouses:', err);
    }
  };

  // Create inventory
  const onCreateInventory = async (data: InventoryCreationFormData) => {
    try {
      const response = await InventoryService.createInventory({
        productId: Number(data.productId),
        warehouseId: Number(data.warehouseId),
        quantityOnHand: Number(data.quantityOnHand),
        quantityReserved: Number(data.quantityReserved),
        notes: data.notes,
      });
      
      if (response.success) {
        setCreateDialogOpen(false);
        resetCreate();
        loadInventory(); // Reload data
      } else {
        setError('Failed to create inventory');
      }
    } catch (err) {
      console.error('Error creating inventory:', err);
      setError('Failed to create inventory');
    }
  };



  useEffect(() => {
    loadInventory();
    loadProductsAndWarehouses();
  }, [filterStatus]);

  const handleStockAdjustment = (item: InventoryItem, type: 'add' | 'remove') => {
    console.log('Opening stock adjustment dialog:', { item, type });
    setSelectedItem(item);
    setAdjustmentType(type);
    reset();
    setAdjustmentDialogOpen(true);
  };

  const onSubmitAdjustment = async (data: StockAdjustmentFormData) => {
    console.log('Submitting stock adjustment:', { data, selectedItem, adjustmentType });
    
    if (!selectedItem) {
      console.error('No selected item for stock adjustment');
      return;
    }

    try {
      // First, test if we can access other authenticated endpoints
      console.log('Testing authentication with inventory endpoint...');
      try {
        const testResponse = await InventoryService.getInventorySummary();
        console.log('Inventory test successful:', testResponse.success);
      } catch (testErr) {
        console.error('Inventory test failed:', testErr);
      }

      const requestData = {
        productId: selectedItem.product.id,
        warehouseId: selectedItem.warehouse.id,
        quantityChange: adjustmentType === 'add' ? Number(data.quantity) : -Number(data.quantity),
        movementType: (adjustmentType === 'add' ? 'IN' : 'OUT') as 'IN' | 'OUT',
        referenceType: 'ADJUSTMENT',
        notes: `${data.reason}${data.notes ? ` - ${data.notes}` : ''}`,
      };
      
      console.log('Sending request to API:', requestData);
      
      const response = await InventoryService.updateInventory(requestData);
      
      console.log('API response:', response);
      
      if (response.success) {
        console.log('Stock adjustment successful');
        setAdjustmentDialogOpen(false);
        setSelectedItem(null);
        loadInventory(); // Reload data
      } else {
        console.error('Stock adjustment failed:', response.message);
        setError('Failed to adjust stock: ' + response.message);
      }
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError('Failed to adjust stock: ' + (err as any)?.message || 'Unknown error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateStatus = (item: InventoryItem): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (item.quantityAvailable <= 0) {
      return 'out_of_stock';
    } else if (item.quantityAvailable <= item.product.reorderPoint) {
      return 'low_stock';
    } else {
      return 'in_stock';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  const filteredInventory = (inventory || []).filter(item => {
    const matchesSearch = 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const itemStatus = calculateStatus(item);
    const matchesStatus = filterStatus === 'all' || itemStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
              Inventory Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor and manage inventory levels across all warehouses
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ px: 3 }}
          >
            Create Inventory
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Inventory Summary */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventory?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warehouse sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventory?.filter(item => calculateStatus(item) === 'in_stock').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventory?.filter(item => calculateStatus(item) === 'low_stock').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventory?.filter(item => calculateStatus(item) === 'out_of_stock').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="in_stock">In Stock</MenuItem>
                  <MenuItem value="low_stock">Low Stock</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell align="right">Available</TableCell>
                    <TableCell align="right">Reserved</TableCell>
                    <TableCell align="right">Reorder Point</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.product.sku} • {item.product.category.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Warehouse fontSize="small" color="action" />
                          {item.warehouse.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatNumber(item.quantityAvailable)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatNumber(item.quantityReserved)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {formatNumber(item.product.reorderPoint)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(calculateStatus(item))}
                          color={getStatusColor(calculateStatus(item)) as any}
                          size="small"
                          icon={calculateStatus(item) === 'low_stock' ? <Warning /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.lastUpdatedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Add Stock">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStockAdjustment(item, 'add')}
                            >
                              <Add />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Stock">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleStockAdjustment(item, 'remove')}
                            >
                              <Remove />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Stock Adjustment Dialog */}
        <Dialog open={adjustmentDialogOpen} onClose={() => setAdjustmentDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
            {selectedItem && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedItem.product.name} - {selectedItem.warehouse.name}
              </Typography>
            )}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmitAdjustment)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantity"
                      type="number"
                      fullWidth
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Reason"
                      fullWidth
                      error={!!errors.reason}
                      helperText={errors.reason?.message}
                    />
                  )}
                />
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (Optional)"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAdjustmentDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color={adjustmentType === 'add' ? 'success' : 'error'}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={20} /> : (adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Create Inventory Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Inventory</DialogTitle>
          <form onSubmit={handleCreateSubmit(onCreateInventory)}>
            <DialogContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Controller
                  name="productId"
                  control={createControl}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!createErrors.productId}>
                      <InputLabel>Product</InputLabel>
                      <Select {...field} label="Product" value={field.value || ''}>
                        <MenuItem value="" disabled>
                          <em>Select a product</em>
                        </MenuItem>
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.sku})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                <Controller
                  name="warehouseId"
                  control={createControl}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!createErrors.warehouseId}>
                      <InputLabel>Warehouse</InputLabel>
                      <Select {...field} label="Warehouse" value={field.value || ''}>
                        <MenuItem value="" disabled>
                          <em>Select a warehouse</em>
                        </MenuItem>
                        {warehouses.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name} ({warehouse.code})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                <Controller
                  name="quantityOnHand"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantity On Hand"
                      type="number"
                      fullWidth
                      error={!!createErrors.quantityOnHand}
                      helperText={createErrors.quantityOnHand?.message}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                <Controller
                  name="quantityReserved"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantity Reserved"
                      type="number"
                      fullWidth
                      error={!!createErrors.quantityReserved}
                      helperText={createErrors.quantityReserved?.message}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
                <Controller
                  name="notes"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (Optional)"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!createErrors.notes}
                      helperText={createErrors.notes?.message}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating}
              >
                {isCreating ? <CircularProgress size={20} /> : 'Create Inventory'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default InventoryManagement; 