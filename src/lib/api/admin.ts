import { get, del } from './client';

// User interface
interface UserWithStatus {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  whatsappConnected: boolean;
  connectionActive: boolean;
  whatsappLastConnection?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Orphaned session interface
interface OrphanedSession {
  id: string;
  connected: boolean;
  path: string;
  createdAt?: Date;
  lastModified?: Date;
  error?: string;
}

// Get all users
export const getUsers = async (): Promise<UserWithStatus[]> => {
  return await get<UserWithStatus[]>('/admin/users');
};

// Get user by ID
export const getUserById = async (id: string): Promise<UserWithStatus> => {
  return await get<UserWithStatus>(`/admin/users/${id}`);
};

// Delete WhatsApp session for a user
export const deleteWhatsAppSession = async (userId: string): Promise<{ message: string }> => {
  return await del<{ message: string }>(`/admin/users/${userId}/whatsapp-session`);
};

// Get orphaned WhatsApp sessions
export const getOrphanedSessions = async (): Promise<OrphanedSession[]> => {
  return await get<OrphanedSession[]>('/admin/orphaned-sessions');
};

// Delete an orphaned WhatsApp session
export const deleteOrphanedSession = async (sessionId: string): Promise<{ message: string }> => {
  return await del<{ message: string }>(`/admin/orphaned-sessions/${sessionId}`);
}; 