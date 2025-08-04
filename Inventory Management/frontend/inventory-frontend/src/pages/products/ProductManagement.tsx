import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormHelperText,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Inventory,
  TrendingUp,
  TrendingDown,
  Error as ErrorIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '../../components/layout/MainLayout';
import ProductService, { type Product, type Category } from '../../services/productService';
import { formatCurrency, formatNumber } from '../../utils/formatters';

// Zod schema for product creation
const productCreationSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200, 'Product name cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(50, 'SKU cannot exceed 50 characters')
    .regex(/^[A-Z0-9_-]+$/, 'SKU must contain only uppercase letters, numbers, hyphens, and underscores'),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().max(100, 'Brand cannot exceed 100 characters').optional(),
  model: z.string().max(100, 'Model cannot exceed 100 characters').optional(),
  weight: z.string().optional(),
  dimensions: z.string().max(100, 'Dimensions cannot exceed 100 characters').optional(),
  unitOfMeasure: z.string().max(20, 'Unit of measure cannot exceed 20 characters').optional(),
  costPrice: z.string().optional(),
  sellingPrice: z.string().optional(),
  reorderPoint: z.string().optional(),
  reorderQuantity: z.string().optional(),
});

type ProductCreationFormData = z.infer<typeof productCreationSchema>;

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Add Product Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  // View Product Details State
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);

  // Edit Product Dialog State
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(false);

  // Delete Product Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Form setup for Add Product
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductCreationFormData>({
    resolver: zodResolver(productCreationSchema),
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      categoryId: '',
      brand: '',
      model: '',
      weight: '',
      dimensions: '',
      unitOfMeasure: 'PCS',
      costPrice: '',
      sellingPrice: '',
      reorderPoint: '',
      reorderQuantity: '',
    },
  });

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {
        page: page - 1, // Backend uses 0-based pagination
        size: pageSize,
      };
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (selectedCategory !== 'all') {
        filters.categoryId = parseInt(selectedCategory);
      }
      
      if (statusFilter !== 'all') {
        filters.isActive = statusFilter === 'active';
      }

      const response = await ProductService.getProducts(filters);
      
      if (response.success) {
        if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalPages(1);
          setTotalElements(response.data.length);
        } else {
          setProducts(response.data.content);
          setTotalPages(response.data.totalPages);
          setTotalElements(response.data.totalElements);
        }
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await ProductService.getActiveCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle category filter
  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
    setPage(1);
  };

  // Handle status filter
  const handleStatusChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle Add Product Dialog
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    reset(); // Reset form when opening
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    reset(); // Reset form when closing
  };

  // Handle View Product Details Dialog
  const handleOpenViewDialog = async (product: Product) => {
    setSelectedProduct(product);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedProduct(null);
  };

  // Handle Edit Product Dialog
  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    // Pre-populate form with existing product data
    reset({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      categoryId: product.category.id.toString(),
      brand: product.brand || '',
      model: product.model || '',
      weight: product.weight?.toString() || '',
      dimensions: product.dimensions || '',
      unitOfMeasure: product.unitOfMeasure,
      costPrice: product.costPrice?.toString() || '',
      sellingPrice: product.sellingPrice?.toString() || '',
      reorderPoint: product.reorderPoint?.toString() || '',
      reorderQuantity: product.reorderQuantity?.toString() || '',
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedProduct(null);
    reset(); // Reset form when closing
  };

  // Handle Delete Product Dialog
  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedProduct(null);
  };

  // Handle Product Creation
  const onSubmitCreateProduct = async (data: ProductCreationFormData) => {
    try {
      setCreatingProduct(true);
      
      // Transform form data to match backend DTO
      const productData = {
        name: data.name,
        description: data.description || '',
        sku: data.sku,
        categoryId: parseInt(data.categoryId),
        brand: data.brand || '',
        model: data.model || '',
        weight: data.weight ? parseFloat(data.weight) : undefined,
        dimensions: data.dimensions || '',
        unitOfMeasure: data.unitOfMeasure || 'PCS',
        costPrice: data.costPrice ? parseFloat(data.costPrice) : undefined,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : undefined,
        reorderPoint: data.reorderPoint ? parseInt(data.reorderPoint) : 0,
        reorderQuantity: data.reorderQuantity ? parseInt(data.reorderQuantity) : 0,
        isActive: true, // Default to active when creating
      };

      const response = await ProductService.createProduct(productData);
      
      if (response.success) {
        // Close dialog and refresh products
        handleCloseAddDialog();
        loadProducts(); // Refresh the product list
        setError(null);
      } else {
        setError(response.message || 'Failed to create product');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product');
    } finally {
      setCreatingProduct(false);
    }
  };

  // Handle Product Update
  const onSubmitUpdateProduct = async (data: ProductCreationFormData) => {
    if (!selectedProduct) return;
    
    try {
      setEditingProduct(true);
      
      // Transform form data to match backend DTO
      const productData = {
        name: data.name,
        description: data.description || '',
        sku: data.sku,
        categoryId: parseInt(data.categoryId),
        brand: data.brand || '',
        model: data.model || '',
        weight: data.weight ? parseFloat(data.weight) : undefined,
        dimensions: data.dimensions || '',
        unitOfMeasure: data.unitOfMeasure || 'PCS',
        costPrice: data.costPrice ? parseFloat(data.costPrice) : undefined,
        sellingPrice: data.sellingPrice ? parseFloat(data.sellingPrice) : undefined,
        reorderPoint: data.reorderPoint ? parseInt(data.reorderPoint) : 0,
        reorderQuantity: data.reorderQuantity ? parseInt(data.reorderQuantity) : 0,
        isActive: selectedProduct.isActive, // Keep existing status
      };

      const response = await ProductService.updateProduct(selectedProduct.id, productData);
      
      if (response.success) {
        // Close dialog and refresh products
        handleCloseEditDialog();
        loadProducts(); // Refresh the product list
        setError(null);
      } else {
        setError(response.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product');
    } finally {
      setEditingProduct(false);
    }
  };

  // Handle Product Deletion
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      setDeletingProduct(true);
      
      const response = await ProductService.deleteProduct(selectedProduct.id);
      
      if (response.success) {
        // Close dialog and refresh products
        handleCloseDeleteDialog();
        loadProducts(); // Refresh the product list
        setError(null);
      } else {
        setError(response.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    } finally {
      setDeletingProduct(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadProducts();
  }, [page, searchTerm, selectedCategory, statusFilter]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  // Get status label
  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  // Get stock status
  const getStockStatus = (product: Product) => {
    // This would need to be calculated based on inventory data
    // For now, we'll show a placeholder
    return 'In Stock';
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
          Product Management
        </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
          >
            Add Product
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 2, alignItems: 'end' }}>
              <TextField
                label="Search Products"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search by name, SKU, or description..."
              />
              
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} onChange={handleCategoryChange} label="Category">
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} onChange={handleStatusChange} label="Status">
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell align="right">Cost Price</TableCell>
                        <TableCell align="right">Selling Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Stock Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No products found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="medium">
                                  {product.name}
                                </Typography>
                                {product.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {product.description.length > 50
                                      ? `${product.description.substring(0, 50)}...`
                                      : product.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label={product.sku} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={product.category.name} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {product.brand || '-'}
                            </TableCell>
                            <TableCell align="right">
                              {product.costPrice ? formatCurrency(product.costPrice) : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {product.sellingPrice ? formatCurrency(product.sellingPrice) : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(product.isActive)}
                                color={getStatusColor(product.isActive)}
                                size="small"
                                icon={product.isActive ? <CheckCircle /> : <Cancel />}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStockStatus(product)}
                                color="success"
                                size="small"
                                icon={<Inventory />}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenViewDialog(product)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Product">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenEditDialog(product)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Product">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(product)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Total: {totalElements} products
                      </Typography>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Product Dialog */}
        <Dialog 
          open={openAddDialog} 
          onClose={handleCloseAddDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Product</DialogTitle>
          <form onSubmit={handleSubmit(onSubmitCreateProduct)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Basic Information */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Product Name *"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          placeholder="Enter product name"
                        />
                      )}
                    />
                    <Controller
                      name="sku"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="SKU *"
                          fullWidth
                          error={!!errors.sku}
                          helperText={errors.sku?.message}
                          placeholder="e.g., LAPTOP001"
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                      )}
                    />
                  </Box>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        placeholder="Enter product description"
                      />
                    )}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.categoryId}>
                          <InputLabel>Category *</InputLabel>
                          <Select {...field} label="Category *">
                            <MenuItem value="" disabled>
                              <em>Select a category</em>
                            </MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.categoryId && (
                            <FormHelperText>{errors.categoryId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="unitOfMeasure"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Unit of Measure"
                          fullWidth
                          error={!!errors.unitOfMeasure}
                          helperText={errors.unitOfMeasure?.message}
                          placeholder="e.g., PCS, KG, L"
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Brand & Model */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Brand & Model
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Brand"
                          fullWidth
                          error={!!errors.brand}
                          helperText={errors.brand?.message}
                          placeholder="Enter brand name"
                        />
                      )}
                    />
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Model"
                          fullWidth
                          error={!!errors.model}
                          helperText={errors.model?.message}
                          placeholder="Enter model name"
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Physical Properties */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Physical Properties
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="weight"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Weight (kg)"
                          type="number"
                          fullWidth
                          error={!!errors.weight}
                          helperText={errors.weight?.message}
                          placeholder="0.0"
                          inputProps={{ step: 0.01, min: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name="dimensions"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Dimensions"
                          fullWidth
                          error={!!errors.dimensions}
                          helperText={errors.dimensions?.message}
                          placeholder="e.g., 10x5x2 cm"
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Pricing */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Pricing
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="costPrice"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Cost Price"
                          type="number"
                          fullWidth
                          error={!!errors.costPrice}
                          helperText={errors.costPrice?.message}
                          placeholder="0.00"
                          inputProps={{ step: 0.01, min: 0 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="sellingPrice"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Selling Price"
                          type="number"
                          fullWidth
                          error={!!errors.sellingPrice}
                          helperText={errors.sellingPrice?.message}
                          placeholder="0.00"
                          inputProps={{ step: 0.01, min: 0 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Inventory Management */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Inventory Management
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="reorderPoint"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reorder Point"
                          type="number"
                          fullWidth
                          error={!!errors.reorderPoint}
                          helperText={errors.reorderPoint?.message}
                          placeholder="0"
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name="reorderQuantity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reorder Quantity"
                          type="number"
                          fullWidth
                          error={!!errors.reorderQuantity}
                          helperText={errors.reorderQuantity?.message}
                          placeholder="0"
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddDialog} disabled={creatingProduct}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={creatingProduct}
                startIcon={creatingProduct ? <CircularProgress size={20} /> : <Add />}
              >
                {creatingProduct ? 'Creating...' : 'Create Product'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={handleCloseEditDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Product</DialogTitle>
          <form onSubmit={handleSubmit(onSubmitUpdateProduct)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Basic Information */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Product Name *"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
                          placeholder="Enter product name"
                        />
                      )}
                    />
                    <Controller
                      name="sku"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="SKU *"
                          fullWidth
                          error={!!errors.sku}
                          helperText={errors.sku?.message}
                          placeholder="e.g., LAPTOP001"
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                      )}
                    />
                  </Box>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        placeholder="Enter product description"
                      />
                    )}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.categoryId}>
                          <InputLabel>Category *</InputLabel>
                          <Select {...field} label="Category *">
                            <MenuItem value="" disabled>
                              <em>Select a category</em>
                            </MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.categoryId && (
                            <FormHelperText>{errors.categoryId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="unitOfMeasure"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Unit of Measure"
                          fullWidth
                          error={!!errors.unitOfMeasure}
                          helperText={errors.unitOfMeasure?.message}
                          placeholder="e.g., PCS, KG, L"
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Brand & Model */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Brand & Model
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Brand"
                          fullWidth
                          error={!!errors.brand}
                          helperText={errors.brand?.message}
                          placeholder="Enter brand name"
                        />
                      )}
                    />
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Model"
                          fullWidth
                          error={!!errors.model}
                          helperText={errors.model?.message}
                          placeholder="Enter model name"
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Physical Properties */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Physical Properties
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="weight"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Weight (kg)"
                          type="number"
                          fullWidth
                          error={!!errors.weight}
                          helperText={errors.weight?.message}
                          placeholder="0.0"
                          inputProps={{ step: 0.01, min: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name="dimensions"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Dimensions"
                          fullWidth
                          error={!!errors.dimensions}
                          helperText={errors.dimensions?.message}
                          placeholder="e.g., 10x5x2 cm"
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Pricing */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Pricing
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="costPrice"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Cost Price"
                          type="number"
                          fullWidth
                          error={!!errors.costPrice}
                          helperText={errors.costPrice?.message}
                          placeholder="0.00"
                          inputProps={{ step: 0.01, min: 0 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="sellingPrice"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Selling Price"
                          type="number"
                          fullWidth
                          error={!!errors.sellingPrice}
                          helperText={errors.sellingPrice?.message}
                          placeholder="0.00"
                          inputProps={{ step: 0.01, min: 0 }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>

                {/* Inventory Management */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Inventory Management
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name="reorderPoint"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reorder Point"
                          type="number"
                          fullWidth
                          error={!!errors.reorderPoint}
                          helperText={errors.reorderPoint?.message}
                          placeholder="0"
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                    <Controller
                      name="reorderQuantity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reorder Quantity"
                          type="number"
                          fullWidth
                          error={!!errors.reorderQuantity}
                          helperText={errors.reorderQuantity?.message}
                          placeholder="0"
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog} disabled={editingProduct}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={editingProduct}
                startIcon={editingProduct ? <CircularProgress size={20} /> : <Edit />}
              >
                {editingProduct ? 'Updating...' : 'Update Product'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Product Confirmation Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon color="error" />
              Delete Product
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this product?
            </Typography>
            {selectedProduct && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Product Details:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedProduct.name} ({selectedProduct.sku})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {selectedProduct.category.name}
                </Typography>
                {selectedProduct.brand && (
                  <Typography variant="body2" color="text.secondary">
                    Brand: {selectedProduct.brand}
                  </Typography>
                )}
              </Box>
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This action cannot be undone. The product will be permanently removed from the system.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={deletingProduct}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteProduct}
              variant="contained" 
              color="error"
              disabled={deletingProduct}
              startIcon={deletingProduct ? <CircularProgress size={20} /> : <Delete />}
            >
              {deletingProduct ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Product Details Dialog */}
        <Dialog 
          open={openViewDialog} 
          onClose={handleCloseViewDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Product Details</Typography>
              <Chip
                label={selectedProduct?.isActive ? 'Active' : 'Inactive'}
                color={selectedProduct?.isActive ? 'success' : 'error'}
                size="small"
                icon={selectedProduct?.isActive ? <CheckCircle /> : <Cancel />}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedProduct ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Basic Information */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Product Name</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedProduct.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">SKU</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        <Chip label={selectedProduct.sku} size="small" variant="outlined" />
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">
                        {selectedProduct.description || 'No description provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                      <Typography variant="body1">
                        <Chip 
                          label={selectedProduct.category.name} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Unit of Measure</Typography>
                      <Typography variant="body1">{selectedProduct.unitOfMeasure}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Brand & Model */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Brand & Model
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Brand</Typography>
                      <Typography variant="body1">{selectedProduct.brand || 'Not specified'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Model</Typography>
                      <Typography variant="body1">{selectedProduct.model || 'Not specified'}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Physical Properties */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Physical Properties
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Weight</Typography>
                      <Typography variant="body1">
                        {selectedProduct.weight ? `${selectedProduct.weight} kg` : 'Not specified'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Dimensions</Typography>
                      <Typography variant="body1">{selectedProduct.dimensions || 'Not specified'}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Pricing */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Pricing Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Cost Price</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedProduct.costPrice ? formatCurrency(selectedProduct.costPrice) : 'Not specified'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Selling Price</Typography>
                      <Typography variant="body1" fontWeight="medium" color="success.main">
                        {selectedProduct.sellingPrice ? formatCurrency(selectedProduct.sellingPrice) : 'Not specified'}
                      </Typography>
                    </Box>
                    {selectedProduct.costPrice && selectedProduct.sellingPrice && (
                      <Box sx={{ gridColumn: '1 / -1' }}>
                        <Typography variant="subtitle2" color="text.secondary">Profit Margin</Typography>
                        <Typography variant="body1" color="success.main" fontWeight="medium">
                          {formatCurrency(selectedProduct.sellingPrice - selectedProduct.costPrice)} 
                          ({((selectedProduct.sellingPrice - selectedProduct.costPrice) / selectedProduct.costPrice * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Inventory Management */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Inventory Management
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Reorder Point</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatNumber(selectedProduct.reorderPoint)} units
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Reorder Quantity</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatNumber(selectedProduct.reorderQuantity)} units
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Audit Information */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Audit Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                      <Typography variant="body2">
                        {new Date(selectedProduct.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body2">
                        {new Date(selectedProduct.updatedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {selectedProduct.createdBy && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                        <Typography variant="body2">
                          {selectedProduct.createdBy.firstName} {selectedProduct.createdBy.lastName}
                        </Typography>
                      </Box>
                    )}
                    {selectedProduct.updatedBy && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Last Updated By</Typography>
                        <Typography variant="body2">
                          {selectedProduct.updatedBy.firstName} {selectedProduct.updatedBy.lastName}
        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog} color="primary">
              Close
        </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default ProductManagement; 