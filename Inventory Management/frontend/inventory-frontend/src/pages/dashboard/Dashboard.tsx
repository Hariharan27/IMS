import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box className="min-h-screen bg-gray-50 p-6">
      <Box className="max-w-7xl mx-auto">
        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h3" className="font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || user?.username}!
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Here's what's happening with your inventory today.
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <Typography variant="h4" className="font-bold text-blue-600 mb-2">
                  1,234
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Total Products
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <Typography variant="h4" className="font-bold text-green-600 mb-2">
                  567
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  In Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <Typography variant="h4" className="font-bold text-orange-600 mb-2">
                  89
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Low Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <Typography variant="h4" className="font-bold text-red-600 mb-2">
                  12
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Out of Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card className="bg-white shadow-sm mb-8">
          <CardContent className="p-6">
            <Typography variant="h5" className="font-semibold text-gray-900 mb-4">
              Quick Actions
            </Typography>
            <Box className="flex flex-wrap gap-4">
              <Button
                variant="contained"
                color="primary"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Product
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                View Inventory
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Create Purchase Order
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                View Reports
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <Typography variant="h5" className="font-semibold text-gray-900 mb-4">
              Account Information
            </Typography>
            <Box className="space-y-2">
              <Typography variant="body1">
                <span className="font-medium">Username:</span> {user?.username}
              </Typography>
              <Typography variant="body1">
                <span className="font-medium">Email:</span> {user?.email}
              </Typography>
              <Typography variant="body1">
                <span className="font-medium">Role:</span> {user?.role}
              </Typography>
              <Typography variant="body1">
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </Typography>
            </Box>
            <Box className="mt-6">
              <Button
                variant="outlined"
                color="error"
                onClick={logout}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard; 