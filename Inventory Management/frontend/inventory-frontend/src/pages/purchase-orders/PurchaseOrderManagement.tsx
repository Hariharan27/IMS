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
  Alert,
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
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Visibility,
  Delete,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  Warning,
  CalendarToday,
  Business,
  Person,
  AttachMoney,
  Inventory,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '../../components/layout/MainLayout';
import { formatDate, formatCurrency } from '../../utils/formatters';
import PurchaseOrderService from '../../services/purchaseOrderService';
import ProductService from '../../services/productService';
import SupplierService from '../../services/supplierService';
import WarehouseService from '../../services/warehouseService';
import type { 
  PurchaseOrder, 
  PurchaseOrderStatus, 
  PurchaseOrderRequest,
  PurchaseOrderItemRequest,
  Product,
  Supplier,
  Warehouse 
} from '../../types/purchaseOrder';

// Purchase order form schema
const purchaseOrderSchema = z.object({
  supplierId: z.number().min(1, 'Supplier is required'),
  warehouseId: z.number().min(1, 'Warehouse is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().min(1, 'Product is required'),
    quantityOrdered: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

const PurchaseOrderManagement: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: 0,
      warehouseId: 0,
      orderDate: new Date().toISOString().split('T')[0],
      items: [{ productId: 0, quantityOrdered: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, productsResponse, suppliersResponse, warehousesResponse] = await Promise.all([
        PurchaseOrderService.getPurchaseOrders(),
        ProductService.getProducts(),
        SupplierService.getSuppliers(),
        WarehouseService.getActiveWarehouses(),
      ]);

      if (ordersResponse.success) {
        setPurchaseOrders(ordersResponse.data);
      }
      if (productsResponse.success) {
        setProducts(productsResponse.data);
      }
      if (suppliersResponse.success) {
        setSuppliers(suppliersResponse.data);
      }
      if (warehousesResponse.success) {
        setWarehouses(warehousesResponse.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle create purchase order
  const handleCreateOrder = () => {
    reset();
    setCreateDialogOpen(true);
  };

  // Handle view purchase order
  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  // Handle submit create order
  const onSubmitCreateOrder = async (data: PurchaseOrderFormData) => {
    try {
      setCreatingOrder(true);
      const requestData: PurchaseOrderRequest = {
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        orderDate: data.orderDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        notes: data.notes,
        items: data.items,
      };

      const response = await PurchaseOrderService.createPurchaseOrder(requestData);
      
      if (response.success) {
        setCreateDialogOpen(false);
        reset();
        loadData(); // Reload data
      } else {
        setError('Failed to create purchase order: ' + response.message);
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
      setError('Failed to create purchase order');
    } finally {
      setCreatingOrder(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: number, newStatus: PurchaseOrderStatus) => {
    try {
      const response = await PurchaseOrderService.updatePurchaseOrderStatus(orderId, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
      });
      
      if (response.success) {
        loadData(); // Reload data
      } else {
        setError('Failed to update status: ' + response.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  // Get status color
  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'SUBMITTED':
        return 'info';
      case 'APPROVED':
        return 'primary';
      case 'ORDERED':
        return 'warning';
      case 'PARTIALLY_RECEIVED':
        return 'secondary';
      case 'FULLY_RECEIVED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSupplier = filterSupplier === 'all' || order.supplier.id.toString() === filterSupplier;
    const matchesWarehouse = filterWarehouse === 'all' || order.warehouse.id.toString() === filterWarehouse;
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesWarehouse;
  });

  // Add item to form
  const addItem = () => {
    append({ productId: 0, quantityOrdered: 1, unitPrice: 0 });
  };

  // Remove item from form
  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

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
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 2 }}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2,
              }}
            >
              Purchase Orders
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                wordBreak: 'break-word',
              }}
            >
              Manage purchase orders and track inventory procurement
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateOrder}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              minWidth: { sm: 'auto' }
            }}
          >
            Create Order
          </Button>
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
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  placeholder="Search orders..."
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
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="SUBMITTED">Submitted</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="ORDERED">Ordered</MenuItem>
                    <MenuItem value="PARTIALLY_RECEIVED">Partially Received</MenuItem>
                    <MenuItem value="FULLY_RECEIVED">Fully Received</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={filterSupplier}
                    onChange={(e) => setFilterSupplier(e.target.value)}
                    label="Supplier"
                  >
                    <MenuItem value="all">All Suppliers</MenuItem>
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Warehouse</InputLabel>
                  <Select
                    value={filterWarehouse}
                    onChange={(e) => setFilterWarehouse(e.target.value)}
                    label="Warehouse"
                  >
                    <MenuItem value="all">All Warehouses</MenuItem>
                    {warehouses.map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Purchase Orders Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell>Expected Delivery</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {order.poNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.supplier.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.supplier.code}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.warehouse.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.replace('_', ' ')}
                          color={getStatusColor(order.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.orderDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'Not set'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Inventory fontSize="small" color="action" />
                          <Typography variant="body2">
                            {order.itemCount} items
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {order.status === 'DRAFT' && (
                            <Tooltip title="Edit Order">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredOrders.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No purchase orders found matching your criteria
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Create Purchase Order Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Create Purchase Order
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmitCreateOrder)}>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Basic Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="supplierId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.supplierId}>
                        <InputLabel>Supplier</InputLabel>
                        <Select {...field} label="Supplier">
                          {suppliers.map((supplier) => (
                            <MenuItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="warehouseId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.warehouseId}>
                        <InputLabel>Warehouse</InputLabel>
                        <Select {...field} label="Warehouse">
                          {warehouses.map((warehouse) => (
                            <MenuItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="orderDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Order Date"
                        type="date"
                        fullWidth
                        error={!!errors.orderDate}
                        helperText={errors.orderDate?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="expectedDeliveryDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Expected Delivery Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
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
                        label="Notes"
                        multiline
                        rows={3}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                {/* Items */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Order Items
                    </Typography>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={addItem}
                    >
                      Add Item
                    </Button>
                  </Box>
                </Grid>

                {fields.map((field, index) => (
                  <Grid item xs={12} key={field.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Controller
                              name={`items.${index}.productId`}
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth error={!!errors.items?.[index]?.productId}>
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
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Controller
                              name={`items.${index}.quantityOrdered`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Quantity"
                                  type="number"
                                  fullWidth
                                  error={!!errors.items?.[index]?.quantityOrdered}
                                  helperText={errors.items?.[index]?.quantityOrdered?.message}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={2}>
                            <Controller
                              name={`items.${index}.unitPrice`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Unit Price"
                                  type="number"
                                  fullWidth
                                  error={!!errors.items?.[index]?.unitPrice}
                                  helperText={errors.items?.[index]?.unitPrice?.message}
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Controller
                              name={`items.${index}.notes`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label="Notes"
                                  fullWidth
                                />
                              )}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={1}>
                            <IconButton
                              onClick={() => removeItem(index)}
                              disabled={fields.length === 1}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={creatingOrder}
              >
                {creatingOrder ? <CircularProgress size={20} /> : 'Create Order'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* View Purchase Order Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Purchase Order Details
            {selectedOrder && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedOrder.poNumber}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box>
                {/* Basic Information */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Supplier</Typography>
                    <Typography variant="body1">{selectedOrder.supplier.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Warehouse</Typography>
                    <Typography variant="body1">{selectedOrder.warehouse.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1">{formatDate(selectedOrder.orderDate)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Expected Delivery</Typography>
                    <Typography variant="body1">
                      {selectedOrder.expectedDeliveryDate ? formatDate(selectedOrder.expectedDeliveryDate) : 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip
                      label={selectedOrder.status.replace('_', ' ')}
                      color={getStatusColor(selectedOrder.status) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedOrder.totalAmount)}
                    </Typography>
                  </Grid>
                  {selectedOrder.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                      <Typography variant="body1">{selectedOrder.notes}</Typography>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Items */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Order Items
                </Typography>
                <List>
                  {selectedOrder.items.map((item) => (
                    <ListItem key={item.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {item.product.name}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formatCurrency(item.totalPrice)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              SKU: {item.product.sku} | Quantity: {item.quantityOrdered} | 
                              Unit Price: {formatCurrency(item.unitPrice)} | 
                              Received: {item.quantityReceived}
                            </Typography>
                            {item.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Notes: {item.notes}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={item.fullyReceived ? 'Fully Received' : item.partiallyReceived ? 'Partially Received' : 'Not Received'}
                          color={item.fullyReceived ? 'success' : item.partiallyReceived ? 'warning' : 'default'}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default PurchaseOrderManagement; 