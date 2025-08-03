import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import MainLayout from '../../components/layout/MainLayout';

const ProductManagement: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Management
        </Typography>
        <Typography variant="body1" gutterBottom>
          This is a test version of the Product Management page.
        </Typography>
        <Button variant="contained" color="primary">
          Test Button
        </Button>
      </Box>
    </MainLayout>
  );
};

export default ProductManagement; 