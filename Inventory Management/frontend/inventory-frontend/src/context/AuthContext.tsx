import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginRequest, RegisterRequest } from '../types/auth';
import type { User, UserRole } from '../types/user';
import AuthService from '../services/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true
  error: null,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest, onSuccess?: () => void) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = AuthService.getToken();
    const userData = AuthService.getUserFromStorage();
    
    if (token && userData && AuthService.isTokenValid(token)) {
      // Token is valid, set authenticated state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: 0, // We'll get this from the API if needed
            username: userData.username,
            email: '',
            firstName: '',
            lastName: '',
            role: userData.role as UserRole,
            isActive: true,
            lastLoginAt: null,
            createdAt: '',
            updatedAt: '',
          },
          token,
        },
      });
    } else {
      // Invalid or expired token, clear storage without redirect
      AuthService.clearStorage();
      // Set loading to false since we're not authenticated
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        // Create user object from login response
        const user: User = {
          id: 0, // We'll get this from a proper user endpoint later
          username: response.data.username,
          email: '', // We'll get this from user profile later
          firstName: '',
          lastName: '',
          role: response.data.role,
          isActive: true,
          lastLoginAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            token: response.data.token,
          },
        });
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message || 'Login failed',
        });
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  // Register function
  const register = async (userData: RegisterRequest, onSuccess?: () => void) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await AuthService.register(userData);
      
      if (response.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
        // Clear any existing errors
        dispatch({ type: 'CLEAR_ERROR' });
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message || 'Registration failed',
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  };

  // Logout function
  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Role checking functions
  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 