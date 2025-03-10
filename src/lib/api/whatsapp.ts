import { post, get, put, del } from './client';
import { 
  WhatsAppQRResponse, 
  WhatsAppGroup,
  SendMessageRequest,
  SendMessageResponse,
  SendGroupMessageRequest,
  ExcelFile,
  ScheduledMessage,
  ScheduledTask,
  CreateScheduledTaskRequest
} from '../types/whatsapp';

// Önceki API isteğinden sonra ne kadar süre bekleneceğini belirleyen değişkenler
const API_THROTTLE_DURATION = 2000; // 2 saniye
const lastApiCalls = new Map<string, number>();

// API isteklerini throttle eden yardımcı fonksiyon
function shouldThrottleRequest(endpoint: string): boolean {
  const now = Date.now();
  const lastCallTime = lastApiCalls.get(endpoint) || 0;
  
  // Son çağrı üzerinden yeterli zaman geçtiyse, yeni çağrıya izin ver
  if (now - lastCallTime >= API_THROTTLE_DURATION) {
    lastApiCalls.set(endpoint, now);
    return false;
  }
  
  // Son çağrı çok yakın zamanda yapıldıysa, isteği engelle
  return true;
}

// Initialize WhatsApp connection
export const initializeWhatsApp = async (): Promise<{ message: string }> => {
  return await post<{ message: string }>('/whatsapp/init');
};

// Get WhatsApp connection status
export const getWhatsAppStatus = async (): Promise<WhatsAppQRResponse> => {
  const endpoint = '/whatsapp/status';
  
  // Durumu çok sık kontrol etmeyi önle
  if (shouldThrottleRequest(endpoint)) {
    console.log('WhatsApp status request throttled');
    // Önceki sonucu döndürmek için localStorage kullanabiliriz
    const cachedStatus = localStorage.getItem('whatsapp_status');
    if (cachedStatus) {
      return JSON.parse(cachedStatus);
    }
  }
  
  const response = await get<WhatsAppQRResponse>(endpoint);
  // Sonucu önbelleğe al
  localStorage.setItem('whatsapp_status', JSON.stringify(response));
  return response;
};

