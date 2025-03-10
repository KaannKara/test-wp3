import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, AuthAction } from '../lib/types/auth';
import * as authApi from '../lib/api/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Create context
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setWhatsAppConnected: (connected: boolean) => void;
}>({
  state: initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
  setWhatsAppConnected: () => {},
});

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_WHATSAPP_CONNECTED':
      return {
        ...state,
        user: state.user ? { ...state.user, whatsappConnected: action.payload } : null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
          dispatch({ type: 'LOGOUT' });
          return;
        }
        
        const response = await authApi.getProfile();
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: {
            _id: response._id,
            username: response.username,
            email: response.email,
            whatsappConnected: response.whatsappConnected,
            role: response.role
          } 
        });
      } catch (error) {
        localStorage.removeItem('userToken');
        dispatch({ type: 'LOGOUT' });
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authApi.login({ email, password });
      
      // Store token in localStorage
      localStorage.setItem('userToken', response.token);
      
      // Update state
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: {
          _id: response._id,
          username: response.username,
          email: response.email,
          whatsappConnected: response.whatsappConnected,
          role: response.role
        } 
      });
    } catch (error: any) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error.response?.data?.message || 'Login failed' 
      });
    }
  };

  // Register
  const register = async (username: string, email: string, password: string) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await authApi.register({ username, email, password });
      
      // Store token in localStorage
      localStorage.setItem('userToken', response.token);
      
      // Update state
      dispatch({ 
        type: 'REGISTER_SUCCESS', 
        payload: {
          _id: response._id,
          username: response.username,
          email: response.email,
          whatsappConnected: response.whatsappConnected,
          role: response.role
        } 
      });
    } catch (error: any) {
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error.response?.data?.message || 'Registration failed' 
      });
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('userToken');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Set WhatsApp connected status
  const setWhatsAppConnected = useCallback((connected: boolean) => {
    dispatch({ type: 'SET_WHATSAPP_CONNECTED', payload: connected });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        clearError,
        setWhatsAppConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 