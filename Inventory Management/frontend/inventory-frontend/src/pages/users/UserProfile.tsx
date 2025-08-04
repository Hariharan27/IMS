import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { formatTimestamp } from '../../utils/formatters';
import { AuthService } from '../../services/authService';
import type { User } from '../../types/user';

const UserProfile: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?.username) {
        setError('No user information available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch complete user profile from API
        const response = await AuthService.getUserByUsername(authUser.username);
        
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setError(response.message || 'Failed to fetch user profile');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser?.username]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MANAGER': return 'warning';
      case 'STAFF': return 'info';
      default: return 'default';
    }
  };

  const profileData = [
    {
      label: 'Username',
      value: user?.username || 'N/A',
      icon: <PersonIcon color="primary" />,
    },
    {
      label: 'Email',
      value: user?.email || 'N/A',
      icon: <EmailIcon color="primary" />,
    },
    {
      label: 'First Name',
      value: user?.firstName || 'N/A',
      icon: <PersonIcon color="primary" />,
    },
    {
      label: 'Last Name',
      value: user?.lastName || 'N/A',
      icon: <PersonIcon color="primary" />,
    },
    {
      label: 'Role',
      value: user?.role || 'N/A',
      icon: <PersonIcon color="primary" />,
      isChip: true,
    },
    {
      label: 'Status',
      value: user?.isActive ? 'Active' : 'Inactive',
      icon: user?.isActive ? <CheckCircleIcon color="success" /> : <WarningIcon color="error" />,
      isChip: true,
    },
    {
      label: 'Last Login',
      value: user?.lastLoginAt ? formatTimestamp(user.lastLoginAt) : 'Never',
      icon: <ScheduleIcon color="info" />,
    },
    {
      label: 'Account Created',
      value: user?.createdAt ? formatTimestamp(user.createdAt) : 'N/A',
      icon: <CalendarIcon color="info" />,
    },
    {
      label: 'Last Updated',
      value: user?.updatedAt ? formatTimestamp(user.updatedAt) : 'N/A',
      icon: <CalendarIcon color="info" />,
    },
  ];

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
        <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Fetching profile data from API...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
        <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Unable to load profile information. Please try refreshing the page.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
        {/* Header removed */}

        {/* Profile Card */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* User Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {user?.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Chip
                  label={user?.role}
                  color={getRoleColor(user?.role || '') as any}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={user?.isActive ? 'Active' : 'Inactive'}
                  color={user?.isActive ? 'success' : 'error'}
                  size="small"
                  icon={user?.isActive ? <CheckCircleIcon /> : <WarningIcon />}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Profile Information List */}
            <List>
              {profileData.map((item, index) => (
                <React.Fragment key={item.label}>
                  <ListItem sx={{ px: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        {item.icon}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {item.label}
                            </Typography>
                            <Box>
                              {item.isChip ? (
                                <Chip
                                  label={item.value}
                                  color={
                                    item.label === 'Role' 
                                      ? getRoleColor(item.value) as any
                                      : item.value === 'Active' 
                                        ? 'success' 
                                        : 'error'
                                  }
                                  size="small"
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {item.value}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                  </ListItem>
                  {index < profileData.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserProfile; 