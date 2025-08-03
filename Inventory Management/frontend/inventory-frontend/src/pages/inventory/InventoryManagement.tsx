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
import type { InventoryItem, StockAdjustmentData } from '../../types/inventory';

// Stock adjustment form schema
const stockAdjustmentSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

// Inventory creation form schema
const inventoryCreationSchema = z.object({
  productId: z.number().min(1, 'Product is required'),
  warehouseId: z.number().min(1, 'Warehouse is required'),
  quantityOnHand: z.number().min(0, 'Quantity must be non-negative'),
  quantityReserved: z.number().min(0, 'Reserved quantity must be non-negative'),
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
      quantity: 0,
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
      productId: 0,
      warehouseId: 0,
      quantityOnHand: 0,
      quantityReserved: 0,
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
      // Load products
      const productsResponse = await fetch('http://localhost:8080/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const productsData = await productsResponse.json();
      if (productsData.success) {
        setProducts(productsData.data);
      }

      // Load warehouses
      const warehousesResponse = await fetch('http://localhost:8080/api/warehouses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const warehousesData = await warehousesResponse.json();
      if (warehousesData.success) {
        setWarehouses(warehousesData.data);
      }
    } catch (err) {
      console.error('Error loading products/warehouses:', err);
    }
  };

  // Create inventory
  const onCreateInventory = async (data: InventoryCreationFormData) => {
    try {
      const response = await fetch('http://localhost:8080/api/inventory', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      if (result.success) {
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
    setSelectedItem(item);
    setAdjustmentType(type);
    reset();
    setAdjustmentDialogOpen(true);
  };

  const onSubmitAdjustment = async (data: StockAdjustmentFormData) => {
    if (!selectedItem) return;

    try {
      const response = await InventoryService.updateInventory({
        productId: selectedItem.product.id,
        warehouseId: selectedItem.warehouse.id,
        quantityChange: adjustmentType === 'add' ? data.quantity : -data.quantity,
        movementType: adjustmentType === 'add' ? 'IN' : 'OUT',
        referenceType: 'MANUAL_ADJUSTMENT',
        notes: `${data.reason}${data.notes ? ` - ${data.notes}` : ''}`,
      });
      
      if (response.success) {
        setAdjustmentDialogOpen(false);
        setSelectedItem(null);
        loadInventory(); // Reload data
      } else {
        setError('Failed to adjust stock');
      }
    } catch (err) {
      console.error('Error adjusting stock:', err);
      setError('Failed to adjust stock');
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
                      <Select {...field} label="Product">
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
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
                      <Select {...field} label="Warehouse">
                        {warehouses.map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
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