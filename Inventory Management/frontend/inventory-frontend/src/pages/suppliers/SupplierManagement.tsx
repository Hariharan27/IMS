import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Business,
  Person,
  Email,
  Phone,
  LocationOn,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import supplierService from '../../services/supplierService';
import type { SupplierCreateRequest, SupplierUpdateRequest } from '../../types/supplier';
import type { Supplier } from '../../types/purchaseOrder';
import MainLayout from '../../components/layout/MainLayout';

// Validation schemas
const supplierCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  isActive: z.boolean().default(true),
});

const supplierUpdateSchema = supplierCreateSchema.partial();

type SupplierFormData = z.infer<typeof supplierCreateSchema>;

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form hooks
  const createForm = useForm<SupplierFormData>({
    resolver: zodResolver(supplierCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      taxId: '',
      paymentTerms: '',
      isActive: true,
    },
  });

  const editForm = useForm<SupplierFormData>({
    resolver: zodResolver(supplierUpdateSchema),
  });

  // Load suppliers
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getSuppliers();
      if (response.success) {
        setSuppliers(response.data);
      } else {
        setError('Failed to load suppliers');
      }
    } catch (err) {
      setError('Error loading suppliers');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive === null || supplier.isActive === filterActive;
    
    return matchesSearch && matchesFilter;
  });

  // Handle create supplier
  const handleCreateSupplier = async (data: SupplierFormData) => {
    try {
      setSubmitting(true);
      const response = await supplierService.createSupplier(data);
      if (response.success) {
        setSuccess('Supplier created successfully');
        setCreateDialogOpen(false);
        createForm.reset();
        loadSuppliers();
      } else {
        setError(response.message || 'Failed to create supplier');
      }
    } catch (err) {
      setError('Error creating supplier');
      console.error('Error creating supplier:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit supplier
  const handleEditSupplier = async (data: SupplierFormData) => {
    if (!selectedSupplier) return;
    
    try {
      setSubmitting(true);
      const response = await supplierService.updateSupplier(selectedSupplier.id, data);
      if (response.success) {
        setSuccess('Supplier updated successfully');
        setEditDialogOpen(false);
        setSelectedSupplier(null);
        loadSuppliers();
      } else {
        setError(response.message || 'Failed to update supplier');
      }
    } catch (err) {
      setError('Error updating supplier');
      console.error('Error updating supplier:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete supplier
  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
      return;
    }

    try {
      const response = await supplierService.deleteSupplier(supplier.id);
      if (response.success) {
        setSuccess('Supplier deleted successfully');
        loadSuppliers();
      } else {
        setError(response.message || 'Failed to delete supplier');
      }
    } catch (err) {
      setError('Error deleting supplier');
      console.error('Error deleting supplier:', err);
    }
  };

  // Handle view supplier
  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewDialogOpen(true);
  };

  // Handle edit dialog open
  const handleEditDialogOpen = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    editForm.reset({
      name: supplier.name,
      code: supplier.code,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      country: supplier.country,
      postalCode: supplier.postalCode,
      taxId: supplier.taxId || '',
      paymentTerms: supplier.paymentTerms || '',
      isActive: supplier.isActive,
    });
    setEditDialogOpen(true);
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Supplier Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" onClose={clearMessages} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={clearMessages} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Search suppliers"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterActive === null ? 'all' : filterActive}
              onChange={(e) => setFilterActive(e.target.value === 'all' ? null : e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Suppliers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No suppliers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {supplier.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {supplier.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {supplier.city}, {supplier.state}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.isActive ? 'Active' : 'Inactive'}
                        color={supplier.isActive ? 'success' : 'default'}
                        size="small"
                        icon={supplier.isActive ? <CheckCircle /> : <Cancel />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Supplier">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditDialogOpen(supplier)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Supplier">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSupplier(supplier)}
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
      </Paper>

      {/* Create Supplier Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Supplier</DialogTitle>
        <form onSubmit={createForm.handleSubmit(handleCreateSupplier)}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="name"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Supplier Name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="code"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Supplier Code"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="contactPerson"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Contact Person"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="phone"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="taxId"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Tax ID"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="address"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="paymentTerms"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Payment Terms"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="city"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="state"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="country"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="postalCode"
                control={createForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="isActive"
                control={createForm.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Active"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Create Supplier'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Supplier</DialogTitle>
        <form onSubmit={editForm.handleSubmit(handleEditSupplier)}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="name"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Supplier Name"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="code"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Supplier Code"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="contactPerson"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Contact Person"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="phone"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="taxId"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Tax ID"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="address"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="paymentTerms"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Payment Terms"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="city"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="state"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="country"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="postalCode"
                control={editForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="isActive"
                control={editForm.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Active"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Update Supplier'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Supplier Details</DialogTitle>
        <DialogContent>
          {selectedSupplier && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Code</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedSupplier.code}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedSupplier.name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedSupplier.contactPerson}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedSupplier.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedSupplier.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tax ID</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedSupplier.taxId || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Payment Terms</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedSupplier.paymentTerms || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedSupplier.isActive ? 'Active' : 'Inactive'}
                  color={selectedSupplier.isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.state} {selectedSupplier.postalCode}, {selectedSupplier.country}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {new Date(selectedSupplier.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {new Date(selectedSupplier.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
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

export default SupplierManagement; 