import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box className="min-h-screen bg-gray-50 p-6">
      <Box className="max-w-4xl mx-auto">
        {/* Header */}
        <Box className="mb-8">
          <Typography variant="h3" className="font-bold text-gray-900 mb-2">
            User Profile
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Manage your account information and preferences.
          </Typography>
        </Box>

        {/* Profile Card */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="font-semibold text-gray-900">
                Profile Information
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Edit Profile
              </Button>
            </Box>
            
            <Box className="space-y-4">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Username
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {user?.username}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Email
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {user?.email}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    First Name
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {user?.firstName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Last Name
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {user?.lastName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Role
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {user?.role}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Status
                  </Typography>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </Box>
              </Box>
            </Box>
            
            <Typography variant="body1" className="text-gray-600 mt-6">
              Profile management features will be implemented in the next phase.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserProfile; 