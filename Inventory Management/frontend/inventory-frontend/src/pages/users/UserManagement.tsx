import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const UserManagement: React.FC = () => {
  return (
    <Box className="min-h-screen bg-gray-50 p-6">
      <Box className="max-w-7xl mx-auto">
        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h3" className="font-bold text-gray-900 mb-2">
            User Management
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Manage system users and their permissions.
          </Typography>
        </Box>

        {/* Content */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="font-semibold text-gray-900">
                All Users
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add User
              </Button>
            </Box>
            
            <Typography variant="body1" className="text-gray-600">
              User management interface will be implemented in the next phase.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserManagement; 