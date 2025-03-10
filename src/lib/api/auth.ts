import { post, get } from './client';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return await post<AuthResponse>('/auth/login', credentials);
};

// Register user
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  return await post<AuthResponse>('/auth/register', credentials);
};

// Get current user profile
export const getProfile = async (): Promise<AuthResponse> => {
  return await get<AuthResponse>('/auth/profile');
}; 