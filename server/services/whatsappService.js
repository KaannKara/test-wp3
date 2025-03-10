const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const qrcode = require('qrcode');
const User = require('../models/User');

// Store active connections
const connections = new Map();
const qrCodes = new Map();
const qrGenerationTimes = new Map();
const qrAttempts = new Map();
const reconnectAttempts = new Map();
const sessions = new Map();
const retryAttempts = new Map();
const reconnectTimers = new Map();
const connectionStates = new Map();

// Constants
const QR_TIMEOUT = 60000; // 1 minute
const QR_GENERATION_INTERVAL = 30000; // 30 seconds
const MAX_QR_ATTEMPTS = 3; // Maximum 3 attempts
const MAX_RECONNECT_ATTEMPTS = 3; // Maximum reconnection attempts
const RETRY_INTERVAL = 5000; // 5 seconds between retries
const CONNECTION_TIMEOUT = 60000; // 60 seconds
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;

// Create required directories
const sessionsDir = path.join(__dirname, '../sessions');
const uploadsDir = path.join(__dirname, '../uploads');
[sessionsDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Mesaj alındığında otomatik olarak API çağrılarını kontrol edecek flag
let isSilentMessageMode = true;

/**
 * Initialize: Check for existing sessions and reconnect
 */
async function initializeSessions() {
  try {
    logger.info('Checking for existing WhatsApp sessions...');
    
    // First check database for connected users
    const connectedUsers = await User.find({ whatsappConnected: true });
    
    if (connectedUsers.length > 0) {
      logger.info(`Found ${connectedUsers.length} connected users in database`);
      
      for (const user of connectedUsers) {
        const userId = user._id.toString();
        try {
          logger.info(`Attempting to restore session for user ${userId} from database`);
          await createConnection(userId);
          logger.info(`Successfully restored session for user ${userId} from database`);
        } catch (error) {
          logger.error(`Failed to restore session for user ${userId} from database:`, error);
          // Update user status in database
          await updateUserWhatsappStatus(userId, false);
        }
      }
    } else {
      logger.info('No connected users found in database');
    }
    
    // Then check filesystem for any missing sessions
if (!fs.existsSync(sessionsDir)) {
      logger.info('No sessions directory found, creating...');
  fs.mkdirSync(sessionsDir, { recursive: true });
      return;
    }
    
    // Get all session folders
    const sessionFolders = fs.readdirSync(sessionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (sessionFolders.length === 0) {
      logger.info('No saved sessions found on filesystem');
      return;
    }
    
    logger.info(`Found ${sessionFolders.length} saved session(s) on filesystem`);
    
    // Extract user IDs from folder names
    for (const folder of sessionFolders) {
      if (folder.startsWith('session-')) {
        const userId = folder.replace('session-', '');
        
        // Skip if already processed from database
        if (connectedUsers.some(user => user._id.toString() === userId)) {
          logger.info(`Session for user ${userId} already processed from database`);
          continue;
        }
        
        logger.info(`Found saved session for user: ${userId} on filesystem`);
        
        // Check if session has creds.json
        const credsPath = path.join(sessionsDir, folder, 'creds.json');
        if (fs.existsSync(credsPath)) {
          // Try to reconnect
          try {
            logger.info(`Attempting to restore session for user ${userId} from filesystem`);
            await createConnection(userId);
            logger.info(`Successfully restored session for user ${userId} from filesystem`);
            
            // Update user in database if session is valid
            const user = await User.findById(userId);
            if (user) {
              await updateUserWhatsappStatus(userId, true, userId);
            }
          } catch (error) {
            logger.error(`Failed to restore session for user ${userId} from filesystem:`, error);
          }
        } else {
          logger.info(`Session folder exists but no credentials found for user ${userId}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error initializing WhatsApp sessions:', error);
  }
}

// Run initialization on module load
(async () => {
  await initializeSessions();
})();

/**
 * Clear session data for a user
 */
async function clearSession(userId) {
  // Clear any existing reconnect timers
  if (reconnectTimers.has(userId)) {
    clearTimeout(reconnectTimers.get(userId));
    reconnectTimers.delete(userId);
  }

  const sessionDir = path.join(sessionsDir, `session-${userId}`);
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }
  
  connections.delete(userId);
  qrCodes.delete(userId);
  qrGenerationTimes.delete(userId);
  qrAttempts.delete(userId);
  reconnectAttempts.delete(userId);
  sessions.delete(userId);
  connectionStates.delete(userId);
  retryAttempts.delete(userId);
  
  logger.info(`Session cleared for user ${userId}`);
}

/**
 * Check if QR code can be generated
 */
function canGenerateQR(userId) {
  const attempts = qrAttempts.get(userId) || 0;
  const lastGenTime = qrGenerationTimes.get(userId);
  const connection = connections.get(userId);
  
  // Don't generate new QR if already connected
  if (connection?.connected) {
    return false;
  }
  
  if (attempts >= MAX_QR_ATTEMPTS) {
    console.log(`Maximum QR attempts (${MAX_QR_ATTEMPTS}) reached for user ${userId}`);
    return false;
  }
  
  if (lastGenTime) {
    const timeSinceLastGen = Date.now() - lastGenTime;
    if (timeSinceLastGen < QR_GENERATION_INTERVAL) {
      const remainingTime = Math.ceil((QR_GENERATION_INTERVAL - timeSinceLastGen) / 1000);
      if (remainingTime > 0) {
        console.log(`Waiting for QR generation interval (${remainingTime}s remaining)`);
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Create a WhatsApp connection
 */
async function createConnection(userId, forceNewSession = false) {
  try {
    // Clear any existing reconnect timers
    if (reconnectTimers.has(userId)) {
      clearTimeout(reconnectTimers.get(userId));
      reconnectTimers.delete(userId);
    }

    const existingConn = connections.get(userId);
    if (!forceNewSession && existingConn?.sock && existingConn.connected) {
      return existingConn.sock;
    }

    if (forceNewSession) {
      await clearSession(userId);
    }

    const sessionDir = path.join(sessionsDir, `session-${userId}`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
      logger,
      browser: ["Chrome (Linux)", "Chrome", "104.0.0.0"],
      connectTimeoutMs: CONNECTION_TIMEOUT,
      qrTimeout: QR_TIMEOUT,
      defaultQueryTimeoutMs: 30000,
      emitOwnEvents: true,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      throwErrorOnTosBlock: false,
      retryRequestDelayMs: 2000
    });

    // Set initial connection state
    connectionStates.set(userId, {
      status: 'connecting',
      lastError: null,
      lastAttempt: Date.now()
    });
    
    // Log the connection attempt for debugging
    console.log(`Creating WhatsApp connection for user ${userId}`);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    // Log updates for debugging
    console.log(`Connection update for user ${userId}:`, { 
      connection, 
      hasLastDisconnect: !!lastDisconnect, 
      hasQR: !!qr 
    });
      
      // Update connection state
      if (connection) {
        connectionStates.set(userId, {
          ...connectionStates.get(userId),
          status: connection,
          lastUpdate: Date.now()
        });
      }

      if (qr && canGenerateQR(userId)) {
        try {
          console.log(`Generating QR code for user ${userId}`);
          const qrDataUrl = await qrcode.toDataURL(qr);
          qrCodes.set(userId, qrDataUrl);
          connections.set(userId, { 
            ...connections.get(userId), 
            qr: qrDataUrl, 
            connected: false,
            sock 
          });
          logger.info(`Generated QR code for user ${userId}`);
          console.log(`QR code stored in memory for user ${userId}`);
        } catch (err) {
          logger.error('QR generation error:', err);
        }
      }

      if (connection === 'open') {
        logger.info(`Connected successfully for user ${userId}`);
        qrCodes.delete(userId);
        retryAttempts.delete(userId);
        
        // Update connection state
      connections.set(userId, { 
        sock, 
        connected: true,
        qr: null 
      });

        // Update user in database
        await updateUserWhatsappStatus(userId, true, userId);

        // Save credentials
        try {
          await saveCreds();
        } catch (err) {
          logger.error('Error saving credentials:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const lastError = lastDisconnect?.error;
        
        // Update connection state
        connectionStates.set(userId, {
          ...connectionStates.get(userId),
          status: 'closed',
          lastError: lastError,
          statusCode: statusCode,
          lastDisconnect: Date.now()
        });
        
        logger.info(`Connection closed for user ${userId} with status code: ${statusCode}`);

        // Handle stream error (515) - this is expected after QR scan
        if (statusCode === 515) {
          logger.info('Stream error detected (expected after QR scan), reconnecting...');
          
          // Set a timeout to reconnect
          const timer = setTimeout(async () => {
            try {
              // Don't force new session for stream errors
              await createConnection(userId, false);
            } catch (err) {
              logger.error('Reconnection failed after stream error:', err);
            }
          }, RECONNECT_INTERVAL);
          
          reconnectTimers.set(userId, timer);
        } 
        // Handle logged out
        else if (statusCode === DisconnectReason.loggedOut) {
          logger.info('User logged out, clearing session');
          await clearSession(userId);
          await updateUserWhatsappStatus(userId, false);
        }
        // Handle other connection errors
        else {
          const attempts = (retryAttempts.get(userId) || 0) + 1;
          retryAttempts.set(userId, attempts);
          
          if (attempts <= MAX_RETRIES) {
            logger.info(`Connection error, attempt ${attempts}/${MAX_RETRIES}`);
            
            // Set a timeout to reconnect
            const timer = setTimeout(async () => {
              try {
                await createConnection(userId, false);
              } catch (err) {
                logger.error('Reconnection failed:', err);
              }
            }, RECONNECT_INTERVAL);
            
            reconnectTimers.set(userId, timer);
          } else {
            logger.info(`Max retries (${MAX_RETRIES}) reached for user ${userId}, clearing session`);
            await clearSession(userId);
          }
        }
      }
    });

    // Mesaj alındığında otomatik refresh'i önlemek için özel handler ekliyoruz
    sock.ev.on('messages.upsert', async (m) => {
      if (isSilentMessageMode) {
        // Sadece mesajın alındığını logla, ama API çağrılarını tetikleme
        logger.info(`WhatsApp message received for user ${userId} - silent mode active, not triggering API calls`);
        return;
      }
      
      // İhtiyaç duyulursa burada özel işlemler yapılabilir
      logger.info(`WhatsApp message received for user ${userId}`);
    });

  sock.ev.on('creds.update', saveCreds);
  
    connections.set(userId, { 
      sock, 
      connected: false, 
      qr: null 
    });
    
    sessions.set(userId, sock);
  
  return sock;
  } catch (error) {
    logger.error('Connection creation error:', error);
    connectionStates.set(userId, {
      ...connectionStates.get(userId),
      status: 'error',
      lastError: error,
      lastUpdate: Date.now()
    });
    connections.set(userId, { connected: false, qr: null });
    throw error;
  }
}

/**
 * Get a user's WhatsApp connection
 * @param {string} userId - The user ID to get the connection for
 * @returns {Object|null} - The WhatsApp connection or null if not found
 */
function getConnection(userId) {
  return connections.get(userId) || null;
}

/**
 * Get a user's WhatsApp QR code
 * @param {string} userId - The user ID to get the QR code for
 * @returns {string|null} - The QR code data URL or null if not available
 */
function getQRCode(userId) {
  const connection = connections.get(userId);
  return connection?.qr || null;
}

/**
 * Get a user's WhatsApp session
 * @param {string} userId - The user ID to get the session for
 * @returns {Object|null} - The WhatsApp session or null if not found
 */
function getSession(userId) {
  return sessions.get(userId);
}

/**
 * Send a message to a WhatsApp number
 * @param {string} userId - The user ID sending the message
 * @param {string} number - The phone number to send to (with country code)
 * @param {string} message - The message to send
 * @param {Buffer|string} [image] - Optional image buffer or path to send
 * @returns {Promise<Object>} - The result of the send operation
 */
async function sendMessage(userId, number, message, image = null) {
  const connection = connections.get(userId);
  
  if (!connection || !connection.connected) {
    throw new Error('WhatsApp connection not established');
  }
  
  // Format number (ensure it has @s.whatsapp.net)
  const formattedNumber = number.includes('@s.whatsapp.net') 
    ? number 
    : `${number.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
  
  // Send message with or without image
  if (image) {
    return await connection.sock.sendMessage(formattedNumber, {
      image: typeof image === 'string' ? { url: image } : image,
      caption: message
    });
  } else {
  return await connection.sock.sendMessage(formattedNumber, { text: message });
  }
}

/**
 * Send a message to a WhatsApp group
 * @param {string} userId - The user ID sending the message
 * @param {string} groupId - The group ID to send to
 * @param {string} message - The message to send
 * @param {Buffer|string} [image] - Optional image buffer or path to send
 * @returns {Promise<Object>} - The result of the send operation
 */
async function sendGroupMessage(userId, groupId, message, image = null) {
  const connection = connections.get(userId);
  
  if (!connection || !connection.connected) {
    throw new Error('WhatsApp connection not established');
  }
  
  // Format group ID (ensure it has @g.us)
  const formattedGroupId = groupId.includes('@g.us') 
    ? groupId 
    : `${groupId}@g.us`;
  
  // Send message with or without image
  if (image) {
    return await connection.sock.sendMessage(formattedGroupId, {
      image: typeof image === 'string' ? { url: image } : image,
      caption: message
    });
  } else {
  return await connection.sock.sendMessage(formattedGroupId, { text: message });
  }
}

/**
 * Get all WhatsApp groups for a user
 * @param {string} userId - The user ID to get groups for
 * @returns {Promise<Array>} - Array of groups
 */
async function getGroups(userId) {
  try {
    const sock = getSession(userId);
  
    if (!sock) {
      logger.error(`No session found for user ${userId}`);
    throw new Error('WhatsApp connection not established');
  }
  
    // Check connection state
    const connectionState = connections.get(userId);
    if (!connectionState || !connectionState.connected) {
      logger.error(`User ${userId} is not connected to WhatsApp`);
      throw new Error('WhatsApp connection not active');
    }
    
    logger.info(`Fetching groups for user ${userId}`);
    
    // Get all chats with a timeout
    try {
      const chats = await sock.groupFetchAllParticipating();
      
      if (!chats || Object.keys(chats).length === 0) {
        logger.info(`No groups found for user ${userId}`);
        return [];
      }
  
  // Filter and format groups
      const groups = Object.entries(chats).map(([id, group]) => ({
        id,
        name: group.subject || 'Unnamed Group',
        participants: group.participants?.map(p => p.id) || []
      }));
      
      logger.info(`Found ${groups.length} groups for user ${userId}`);
      return groups;
    } catch (error) {
      logger.error(`Error fetching groups: ${error.message}`);
      
      // If it's a connection error, try to refresh the connection
      if (error.message.includes('connection')) {
        logger.info('Connection error detected, attempting to refresh connection');
        await createConnection(userId, false);
      }
      
      // Return empty array instead of throwing
      return [];
    }
  } catch (error) {
    logger.error(`getGroups error for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user's WhatsApp connection status in the database
 */
async function updateUserWhatsappStatus(userId, connected, sessionId = null) {
  try {
    await User.findByIdAndUpdate(userId, {
      whatsappConnected: connected,
      whatsappSessionId: sessionId,
      whatsappLastConnection: connected ? Date.now() : null
    });
    logger.info(`Updated user ${userId} WhatsApp status to ${connected ? 'connected' : 'disconnected'}`);
  } catch (error) {
    logger.error(`Failed to update user ${userId} WhatsApp status:`, error);
  }
}

/**
 * Disconnect and delete a WhatsApp session for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if disconnected successfully, false otherwise
 */
async function disconnectAndDeleteSession(userId) {
  try {
    logger.info(`Disconnecting and deleting WhatsApp session for user: ${userId}`);
    
    // Get the connection
    const connection = getConnection(userId);
    
    // Check if connection exists
    if (!connection) {
      logger.warn(`No active connection found for user: ${userId}`);
      return false;
    }
    
    // Disconnect if connected
    if (connection.connected) {
      try {
        // Attempt graceful logout first
        await connection.sock.logout();
        logger.info(`Successfully logged out WhatsApp session for user: ${userId}`);
      } catch (logoutError) {
        logger.warn(`Error during logout for user: ${userId}`, logoutError);
        // Continue with disconnect even if logout fails
      }
      
      // Close connection
      connection.sock.end();
      connection.connected = false;
      logger.info(`Closed WhatsApp connection for user: ${userId}`);
    }
    
    // Delete session files
    const sessionFolder = path.join(sessionsDir, `session-${userId}`);
    if (fs.existsSync(sessionFolder)) {
      try {
        // Delete directory recursively
        fs.rmSync(sessionFolder, { recursive: true, force: true });
        logger.info(`Deleted session folder for user: ${userId}`);
      } catch (deleteError) {
        logger.error(`Failed to delete session folder for user: ${userId}`, deleteError);
        return false;
      }
    }
    
    // Clear from memory maps
    connections.delete(userId);
    qrCodes.delete(userId);
    qrGenerationTimes.delete(userId);
    qrAttempts.delete(userId);
    reconnectAttempts.delete(userId);
    sessions.delete(userId);
    retryAttempts.delete(userId);
    
    // Clear any reconnect timers
    if (reconnectTimers.has(userId)) {
      clearTimeout(reconnectTimers.get(userId));
      reconnectTimers.delete(userId);
    }
    
    // Update user in database
    const user = await User.findById(userId);
    if (user) {
      user.whatsappConnected = false;
      user.whatsappSessionId = null;
      user.whatsappLastConnection = null;
      await user.save();
      logger.info(`Updated user record for ${userId} - WhatsApp disconnected`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error disconnecting WhatsApp session for user: ${userId}`, error);
    return false;
  }
}

/**
 * Get orphaned sessions - sessions that exist in filesystem but not in database
 * @returns {Promise<Array>} - Array of orphaned session IDs
 */
async function getOrphanedSessions() {
  try {
    logger.info('Checking for orphaned WhatsApp sessions...');
    
    // Get all session folders from the filesystem
    let sessionFolders = [];
    try {
      const files = fs.readdirSync(sessionsDir);
      sessionFolders = files
        .filter(folder => folder.startsWith('session-'))
        .map(folder => folder.replace('session-', ''));
      
      logger.info(`Found ${sessionFolders.length} session folders in filesystem`);
    } catch (err) {
      logger.error('Error reading sessions directory:', err);
      return [];
    }
    
    if (sessionFolders.length === 0) {
      return [];
    }
    
    // Get all users from the database
    const users = await User.find();
    const userIds = users.map(user => user._id.toString());
    
    // Find orphaned sessions (sessions without a corresponding user)
    const orphanedSessions = sessionFolders.filter(sessionId => !userIds.includes(sessionId));
    
    if (orphanedSessions.length > 0) {
      logger.info(`Found ${orphanedSessions.length} orphaned session(s): ${orphanedSessions.join(', ')}`);
    } else {
      logger.info('No orphaned sessions found');
    }
    
    // Gather additional info about each orphaned session
    const orphanedSessionsInfo = [];
    for (const sessionId of orphanedSessions) {
      try {
        // Check if the session is connected
        const conn = getConnection(sessionId);
        const connected = conn ? conn.connected : false;
        
        // Get the session folder path
        const sessionPath = path.join(sessionsDir, `session-${sessionId}`);
        
        // Get creation time from folder stats
        const stats = fs.statSync(sessionPath);
        
        orphanedSessionsInfo.push({
          id: sessionId,
          connected,
          path: sessionPath,
          createdAt: stats.birthtime || stats.ctime,
          lastModified: stats.mtime
        });
      } catch (err) {
        logger.error(`Error getting info for orphaned session ${sessionId}:`, err);
        orphanedSessionsInfo.push({
          id: sessionId,
          connected: false,
          path: path.join(sessionsDir, `session-${sessionId}`),
          error: err.message
        });
      }
    }
    
    return orphanedSessionsInfo;
  } catch (error) {
    logger.error('Error checking for orphaned sessions:', error);
    return [];
  }
}

/**
 * Delete an orphaned session by ID
 * @param {string} sessionId - Session ID to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
async function deleteOrphanedSession(sessionId) {
  try {
    logger.info(`Deleting orphaned session: ${sessionId}`);
    
    // Get the connection if it exists
    const connection = getConnection(sessionId);
    
    // Disconnect if connected
    if (connection && connection.connected) {
      try {
        // Attempt graceful logout first
        await connection.sock.logout();
        logger.info(`Successfully logged out orphaned session: ${sessionId}`);
      } catch (logoutError) {
        logger.warn(`Error during logout for orphaned session: ${sessionId}`, logoutError);
        // Continue with disconnect even if logout fails
      }
      
      // Close connection
      connection.sock.end();
      connection.connected = false;
      logger.info(`Closed orphaned WhatsApp connection: ${sessionId}`);
    }
    
    // Delete session files
    const sessionFolder = path.join(sessionsDir, `session-${sessionId}`);
    if (fs.existsSync(sessionFolder)) {
      try {
        // Delete directory recursively
        fs.rmSync(sessionFolder, { recursive: true, force: true });
        logger.info(`Deleted orphaned session folder: ${sessionFolder}`);
      } catch (deleteError) {
        logger.error(`Failed to delete orphaned session folder: ${sessionFolder}`, deleteError);
        return false;
      }
    } else {
      logger.warn(`Orphaned session folder not found: ${sessionFolder}`);
      return false;
    }
    
    // Clear from memory maps
    connections.delete(sessionId);
    qrCodes.delete(sessionId);
    qrGenerationTimes.delete(sessionId);
    qrAttempts.delete(sessionId);
    reconnectAttempts.delete(sessionId);
    sessions.delete(sessionId);
    retryAttempts.delete(sessionId);
    
    // Clear any reconnect timers
    if (reconnectTimers.has(sessionId)) {
      clearTimeout(reconnectTimers.get(sessionId));
      reconnectTimers.delete(sessionId);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error deleting orphaned session: ${sessionId}`, error);
    return false;
  }
}

// Mesajları sessizce almak için bir yardımcı fonksiyon
function setSilentMessageMode(value) {
  isSilentMessageMode = value;
  logger.info(`WhatsApp silent message mode set to: ${value}`);
}

module.exports = {
  createConnection,
  getConnection,
  getQRCode,
  getSession,
  clearSession,
  sendMessage,
  sendGroupMessage,
  getGroups,
  initializeSessions,
  updateUserWhatsappStatus,
  disconnectAndDeleteSession,
  getOrphanedSessions,
  deleteOrphanedSession,
  setSilentMessageMode,
  isSilentMessageMode: () => isSilentMessageMode
}; 