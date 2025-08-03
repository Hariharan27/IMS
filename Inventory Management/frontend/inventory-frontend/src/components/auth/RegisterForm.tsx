import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd as RegisterIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import type { RegisterRequest } from '../../types/auth';
import { UserRole } from '../../types/user';

// Validation schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  role: z.nativeEnum(UserRole),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register: registerUser, error, clearError, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.STAFF,
    },
  });

  const password = watch('password');

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 25) return 'error';
    if (strength <= 50) return 'warning';
    if (strength <= 75) return 'info';
    return 'success';
  };

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    const registerData: RegisterRequest = {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };
    await registerUser(registerData, () => {
      // Success callback - navigate to login
      navigate('/login');
    });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength);

  // Show loading spinner if app is initializing (after all hooks)
  if (isLoading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 4 }
      }}
    >
      <Card 
        sx={{
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: 2
        }}
      >
        <CardContent sx={{ padding: 4, minHeight: 'auto' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'text.primary',
                mb: 1
              }}
            >
              Create Account
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              Sign up for your inventory management account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }} 
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              {/* First Name */}
              <TextField
                {...register('firstName')}
                label="First Name"
                variant="outlined"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                InputProps={{
                  sx: { backgroundColor: 'background.paper' }
                }}
              />

              {/* Last Name */}
              <TextField
                {...register('lastName')}
                label="Last Name"
                variant="outlined"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                InputProps={{
                  sx: { backgroundColor: 'background.paper' }
                }}
              />
            </Box>

            {/* Username */}
            <TextField
              {...register('username')}
              label="Username"
              variant="outlined"
              fullWidth
              error={!!errors.username}
              helperText={errors.username?.message}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { backgroundColor: 'background.paper' }
              }}
            />

            {/* Email */}
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { backgroundColor: 'background.paper' }
              }}
            />

            {/* Password */}
            <TextField
              {...register('password')}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { backgroundColor: 'background.paper' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {password && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  color={passwordStrengthColor as any}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Password strength: {passwordStrength}%
                </Typography>
              </Box>
            )}

            {/* Confirm Password */}
            <TextField
              {...register('confirmPassword')}
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{ mb: 3 }}
              InputProps={{
                sx: { backgroundColor: 'background.paper' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Role Selection */}
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select
                {...register('role')}
                label="Role"
                defaultValue={UserRole.STAFF}
                sx={{ backgroundColor: 'background.paper' }}
              >
                <MenuItem value={UserRole.STAFF}>Staff</MenuItem>
                <MenuItem value={UserRole.MANAGER}>Manager</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              </Select>
            </FormControl>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <RegisterIcon />}
              sx={{ 
                height: 48,
                mb: 3,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                }
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            {onSwitchToLogin && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Already have an account?{' '}
                  <Button
                    component="button"
                    variant="text"
                    onClick={onSwitchToLogin}
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 'medium',
                      '&:hover': { color: 'primary.dark' }
                    }}
                  >
                    Sign in
                  </Button>
                </Typography>
              </Box>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterForm; 