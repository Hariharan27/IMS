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
  Folder,
  FolderOpen,
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
import CategoryService, { type Category } from '../../services/categoryService';
import { formatNumber } from '../../utils/formatters';

// Zod schema for category creation/editing
const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100, 'Category name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Add Category Dialog State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Edit Category Dialog State
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);

  // View Category Dialog State
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Delete Category Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);

  // Form setup for Add/Edit Category
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: '',
    },
  });

  // Load categories
  const loadCategories = async () => {
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
      
      if (statusFilter !== 'all') {
        filters.isActive = statusFilter === 'active';
      }

      const response = await CategoryService.getCategories(filters);
      
      if (response.success) {
        if (Array.isArray(response.data)) {
          setCategories(response.data);
          setTotalPages(1);
          setTotalElements(response.data.length);
        } else {
          setCategories(response.data.content);
          setTotalPages(response.data.totalPages);
          setTotalElements(response.data.totalElements);
        }
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
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

  // Handle Add Category Dialog
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    reset(); // Reset form when opening
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    reset(); // Reset form when closing
  };

  // Handle Edit Category Dialog
  const handleOpenEditDialog = (category: Category) => {
    setSelectedCategory(category);
    // Pre-populate form with existing category data
    reset({
      name: category.name,
      description: category.description || '',
      parentId: category.parent?.id?.toString() || '',
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedCategory(null);
    reset(); // Reset form when closing
  };

  // Handle View Category Dialog
  const handleOpenViewDialog = (category: Category) => {
    setSelectedCategory(category);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedCategory(null);
  };

  // Handle Delete Category Dialog
  const handleOpenDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCategory(null);
  };

  // Handle Category Creation
  const onSubmitCreateCategory = async (data: CategoryFormData) => {
    try {
      setCreatingCategory(true);
      
      const categoryData = {
        name: data.name,
        description: data.description || '',
        parentId: data.parentId ? parseInt(data.parentId) : undefined,
      };

      const response = await CategoryService.createCategory(categoryData);
      
      if (response.success) {
        handleCloseAddDialog();
        loadCategories(); // Refresh the category list
        setError(null);
      } else {
        setError(response.message || 'Failed to create category');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Handle Category Update
  const onSubmitUpdateCategory = async (data: CategoryFormData) => {
    if (!selectedCategory) return;
    
    try {
      setEditingCategory(true);
      
      const categoryData = {
        name: data.name,
        description: data.description || '',
        parentId: data.parentId ? parseInt(data.parentId) : undefined,
      };

      const response = await CategoryService.updateCategory(selectedCategory.id, categoryData);
      
      if (response.success) {
        handleCloseEditDialog();
        loadCategories(); // Refresh the category list
        setError(null);
      } else {
        setError(response.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category');
    } finally {
      setEditingCategory(false);
    }
  };

  // Handle Category Deletion
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      setDeletingCategory(true);
      
      const response = await CategoryService.deleteCategory(selectedCategory.id);
      
      if (response.success) {
        handleCloseDeleteDialog();
        loadCategories(); // Refresh the category list
        setError(null);
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    } finally {
      setDeletingCategory(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadCategories();
  }, [page, searchTerm, statusFilter]);

  // Get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  // Get status label
  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  // Get parent category name
  const getParentName = (category: Category) => {
    return category.parent ? category.parent.name : 'Root Category';
  };

  // Get children count
  const getChildrenCount = (category: Category) => {
    return category.children ? category.children.length : 0;
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Category Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenAddDialog}
          >
            Add Category
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
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 2, alignItems: 'end' }}>
              <TextField
                label="Search Categories"
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
                placeholder="Search by name or description..."
              />
              
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
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Categories Table */}
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
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Parent Category</TableCell>
                        <TableCell>Children</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No categories found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((category) => (
                          <TableRow key={category.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Folder color="primary" />
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="medium">
                                    {category.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ID: {category.id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {category.description || 'No description'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={getParentName(category)} 
                                size="small" 
                                variant="outlined"
                                color={category.parent ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FolderOpen color="action" />
                                <Typography variant="body2">
                                  {getChildrenCount(category)} children
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(category.isActive)}
                                color={getStatusColor(category.isActive)}
                                size="small"
                                icon={category.isActive ? <CheckCircle /> : <Cancel />}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenViewDialog(category)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Category">
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleOpenEditDialog(category)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Category">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleOpenDeleteDialog(category)}
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
                        Total: {totalElements} categories
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

        {/* Add Category Dialog */}
        <Dialog 
          open={openAddDialog} 
          onClose={handleCloseAddDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Category</DialogTitle>
          <form onSubmit={handleSubmit(onSubmitCreateCategory)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category Name *"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="Enter category name"
                    />
                  )}
                />

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
                      placeholder="Enter category description"
                    />
                  )}
                />

                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Parent Category (Optional)</InputLabel>
                      <Select {...field} label="Parent Category (Optional)">
                        <MenuItem value="">
                          <em>No parent (Root category)</em>
                        </MenuItem>
                        {categories
                          .filter(cat => cat.isActive)
                          .map((category) => (
                            <MenuItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAddDialog} disabled={creatingCategory}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={creatingCategory}
                startIcon={creatingCategory ? <CircularProgress size={20} /> : <Add />}
              >
                {creatingCategory ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={handleCloseEditDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Category</DialogTitle>
          <form onSubmit={handleSubmit(onSubmitUpdateCategory)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category Name *"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="Enter category name"
                    />
                  )}
                />

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
                      placeholder="Enter category description"
                    />
                  )}
                />

                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Parent Category (Optional)</InputLabel>
                      <Select {...field} label="Parent Category (Optional)">
                        <MenuItem value="">
                          <em>No parent (Root category)</em>
                        </MenuItem>
                        {categories
                          .filter(cat => cat.isActive && cat.id !== selectedCategory?.id)
                          .map((category) => (
                            <MenuItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog} disabled={editingCategory}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={editingCategory}
                startIcon={editingCategory ? <CircularProgress size={20} /> : <Edit />}
              >
                {editingCategory ? 'Updating...' : 'Update Category'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Category Confirmation Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon color="error" />
              Delete Category
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this category?
            </Typography>
            {selectedCategory && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">Category Details:</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedCategory.name} (ID: {selectedCategory.id})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Parent: {getParentName(selectedCategory)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Children: {getChildrenCount(selectedCategory)} categories
                </Typography>
              </Box>
            )}
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This action cannot be undone. The category and all its subcategories will be permanently removed.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={deletingCategory}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteCategory}
              variant="contained" 
              color="error"
              disabled={deletingCategory}
              startIcon={deletingCategory ? <CircularProgress size={20} /> : <Delete />}
            >
              {deletingCategory ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Category Details Dialog */}
        <Dialog 
          open={openViewDialog} 
          onClose={handleCloseViewDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Category Details</Typography>
              <Chip
                label={selectedCategory?.isActive ? 'Active' : 'Inactive'}
                color={selectedCategory?.isActive ? 'success' : 'error'}
                size="small"
                icon={selectedCategory?.isActive ? <CheckCircle /> : <Cancel />}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedCategory ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Basic Information */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Category Name</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedCategory.name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Category ID</Typography>
                      <Typography variant="body1" fontWeight="medium">{selectedCategory.id}</Typography>
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">
                        {selectedCategory.description || 'No description provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Hierarchy Information */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Hierarchy Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Parent Category</Typography>
                      <Typography variant="body1">
                        <Chip 
                          label={getParentName(selectedCategory)} 
                          size="small" 
                          variant="outlined"
                          color={selectedCategory.parent ? 'primary' : 'default'}
                        />
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Child Categories</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {getChildrenCount(selectedCategory)} categories
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
                        {new Date(selectedCategory.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body2">
                        {new Date(selectedCategory.updatedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {selectedCategory.createdBy && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                        <Typography variant="body2">
                          {selectedCategory.createdBy.firstName} {selectedCategory.createdBy.lastName}
                        </Typography>
                      </Box>
                    )}
                    {selectedCategory.updatedBy && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Last Updated By</Typography>
                        <Typography variant="body2">
                          {selectedCategory.updatedBy.firstName} {selectedCategory.updatedBy.lastName}
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

export default CategoryManagement; 