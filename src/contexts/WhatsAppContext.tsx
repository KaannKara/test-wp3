import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as whatsappApi from '../lib/api/whatsapp';
import { useAuth } from './AuthContext';
import {
  WhatsAppGroup,
  WhatsAppQRResponse,
  ExcelFile,
  ScheduledMessage,
  ScheduledTask,
  CreateScheduledTaskRequest,
  SpecialEvent,
  CreateBirthdayEventRequest,
  CreatePolicyEventRequest,
} from '../lib/types/whatsapp';

interface WhatsAppContextType {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  qrCode: string | null;
  groups: WhatsAppGroup[];
  excelFiles: ExcelFile[];
  scheduledMessages: ScheduledMessage[];
  scheduledTasks: ScheduledTask[];
  silentMessageMode: boolean;
  loading: {
    connection: boolean;
    groups: boolean;
    files: boolean;
    messages: boolean;
    tasks: boolean;
    sendMessage: boolean;
    uploadFile: boolean;
    scheduleMessage: boolean;
    createTask: boolean;
    deleteFile: boolean;
    silentMode: boolean;
    specialEvents: boolean;
    createEvent: boolean;
  };
  error: string | null;
  initializeWhatsApp: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  sendMessage: (number: string, message: string, image?: File) => Promise<void>;
  sendGroupMessage: (groupId: string, message: string, image?: File) => Promise<void>;
  uploadExcelFile: (file: File) => Promise<void>;
  fetchExcelFiles: () => Promise<void>;
  fetchExcelFile: (id: string) => Promise<ExcelFile>;
  deleteExcelFile: (id: string) => Promise<void>;
  
  // Old scheduling system
  scheduleMessage: (groupId: string, fileId: string, dateField: string, messageTemplate: string) => Promise<void>;
  fetchScheduledMessages: () => Promise<void>;
  
  // New scheduling system
  fetchScheduledTasks: () => Promise<void>;
  fetchScheduledTask: (id: string) => Promise<ScheduledTask>;
  createScheduledTask: (task: CreateScheduledTaskRequest) => Promise<void>;
  updateScheduledTask: (id: string, updates: Partial<CreateScheduledTaskRequest>) => Promise<void>;
  deleteScheduledTask: (id: string) => Promise<void>;
  runScheduledTask: (id: string) => Promise<void>;
  
  // Silent mode functions for stopping auto-refresh on message receipt
  getSilentMessageMode: () => Promise<void>;
  setSilentMessageMode: (enabled: boolean) => Promise<void>;
  
  clearError: () => void;
  
  // Özel günler sistemi
  specialEvents: SpecialEvent[];
  fetchSpecialEvents: () => Promise<void>;
  createBirthdayEvent: (data: CreateBirthdayEventRequest) => Promise<void>;
  createPolicyEvent: (data: CreatePolicyEventRequest) => Promise<void>;
  deleteSpecialEvent: (id: string) => Promise<void>;
}

const WhatsAppContext = createContext<WhatsAppContextType | null>(null);

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};

