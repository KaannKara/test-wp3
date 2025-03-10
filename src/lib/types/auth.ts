// User interface
export interface User {
  _id: string;
  username: string;
  email: string;
  whatsappConnected: boolean;
  role?: 'admin' | 'user';
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register credentials
export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Auth response
export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  whatsappConnected: boolean;
  role?: 'admin' | 'user';
  token: string;
}

// Auth context state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Auth context actions
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_WHATSAPP_CONNECTED'; payload: boolean }
  | { type: 'CLEAR_ERROR' }; 