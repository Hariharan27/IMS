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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Visibility,
  Delete,
  Person,
  Email,
  CalendarToday,
  CheckCircle,
  Cancel,
  Warning,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '../../components/layout/MainLayout';
import { formatDate } from '../../utils/formatters';
import AuthService from '../../services/authService';
import type { User, UserRole, UserUpdateRequest } from '../../types/user';

// User update form schema
const userUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF'] as const),
  isActive: z.boolean(),
});

// User creation form schema
const userCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username cannot exceed 50 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF'] as const),
});

type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
type UserCreateFormData = z.infer<typeof userCreateSchema>;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
  });

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      role: 'STAFF',
    },
  });

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await AuthService.getUsers();
      
      if (response.success) {
        setUsers(response.data.content || response.data);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle view user details
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    resetCreate();
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    resetCreate();
  };

  // Handle update user
  const onSubmitUpdateUser = async (data: UserUpdateFormData) => {
    if (!selectedUser) return;

    try {
      setUpdatingUser(true);
      const updateData: UserUpdateRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };

      const response = await AuthService.updateUser(selectedUser.id, updateData);
      
      if (response.success) {
        setEditDialogOpen(false);
        setSelectedUser(null);
        loadUsers(); // Reload data
      } else {
        setError('Failed to update user: ' + response.message);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setUpdatingUser(false);
    }
  };

  // Handle create user
  const onSubmitCreateUser = async (data: UserCreateFormData) => {
    try {
      setCreatingUser(true);
      setError(null);

      const response = await AuthService.createUser({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (response.success) {
        setCreateDialogOpen(false);
        loadUsers();
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (user: User) => {
    try {
      const response = await AuthService.updateUser(user.id, {
        isActive: !user.isActive,
      });
      
      if (response.success) {
        loadUsers(); // Reload data
      } else {
        setError('Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status');
    }
  };

  // Get role color
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MANAGER':
        return 'warning';
      case 'STAFF':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
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
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage system users and their permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUser}
            sx={{ minWidth: 120 }}
          >
            Add User
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
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  label="Role"
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                  <MenuItem value="STAFF">Staff</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" color="action" />
                          {user.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(user.isActive) as any}
                          size="small"
                          icon={user.isActive ? <CheckCircle /> : <Cancel />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewUser(user)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                            <IconButton
                              size="small"
                              color={user.isActive ? 'error' : 'success'}
                              onClick={() => handleStatusToggle(user)}
                            >
                              {user.isActive ? <Cancel /> : <CheckCircle />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {filteredUsers.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No users found matching your criteria
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* View User Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            User Details
            {selectedUser && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Username</Typography>
                    <Typography variant="body1">{selectedUser.username}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{selectedUser.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">First Name</Typography>
                    <Typography variant="body1">{selectedUser.firstName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Last Name</Typography>
                    <Typography variant="body1">{selectedUser.lastName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Role</Typography>
                    <Chip
                      label={selectedUser.role}
                      color={getRoleColor(selectedUser.role) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip
                      label={selectedUser.isActive ? 'Active' : 'Inactive'}
                      color={getStatusColor(selectedUser.isActive) as any}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Last Login</Typography>
                    <Typography variant="body1">
                      {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created</Typography>
                    <Typography variant="body1">{formatDate(selectedUser.createdAt)}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit User
            {selectedUser && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Typography>
            )}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmitUpdateUser)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
                
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
                
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
                
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select {...field} label="Role">
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="MANAGER">Manager</MenuItem>
                        <MenuItem value="STAFF">Staff</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
                
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="primary"
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updatingUser}
              >
                {updatingUser ? <CircularProgress size={20} /> : 'Update User'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Create New User
            </Typography>
          </DialogTitle>
          <form onSubmit={handleCreateSubmit(onSubmitCreateUser)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="username"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Username"
                      fullWidth
                      error={!!createErrors.username}
                      helperText={createErrors.username?.message}
                    />
                  )}
                />
                
                <Controller
                  name="firstName"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!createErrors.firstName}
                      helperText={createErrors.firstName?.message}
                    />
                  )}
                />
                
                <Controller
                  name="lastName"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!createErrors.lastName}
                      helperText={createErrors.lastName?.message}
                    />
                  )}
                />
                
                <Controller
                  name="email"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!createErrors.email}
                      helperText={createErrors.email?.message}
                    />
                  )}
                />
                
                <Controller
                  name="password"
                  control={createControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type="password"
                      fullWidth
                      error={!!createErrors.password}
                      helperText={createErrors.password?.message}
                    />
                  )}
                />
                
                <Controller
                  name="role"
                  control={createControl}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!createErrors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select {...field} label="Role">
                        <MenuItem value="ADMIN">Admin</MenuItem>
                        <MenuItem value="MANAGER">Manager</MenuItem>
                        <MenuItem value="STAFF">Staff</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCreateDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={creatingUser}
              >
                {creatingUser ? <CircularProgress size={20} /> : 'Create User'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default UserManagement; 