// Get WhatsApp QR code
export const getWhatsAppQR = async (): Promise<WhatsAppQRResponse> => {
  try {
    // First try to initialize WhatsApp
    await initializeWhatsApp();
    
    // Add a delay to allow the server to generate the QR code
    console.log('Waiting for QR code generation...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Then get QR code
    const response = await get<WhatsAppQRResponse>('/whatsapp/qr');
    
    // Check if we got a proper QR code
    if (response && (response.qr || response.qrCode)) {
      console.log('Successfully received QR code');
      // Convert to expected response format
      return { 
        qrCode: response.qr || response.qrCode || '',
        connected: response.connected || false
      };
    } else {
      console.log('QR response does not contain QR code:', response);
      return response;
    }
  } catch (error) {
    console.error('Error getting QR code:', error);
    throw error;
  }
};

// Get WhatsApp groups
export const getWhatsAppGroups = async (): Promise<WhatsAppGroup[]> => {
  return await get<WhatsAppGroup[]>('/whatsapp/groups');
};

// Send message to a number
export const sendMessage = async (request: SendMessageRequest): Promise<SendMessageResponse> => {
  // If there's an image, use FormData
  if (request.image) {
    const formData = new FormData();
    formData.append('number', request.number);
    formData.append('message', request.message);
    formData.append('image', request.image);
    
    return await post<SendMessageResponse>('/whatsapp/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  // Otherwise, send as JSON
  return await post<SendMessageResponse>('/whatsapp/send', {
    number: request.number,
    message: request.message
  });
};

// Send message to a group
export const sendGroupMessage = async (request: SendGroupMessageRequest): Promise<SendMessageResponse> => {
  // If there's an image, use FormData
  if (request.image) {
    const formData = new FormData();
    formData.append('groupId', request.groupId);
    formData.append('message', request.message);
    formData.append('image', request.image);
    
    return await post<SendMessageResponse>('/whatsapp/send-group', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  
  // Otherwise, send as JSON
  return await post<SendMessageResponse>('/whatsapp/send-group', {
    groupId: request.groupId,
    message: request.message
  });
};

// Upload Excel file
export const uploadExcelFile = async (file: File): Promise<ExcelFile> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return await post<ExcelFile>('/excel/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Get Excel files
export const getExcelFiles = async (): Promise<ExcelFile[]> => {
  return await get<ExcelFile[]>('/excel');
};

// Get a specific Excel file
export const getExcelFile = async (id: string): Promise<ExcelFile> => {
  return await get<ExcelFile>(`/excel/${id}`);
};

// Delete Excel file
export const deleteExcelFile = async (id: string): Promise<{ message: string }> => {
  return await del<{ message: string }>(`/excel/${id}`);
};

// Schedule message (old system)
export const scheduleMessage = async (
  groupId: string, 
  fileId: string, 
  dateField: string, 
  messageTemplate: string
): Promise<ScheduledMessage> => {
  return await post<ScheduledMessage>('/schedule', {
    groupId,
    fileId,
    dateField,
    messageTemplate
  });
};

// Get scheduled messages (old system)
export const getScheduledMessages = async (): Promise<ScheduledMessage[]> => {
  return await get<ScheduledMessage[]>('/schedule');
};

// NEW SCHEDULER API FUNCTIONS

// Get all scheduled tasks
export const getScheduledTasks = async (): Promise<ScheduledTask[]> => {
  return await get<ScheduledTask[]>('/scheduler');
};

// Get a scheduled task by ID
export const getScheduledTask = async (id: string): Promise<ScheduledTask> => {
  return await get<ScheduledTask>(`/scheduler/${id}`);
};

// Create a new scheduled task
export const createScheduledTask = async (task: CreateScheduledTaskRequest): Promise<ScheduledTask> => {
  return await post<ScheduledTask>('/scheduler', task);
};

// Update a scheduled task
export const updateScheduledTask = async (id: string, updates: Partial<CreateScheduledTaskRequest>): Promise<ScheduledTask> => {
  return await put<ScheduledTask>(`/scheduler/${id}`, updates);
};

// Delete a scheduled task
export const deleteScheduledTask = async (id: string): Promise<{ message: string }> => {
  return await del<{ message: string }>(`/scheduler/${id}`);
};

// Run a scheduled task immediately
export const runScheduledTask = async (id: string): Promise<{ message: string }> => {
  return await post<{ message: string }>(`/scheduler/${id}/run`);
};

/**
 * Get the silent message mode status
 * @returns {Promise<{ silentMode: boolean }>} - The silent mode status
 */
export const getSilentMessageMode = async (): Promise<{ silentMode: boolean }> => {
  return await get<{ silentMode: boolean }>('/whatsapp/silent-mode');
};

/**
 * Set the silent message mode
 * @param {boolean} enabled - Whether to enable or disable silent message mode
 * @returns {Promise<{ success: boolean, silentMode: boolean }>} - The result
 */
export const setSilentMessageMode = async (enabled: boolean): Promise<{ success: boolean, silentMode: boolean }> => {
  return await post<{ success: boolean, silentMode: boolean }>('/whatsapp/silent-mode', { enabled });
};

// Yeni API fonksiyonları ekleyelim

/**
 * Doğum günü bildirimi oluştur
 */
export const createBirthdayEvent = async (data: {
  name: string;
  excelFileId: string;
  dateColumn: string;
  nameColumn: string;
  phoneColumn: string;
  daysAdvance: number;
  sendTime: string;
  messageTemplate: string;
}): Promise<any> => {
  return await post<any>('/special-events/birthday', data);
};

/**
 * Poliçe bildirimi oluştur
 */
export const createPolicyEvent = async (data: {
  name: string;
  excelFileId: string;
  dateColumn: string;
  policyNumberColumn: string;
  nameColumn: string;
  phoneColumn: string;
  daysBefore: number;
  sendTime: string;
  messageTemplate: string;
}): Promise<any> => {
  return await post<any>('/special-events/policy', data);
};

/**
 * Özel gün bildirimlerini getir
 */
export const getSpecialEvents = async (): Promise<any[]> => {
  return await get<any[]>('/special-events');
};

/**
 * Özel gün bildirimini sil
 */
export const deleteSpecialEvent = async (id: string): Promise<{ success: boolean }> => {
  return await del<{ success: boolean }>(`/special-events/${id}`);
}; 