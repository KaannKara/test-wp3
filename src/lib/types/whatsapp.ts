// WhatsApp connection status
export type WhatsAppStatus = 'disconnected' | 'connecting' | 'connected';

// WhatsApp QR code response
export interface WhatsAppQRResponse {
  qrCode?: string;
  qr?: string;
  connected?: boolean;
  retry?: boolean;
}

// WhatsApp group
export interface WhatsAppGroup {
  id: string;
  name: string;
  participants: string[];
}

// WhatsApp send message request
export interface SendMessageRequest {
  number: string;
  message: string;
  image?: File; // For image attachment
}

// WhatsApp send message response
export interface SendMessageResponse {
  success: boolean;
  result: any;
}

// WhatsApp send group message request
export interface SendGroupMessageRequest {
  groupId: string;
  message: string;
  image?: File; // For image attachment
}

// Excel file
export interface ExcelFile {
  _id: string;
  filename: string;
  originalName: string;
  headers: string[];
  uploadDate: string;
  userId: string;
}

// Scheduled message (old system)
export interface ScheduledMessage {
  _id: string;
  groupId: string;
  groupName: string;
  fileId: string;
  fileName: string;
  dateField: string;
  targetDate: string;
  messageTemplate: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// Schedule types for new scheduler system
export type ScheduleType = 'minutely' | 'hourly' | 'daily' | 'once' | 'expiry-date';
export type TaskStatus = 'active' | 'paused' | 'completed' | 'failed';

// Scheduled task (new system)
export interface ScheduledTask {
  _id: string;
  name: string;
  excelFileId: string;
  excelFile: ExcelFile;
  scheduleType: ScheduleType;
  selectedGroups: string[];
  selectedColumns: string[];
  messageTemplate: string;
  groupByDate: boolean;
  minutes?: number;
  hours?: number;
  timeOfDay?: string;
  scheduledDateTime?: string;
  expiryDateColumn?: string;
  expiryDateFormat?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  nextRun?: string;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

// Create scheduled task request
export interface CreateScheduledTaskRequest {
  name: string;
  excelFileId: string;
  scheduleType: ScheduleType;
  selectedGroups: string[];
  selectedColumns: string[];
  messageTemplate: string;
  groupByDate: boolean;
  minutes?: number;
  hours?: number;
  timeOfDay?: string;
  scheduledDateTime?: string;
  expiryDateColumn?: string;
  expiryDateFormat?: string;
}

// Özel gün bildirimi tipleri
export type SpecialEventType = 'birthday' | 'policy';

// Temel özel gün interface'i
export interface SpecialEvent {
  _id: string;
  type: 'birthday' | 'policy';
  name: string;
  excelFileId: string;
  dateColumn: string;
  nameColumn: string;
  phoneColumn: string;
  sendTime: string;
  messageTemplate: string;
  createdAt: string;
  updatedAt: string;
}

// Doğum günü bildirimi
export interface BirthdayEvent extends SpecialEvent {
  type: 'birthday';
  daysAdvance: number;
}

// Poliçe bildirimi
export interface PolicyEvent extends SpecialEvent {
  type: 'policy';
  daysBefore: number;
  policyNumberColumn: string;
}

// Doğum günü bildirimi oluşturma isteği
export interface CreateBirthdayEventRequest {
  name: string;
  excelFileId: string;
  dateColumn: string;
  nameColumn: string;
  phoneColumn: string;
  daysAdvance: number;
  sendTime: string;
  messageTemplate: string;
}

// Poliçe bildirimi oluşturma isteği
export interface CreatePolicyEventRequest {
  name: string;
  excelFileId: string;
  dateColumn: string;
  policyNumberColumn: string;
  nameColumn: string;
  phoneColumn: string;
  daysBefore: number;
  sendTime: string;
  messageTemplate: string;
}

export interface WhatsAppState {
  connectionStatus: WhatsAppStatus;
  qrCode: string | null;
  groups: WhatsAppGroup[];
  error: string | null;
}

export interface WhatsAppAction {
  type: string;
  payload?: any;
} 