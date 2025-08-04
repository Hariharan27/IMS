import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import theme from './theme/theme';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/dashboard/Dashboard';
import ProductManagement from './pages/products/ProductManagement';
import CategoryManagement from './pages/categories/CategoryManagement';
import InventoryManagement from './pages/inventory/InventoryManagement';
import AlertManagement from './pages/alerts/AlertManagement';
import UserManagement from './pages/users/UserManagement';
import UserProfile from './pages/users/UserProfile';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRoles?: string[] }> = ({ 
  children, 
  requiredRoles 
}) => {
  const { isAuthenticated, user, hasAnyRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user && !hasAnyRole(requiredRoles as any)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Authentication Pages Component
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  return <LoginForm onSwitchToRegister={() => navigate('/register')} />;
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  return <RegisterForm onSwitchToLogin={() => navigate('/login')} />;
};

// Main App Component
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products" 
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
              <ProductManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
              <CategoryManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'STAFF']}>
              <InventoryManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'STAFF']}>
              <AlertManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <DashboardProvider>
          <AppContent />
        </DashboardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