export const WhatsAppProvider = ({ children }: { children: ReactNode }) => {
  const { state: authState, setWhatsAppConnected } = useAuth();
  
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [silentMessageMode, setSilentMessageModeState] = useState(true); // Default to true to prevent refreshes
  
  // Özel günler state'i
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  
  const [loading, setLoading] = useState({
    connection: false,
    groups: false,
    files: false,
    messages: false,
    tasks: false,
    sendMessage: false,
    uploadFile: false,
    scheduleMessage: false,
    createTask: false,
    deleteFile: false,
    silentMode: false,
    specialEvents: false,
    createEvent: false
  });

  // Check connection status
  const checkConnectionStatus = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    try {
      const response: WhatsAppQRResponse = await whatsappApi.getWhatsAppStatus();
      
      // State değişikliklerini daha güvenli bir şekilde yapalım
      if (response.connected) {
        if (connectionStatus !== 'connected') {
          // Tüm state güncellemelerini tek seferde yapalım
          setConnectionStatus('connected');
          setQrCode(null);
        }
      } else if (qrCode) {
        if (connectionStatus !== 'connecting') {
          setConnectionStatus('connecting');
        }
      } else {
        if (connectionStatus !== 'disconnected') {
          setConnectionStatus('disconnected');
        }
      }
    } catch (err) {
      console.error('Error checking connection status:', err);
    }
  }, [authState.isAuthenticated, qrCode, connectionStatus]);

  // WhatsApp bağlantı durumu değiştiğinde diğer state'leri güncelle
  useEffect(() => {
    // Connected durumuna geçtiğimizde WhatsApp bağlantı durumunu güncelle
    if (connectionStatus === 'connected') {
      setWhatsAppConnected(true);
    } else if (connectionStatus === 'disconnected') {
      setWhatsAppConnected(false);
    }
  }, [connectionStatus, setWhatsAppConnected]);

  // Initialize WhatsApp connection
  const initializeWhatsApp = useCallback(async () => {
    if (!authState.isAuthenticated) return;
    
    setLoading(prev => ({ ...prev, connection: true }));
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      // Try to get QR code
      const getQR = async () => {
        try {
          console.log('Fetching WhatsApp QR code...');
          const response = await whatsappApi.getWhatsAppQR();
          console.log('QR code response:', response);
          
          if (response.connected) {
            console.log('WhatsApp is already connected');
            setConnectionStatus('connected');
            setQrCode(null);
            setWhatsAppConnected(true);
            return true;
          } else if (response.qrCode) {
            console.log('QR code received');
            setQrCode(response.qrCode);
            return false;
          } else if (response.retry) {
            console.log('Need to retry QR code fetch');
            // Wait and try again
            await new Promise(resolve => setTimeout(resolve, 2000));
            return await getQR();
          } else {
            console.log('No QR code or connected status in response');
            // Try again after a delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            return await getQR();
          }
        } catch (err: any) {
          console.error('Error in getQR:', err);
          
          if (err.response?.status === 404) {
            console.log('QR code not found (404), retrying...');
            // Wait and try again
            await new Promise(resolve => setTimeout(resolve, 3000));
            return await getQR();
          }
          throw err;
        }
      };
      
      await getQR();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize WhatsApp');
      setConnectionStatus('disconnected');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  }, [authState.isAuthenticated, setWhatsAppConnected]);

  // Refresh groups
  const refreshGroups = useCallback(async () => {
    if (!authState.isAuthenticated || connectionStatus !== 'connected') return;
    
    setLoading(prev => ({ ...prev, groups: true }));
    
    try {
      const response = await whatsappApi.getWhatsAppGroups();
      // Only update if there's a change
      setGroups(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch groups');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  }, [authState.isAuthenticated, connectionStatus]);

  // Send message
  const sendMessage = async (number: string, message: string, image?: File) => {
    if (!authState.isAuthenticated || connectionStatus !== 'connected') {
      setError('WhatsApp is not connected');
      return;
    }
    
    setLoading(prev => ({ ...prev, sendMessage: true }));
    setError(null);
    
    try {
      await whatsappApi.sendMessage({ number, message, image });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, sendMessage: false }));
    }
  };

  // Send group message
  const sendGroupMessage = async (groupId: string, message: string, image?: File) => {
    if (!authState.isAuthenticated || connectionStatus !== 'connected') {
      setError('WhatsApp is not connected');
      return;
    }
    
    setLoading(prev => ({ ...prev, sendMessage: true }));
    setError(null);
    
    try {
      await whatsappApi.sendGroupMessage({ groupId, message, image });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send group message');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, sendMessage: false }));
    }
  };

  // Upload Excel file
  const uploadExcelFile = async (file: File) => {
    if (!authState.isAuthenticated) return;
    
    setLoading(prev => ({ ...prev, uploadFile: true }));
    setError(null);
    
    try {
      const response = await whatsappApi.uploadExcelFile(file);
      setExcelFiles(prev => [...prev, response]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, uploadFile: false }));
    }
  };

  // Schedule message
  const scheduleMessage = async (
    groupId: string, 
    fileId: string, 
    dateField: string, 
    messageTemplate: string
  ) => {
    if (!authState.isAuthenticated || connectionStatus !== 'connected') {
      setError('WhatsApp is not connected');
      return;
    }
    
    setLoading(prev => ({ ...prev, scheduleMessage: true }));
    setError(null);
    
    try {
      const response = await whatsappApi.scheduleMessage(
        groupId, 
        fileId, 
        dateField, 
        messageTemplate
      );
      setScheduledMessages(prev => [...prev, response]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule message');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, scheduleMessage: false }));
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Add new functions related to scheduled tasks
  const fetchScheduledTasks = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const tasks = await whatsappApi.getScheduledTasks();
      setScheduledTasks(tasks);
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
      setError('Failed to fetch scheduled tasks');
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, []);

  const fetchScheduledTask = useCallback(async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const task = await whatsappApi.getScheduledTask(id);
      return task;
    } catch (error) {
      console.error(`Error fetching scheduled task ${id}:`, error);
      setError('Failed to fetch scheduled task');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, []);

  // Memoized functions for fetching data to avoid re-creating on re-renders
  const fetchExcelFilesData = useCallback(async () => {
    if (loading.files) return; // Prevent multiple simultaneous requests
    
    setLoading(prev => ({ ...prev, files: true }));
    try {
      const response = await whatsappApi.getExcelFiles();
      // Only update if there's a change
      setExcelFiles(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(response)) {
          return response;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error fetching excel files:', err);
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  }, [loading.files]);

  const fetchScheduledMessagesData = useCallback(async () => {
    if (loading.messages) return; // Prevent multiple simultaneous requests
    
    setLoading(prev => ({ ...prev, messages: true }));
    try {
      const response = await whatsappApi.getScheduledMessages();
      // Only update if there's a change
      setScheduledMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(response)) {
          return response;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error fetching scheduled messages:', err);
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, [loading.messages]);

  // Load initial data for auth
  useEffect(() => {
    if (authState.isAuthenticated) {
      // Check connection status
      checkConnectionStatus();
      
      // Set up interval to check connection status - polling interval increased to 10 seconds
      // But we'll only fetch data when absolutely necessary, not on every poll
      const intervalId = setInterval(checkConnectionStatus, 10000);
      console.log("Setting up WhatsApp status poll interval");
      
      return () => {
        console.log("Clearing WhatsApp status poll interval");
        clearInterval(intervalId);
      };
    } else {
      setConnectionStatus('disconnected');
      setQrCode(null);
      setGroups([]);
      setExcelFiles([]);
      setScheduledMessages([]);
      setScheduledTasks([]);
      setSpecialEvents([]);
    }
  }, [authState.isAuthenticated, checkConnectionStatus]);

  // Özel günleri getir
  const fetchSpecialEvents = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, specialEvents: true }));
      const events = await whatsappApi.getSpecialEvents();
      setSpecialEvents(events);
    } catch (error) {
      console.error('Error fetching special events:', error);
      setError('Failed to fetch special events');
    } finally {
      setLoading(prev => ({ ...prev, specialEvents: false }));
    }
  }, []);
  
  // Doğum günü bildirimi oluştur
  const createBirthdayEvent = useCallback(async (data: CreateBirthdayEventRequest) => {
    try {
      setLoading(prev => ({ ...prev, createEvent: true }));
      await whatsappApi.createBirthdayEvent(data);
      // Başarıdan sonra listeyi yenile
      await fetchSpecialEvents();
    } catch (error) {
      console.error('Error creating birthday event:', error);
      setError('Failed to create birthday event');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, createEvent: false }));
    }
  }, [fetchSpecialEvents]);
  
  // Poliçe bildirimi oluştur
  const createPolicyEvent = useCallback(async (data: CreatePolicyEventRequest) => {
    try {
      setLoading(prev => ({ ...prev, createEvent: true }));
      await whatsappApi.createPolicyEvent(data);
      // Başarıdan sonra listeyi yenile
      await fetchSpecialEvents();
    } catch (error) {
      console.error('Error creating policy event:', error);
      setError('Failed to create policy event');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, createEvent: false }));
    }
  }, [fetchSpecialEvents]);
  
  // Özel gün bildirimini sil
  const deleteSpecialEvent = useCallback(async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, specialEvents: true }));
      await whatsappApi.deleteSpecialEvent(id);
      // Silme işleminden sonra listeyi yenile
      await fetchSpecialEvents();
    } catch (error) {
      console.error('Error deleting special event:', error);
      setError('Failed to delete special event');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, specialEvents: false }));
    }
  }, [fetchSpecialEvents]);
  
  // Bağlantı durumu değiştiğinde verileri yükle
  useEffect(() => {
    // Only load data when connected
    if (authState.isAuthenticated && connectionStatus === 'connected') {
      // Prevent multiple simultaneous data loading with a single state variable
      const needsInitialLoad = 
        (groups.length === 0 && !loading.groups) ||
        (excelFiles.length === 0 && !loading.files) ||
        (scheduledMessages.length === 0 && !loading.messages) ||
        (scheduledTasks.length === 0 && !loading.tasks) ||
        (specialEvents.length === 0 && !loading.specialEvents);
      
      if (needsInitialLoad) {
        // Grup verilerini yükle
        if (groups.length === 0 && !loading.groups) {
          refreshGroups();
        }
        
        // Excel dosyalarını yükle
        if (excelFiles.length === 0 && !loading.files) {
          fetchExcelFilesData();
        }
        
        // Zamanlanmış mesajları yükle
        if (scheduledMessages.length === 0 && !loading.messages) {
          fetchScheduledMessagesData();
        }
        
        // Zamanlanmış görevleri yükle
        if (scheduledTasks.length === 0 && !loading.tasks) {
          fetchScheduledTasks();
        }
        
        // Özel günleri yükle
        if (specialEvents.length === 0 && !loading.specialEvents) {
          fetchSpecialEvents();
        }
      }
    }
  }, [
    // Sadece temel bağımlılıkları izle, veri uzunlukları yerine loading durumlarını kullan
    authState.isAuthenticated, 
    connectionStatus,
    loading.groups,
    loading.files,
    loading.messages,
    loading.tasks,
    loading.specialEvents,
    refreshGroups,
    fetchExcelFilesData,
    fetchScheduledMessagesData,
    fetchScheduledTasks,
    specialEvents.length,
    fetchSpecialEvents
  ]);

  const createScheduledTask = useCallback(async (task: CreateScheduledTaskRequest) => {
    try {
      setLoading(prev => ({ ...prev, createTask: true }));
      await whatsappApi.createScheduledTask(task);
      // Refresh the tasks list
      await fetchScheduledTasks();
    } catch (error) {
      console.error('Error creating scheduled task:', error);
      setError('Failed to create scheduled task');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, createTask: false }));
    }
  }, [fetchScheduledTasks]);

  const updateScheduledTask = useCallback(async (id: string, updates: Partial<CreateScheduledTaskRequest>) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      await whatsappApi.updateScheduledTask(id, updates);
      // Refresh the tasks list
      await fetchScheduledTasks();
    } catch (error) {
      console.error(`Error updating scheduled task ${id}:`, error);
      setError('Failed to update scheduled task');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, [fetchScheduledTasks]);

  const deleteScheduledTask = useCallback(async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      await whatsappApi.deleteScheduledTask(id);
      // Refresh the tasks list
      await fetchScheduledTasks();
    } catch (error) {
      console.error(`Error deleting scheduled task ${id}:`, error);
      setError('Failed to delete scheduled task');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, [fetchScheduledTasks]);

  const runScheduledTask = useCallback(async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      await whatsappApi.runScheduledTask(id);
    } catch (error) {
      console.error(`Error running scheduled task ${id}:`, error);
      setError('Failed to run scheduled task');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, []);

  const fetchExcelFile = useCallback(async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, files: true }));
      const file = await whatsappApi.getExcelFile(id);
      return file;
    } catch (error) {
      console.error(`Error fetching Excel file ${id}:`, error);
      setError('Failed to fetch Excel file');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  }, []);

  const fetchExcelFiles = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, files: true }));
      const files = await whatsappApi.getExcelFiles();
      setExcelFiles(files);
    } catch (error) {
      console.error('Error fetching Excel files:', error);
      setError('Failed to fetch Excel files');
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  }, []);

  const fetchScheduledMessages = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, messages: true }));
      const messages = await whatsappApi.getScheduledMessages();
      setScheduledMessages(messages);
    } catch (error) {
      console.error('Error fetching scheduled messages:', error);
      setError('Failed to fetch scheduled messages');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, []);

  const deleteExcelFile = useCallback(async (id: string) => {
    try {
      setLoading(prev => ({ ...prev, deleteFile: true }));
      await whatsappApi.deleteExcelFile(id);
      setExcelFiles(prev => prev.filter(file => file._id !== id));
    } catch (error) {
      console.error(`Error deleting Excel file ${id}:`, error);
      setError('Failed to delete Excel file');
    } finally {
      setLoading(prev => ({ ...prev, deleteFile: false }));
    }
  }, []);

  // Add functions for silent mode
  const getSilentMessageMode = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, silentMode: true }));
      const { silentMode } = await whatsappApi.getSilentMessageMode();
      setSilentMessageModeState(silentMode);
    } catch (error) {
      console.error('Error getting silent message mode:', error);
      setError('Failed to get silent message mode');
    } finally {
      setLoading(prev => ({ ...prev, silentMode: false }));
    }
  }, []);
  
  const setSilentMessageMode = useCallback(async (enabled: boolean) => {
    try {
      setLoading(prev => ({ ...prev, silentMode: true }));
      const { silentMode } = await whatsappApi.setSilentMessageMode(enabled);
      setSilentMessageModeState(silentMode);
    } catch (error) {
      console.error('Error setting silent message mode:', error);
      setError('Failed to set silent message mode');
    } finally {
      setLoading(prev => ({ ...prev, silentMode: false }));
    }
  }, []);
  
  // Get initial silent mode setting on mount
  useEffect(() => {
    if (authState.isAuthenticated) {
      getSilentMessageMode();
    }
  }, [authState.isAuthenticated, getSilentMessageMode]);

  return (
    <WhatsAppContext.Provider
      value={{
        connectionStatus,
        qrCode,
        groups,
        excelFiles,
        scheduledMessages,
        scheduledTasks,
        silentMessageMode,
        loading,
        error,
        initializeWhatsApp,
        refreshGroups,
        sendMessage,
        sendGroupMessage,
        uploadExcelFile,
        fetchExcelFiles,
        fetchExcelFile,
        scheduleMessage,
        fetchScheduledMessages,
        fetchScheduledTasks,
        fetchScheduledTask,
        createScheduledTask,
        updateScheduledTask,
        deleteScheduledTask,
        runScheduledTask,
        getSilentMessageMode,
        setSilentMessageMode,
        deleteExcelFile,
        clearError,
        specialEvents,
        fetchSpecialEvents,
        createBirthdayEvent,
        createPolicyEvent,
        deleteSpecialEvent
      }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
}; 