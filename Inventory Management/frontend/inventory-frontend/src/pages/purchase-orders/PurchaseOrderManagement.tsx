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
  Settings,
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
  supplierId: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }).refine((val) => val && val > 0, 'Supplier is required'),
  warehouseId: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }).refine((val) => val && val > 0, 'Warehouse is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.union([z.string(), z.number()]).transform((val) => {
      if (typeof val === 'string') return parseInt(val, 10);
      return val;
    }).refine((val) => val && val > 0, 'Product is required'),
    quantityOrdered: z.union([z.string(), z.number()]).transform((val) => {
      if (typeof val === 'string') return parseInt(val, 10);
      return val;
    }).refine((val) => val && val > 0, 'Quantity must be at least 1'),
    unitPrice: z.union([z.string(), z.number()]).transform((val) => {
      if (typeof val === 'string') return parseFloat(val);
      return val;
    }).refine((val) => val >= 0, 'Unit price must be non-negative'),
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<PurchaseOrderStatus>('DRAFT');
  
  // State for receive items dialog
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [receiveItems, setReceiveItems] = useState<Array<{itemId: number, quantityReceived: number, notes: string}>>([]);
  const [receivingItems, setReceivingItems] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      warehouseId: '',
      orderDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantityOrdered: 1, unitPrice: 0 }],
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
        // Handle both paginated and direct array responses
        const productsData = productsResponse.data;
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else if (productsData && typeof productsData === 'object' && 'content' in productsData) {
          // Paginated response
          setProducts(productsData.content);
        } else {
          console.error('Unexpected products data structure:', productsData);
          setProducts([]);
        }
      }
      if (suppliersResponse.success) {
        // Handle both paginated and direct array responses
        const suppliersData = suppliersResponse.data;
        if (Array.isArray(suppliersData)) {
          setSuppliers(suppliersData);
        } else if (suppliersData && typeof suppliersData === 'object' && 'content' in suppliersData) {
          // Paginated response
          setSuppliers(suppliersData.content);
        } else {
          console.error('Unexpected suppliers data structure:', suppliersData);
          setSuppliers([]);
        }
      }
      if (warehousesResponse.success) {
        // Handle both paginated and direct array responses
        const warehousesData = warehousesResponse.data;
        if (Array.isArray(warehousesData)) {
          setWarehouses(warehousesData);
        } else if (warehousesData && typeof warehousesData === 'object' && 'content' in warehousesData) {
          // Paginated response
          setWarehouses(warehousesData.content);
        } else {
          console.error('Unexpected warehouses data structure:', warehousesData);
          setWarehouses([]);
        }
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

  // Handle edit purchase order
  const handleEditOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    // Populate form with existing data
    reset({
      supplierId: order.supplier.id,
      warehouseId: order.warehouse.id,
      orderDate: order.orderDate,
      expectedDeliveryDate: order.expectedDeliveryDate || '',
      notes: order.notes || '',
      items: order.items.map(item => ({
        productId: item.product.id,
        quantityOrdered: item.quantityOrdered,
        unitPrice: item.unitPrice,
        notes: item.notes || '',
      })),
    });
    setEditDialogOpen(true);
  };

  // Handle status update dialog
  const handleStatusUpdateDialog = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };
  
  const handleReceiveDialog = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    // Initialize receive items with ordered quantities
    const initialReceiveItems = order.items.map(item => ({
      itemId: item.id,
      quantityReceived: item.quantityOrdered, // Default to full quantity
      notes: ''
    }));
    setReceiveItems(initialReceiveItems);
    setReceiveDialogOpen(true);
  };

  // Get valid status transitions for an order
  const getValidStatusTransitions = (currentStatus: PurchaseOrderStatus): PurchaseOrderStatus[] => {
    switch (currentStatus) {
      case 'DRAFT':
        return ['SUBMITTED', 'CANCELLED'];
      case 'SUBMITTED':
        return ['APPROVED', 'CANCELLED'];
      case 'APPROVED':
        return ['ORDERED', 'CANCELLED'];
      case 'ORDERED':
        return ['PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED'];
      case 'PARTIALLY_RECEIVED':
        return ['FULLY_RECEIVED', 'CANCELLED'];
      case 'FULLY_RECEIVED':
        return ['CLOSED'];
      case 'CANCELLED':
      case 'CLOSED':
        return []; // No further transitions allowed
      default:
        return [];
    }
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

  // Handle submit edit order
  const onSubmitEditOrder = async (data: PurchaseOrderFormData) => {
    if (!selectedOrder) return;
    
    try {
      setUpdatingOrder(true);
      const requestData: PurchaseOrderRequest = {
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        orderDate: data.orderDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        notes: data.notes,
        items: data.items,
      };

      const response = await PurchaseOrderService.updatePurchaseOrder(selectedOrder.id, requestData);
      
      if (response.success) {
        setEditDialogOpen(false);
        reset();
        loadData(); // Reload data
      } else {
        setError('Failed to update purchase order: ' + response.message);
      }
    } catch (err) {
      console.error('Error updating purchase order:', err);
      setError('Failed to update purchase order');
    } finally {
      setUpdatingOrder(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      setUpdatingStatus(true);
      
      // For status changes, use the regular status update
      const response = await PurchaseOrderService.updatePurchaseOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
      });
      
      if (response.success) {
        setStatusDialogOpen(false);
        loadData(); // Reload data
      } else {
        setError('Failed to update status: ' + response.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Handle receiving items
  const handleReceiveItems = async () => {
    if (!selectedOrder) return;
    
    // Prevent multiple simultaneous calls
    if (receivingItems) {
      console.log('Receive process already in progress, ignoring duplicate call');
      return;
    }
    
    try {
      setReceivingItems(true);
      
      console.log('=== FRONTEND RECEIVE DEBUG ===');
      console.log('Starting receive process for PO:', selectedOrder.id);
      console.log('Current status:', selectedOrder.status);
      console.log('Items to receive:', receiveItems);
      
      // Check if the order is in APPROVED status first
      if (selectedOrder.status !== 'APPROVED') {
        setError('Purchase order must be in APPROVED status before receiving items. Please approve the order first.');
        return;
      }
      
      console.log('Calling receivePurchaseOrder API...');
      const response = await PurchaseOrderService.receivePurchaseOrder(selectedOrder.id, {
        receivedItems: receiveItems
      });
      console.log('API response received:', response);
      
      if (response.success) {
        setReceiveDialogOpen(false);
        loadData(); // Reload data
      } else {
        setError('Failed to receive items: ' + response.message);
      }
    } catch (err) {
      console.error('Error receiving items:', err);
      setError('Failed to receive items');
    } finally {
      setReceivingItems(false);
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
                    {Array.isArray(suppliers) && suppliers.map((supplier) => (
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
                    {Array.isArray(warehouses) && warehouses.map((warehouse) => (
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
                                onClick={() => handleEditOrder(order)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
                          {getValidStatusTransitions(order.status).length > 0 && (
                            <Tooltip title="Update Status">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleStatusUpdateDialog(order)}
                              >
                                <Settings />
                              </IconButton>
                            </Tooltip>
                          )}
                          {order.status === 'APPROVED' && (
                            <Tooltip title="Receive Items">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleReceiveDialog(order)}
                              >
                                <LocalShipping />
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
          {/* Debug info */}
          <div style={{ display: 'none' }}>
            Dialog open: {createDialogOpen.toString()}
          </div>
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
                          {Array.isArray(suppliers) && suppliers.map((supplier) => (
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
                          {Array.isArray(warehouses) && warehouses.map((warehouse) => (
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
                                    {Array.isArray(products) && products.map((product) => (
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

        {/* Edit Purchase Order Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Edit Purchase Order
            {selectedOrder && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedOrder.poNumber}
              </Typography>
            )}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmitEditOrder)}>
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
                          {Array.isArray(suppliers) && suppliers.map((supplier) => (
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
                          {Array.isArray(warehouses) && warehouses.map((warehouse) => (
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
              <Button onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updatingOrder}
              >
                {updatingOrder ? <CircularProgress size={20} /> : 'Update Order'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog 
          open={statusDialogOpen} 
          onClose={() => setStatusDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            Update Purchase Order Status
            {selectedOrder && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedOrder.poNumber}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PurchaseOrderStatus)}
                  label="New Status"
                >
                  {selectedOrder && getValidStatusTransitions(selectedOrder.status).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Status: <Chip 
                    label={selectedOrder?.status.replace('_', ' ')} 
                    color={getStatusColor(selectedOrder?.status || 'DRAFT') as any}
                    size="small"
                  />
                </Typography>
                
                {selectedOrder && getValidStatusTransitions(selectedOrder.status).length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This order has reached a terminal state and cannot be updated further.
                  </Alert>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              disabled={updatingStatus || (selectedOrder && getValidStatusTransitions(selectedOrder.status).length === 0)}
            >
              {updatingStatus ? <CircularProgress size={20} /> : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Receive Items Dialog */}
        <Dialog 
          open={receiveDialogOpen} 
          onClose={() => setReceiveDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            Receive Items
            {selectedOrder && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedOrder.poNumber}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Specify the quantity received for each item:
              </Typography>
              
              {receiveItems.map((item, index) => {
                const orderItem = selectedOrder?.items.find(oi => oi.id === item.itemId);
                return (
                  <Card key={item.itemId} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle2">
                          {orderItem?.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ordered: {orderItem?.quantityOrdered} units
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Quantity Received"
                          type="number"
                          value={item.quantityReceived}
                          onChange={(e) => {
                            const newItems = [...receiveItems];
                            newItems[index].quantityReceived = parseInt(e.target.value) || 0;
                            setReceiveItems(newItems);
                          }}
                          inputProps={{ min: 0, max: orderItem?.quantityOrdered }}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="Notes"
                          value={item.notes}
                          onChange={(e) => {
                            const newItems = [...receiveItems];
                            newItems[index].notes = e.target.value;
                            setReceiveItems(newItems);
                          }}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Card>
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReceiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReceiveItems}
              variant="contained"
              color="success"
              disabled={receivingItems}
            >
              {receivingItems ? <CircularProgress size={20} /> : 'Receive Items'}
            </Button>
          </DialogActions>
        </Dialog>
       </Box>
     </MainLayout>
   );
 };

export default PurchaseOrderManagement; 