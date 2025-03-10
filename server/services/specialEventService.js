const SpecialEvent = require('../models/SpecialEvent');
const ExcelFile = require('../models/ExcelFile');
const whatsappService = require('./whatsappService');
const { parseExcelDates, formatDate } = require('../utils/dateUtils');
const logger = require('../utils/logger');

/**
 * Yeni bir özel gün bildirimi oluştur
 * @param {Object} eventData - Özel gün verileri
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<Object>} - Oluşturulan özel gün
 */
async function createSpecialEvent(eventData, userId) {
  try {
    // Veri modeline uygun özel gün oluştur
    const specialEvent = new SpecialEvent({
      ...eventData,
      userId
    });
    
    // Veritabanına kaydet
    await specialEvent.save();
    logger.info(`Yeni ${eventData.type} bildirimi oluşturuldu, kullanıcı: ${userId}`);
    return specialEvent;
  } catch (error) {
    logger.error('Özel gün oluşturma hatası:', error);
    throw error;
  }
}

/**
 * Özel günleri işle ve bildirim gönder
 * @returns {Promise<Object>} - İşlem sonucu
 */
async function processSpecialEvents() {
  try {
    // Bildirim gönderilmesi gereken özel günleri bul
    const events = await SpecialEvent.findDueEvents();
    logger.info(`İşlenecek ${events.length} özel gün bildirimi bulundu`);
    
    const results = {
      total: events.length,
      success: 0,
      failed: 0,
      details: []
    };
    
    // Her özel gün için
    for (const event of events) {
      try {
        // Excel dosyasını bul
        const excelFile = await ExcelFile.findById(event.excelFileId);
        if (!excelFile) {
          logger.error(`Excel dosyası bulunamadı: ${event.excelFileId}`);
          results.failed++;
          results.details.push({
            eventId: event._id,
            name: event.name,
            error: 'Excel dosyası bulunamadı'
          });
          continue;
        }
        
        // Event tipine göre işlem yap
        if (event.type === 'birthday') {
          await processBirthdayEvent(event, excelFile, results);
        } else if (event.type === 'policy') {
          await processPolicyEvent(event, excelFile, results);
        }
        
        // İşlenen bildirimi güncelle
        event.lastRun = new Date();
        await event.save();
      } catch (error) {
        logger.error(`Özel gün işleme hatası: ${event._id}`, error);
        results.failed++;
        results.details.push({
          eventId: event._id,
          name: event.name,
          error: error.message
        });
      }
    }
    
    logger.info(`Özel gün işleme tamamlandı: ${results.success} başarılı, ${results.failed} başarısız`);
    return results;
  } catch (error) {
    logger.error('Özel günleri işleme hatası:', error);
    throw error;
  }
}

/**
 * Doğum günü bildirimi işle ve gönder
 * @param {Object} event - Doğum günü event objesi
 * @param {Object} excelFile - Excel dosyası
 * @param {Object} results - Sonuç objesi
 */
async function processBirthdayEvent(event, excelFile, results) {
  // Excel verilerini tarihleriyle beraber parse et
  const { parsedData } = await parseExcelDates(excelFile.data, event.dateColumn);
  
  // Bugünün tarihini al
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Eğer önden gönderim varsa tarihi güncelle (ör. 1 gün önce bildirim)
  if (event.daysAdvance > 0) {
    today.setDate(today.getDate() + event.daysAdvance);
  }
  
  // Doğum günü bugün olan kişileri bul
  const birthdayRecords = parsedData.filter(record => {
    if (!record[event.dateColumn]) return false;
    
    const birthdate = new Date(record[event.dateColumn]);
    // Gün ve ay eşleşmeli (yılı kontrol etmiyoruz)
    return birthdate.getDate() === today.getDate() && 
           birthdate.getMonth() === today.getMonth();
  });
  
  logger.info(`Bugün ${birthdayRecords.length} kişinin doğum günü var`);
  
  // Her doğum günü için mesaj gönder
  for (const record of birthdayRecords) {
    try {
      // Telefon numarasını al ve formatla
      let phoneNumber = record[event.phoneColumn];
      if (!phoneNumber) {
        logger.warn(`Telefon numarası bulunamadı: ${record[event.nameColumn]}`);
        continue;
      }
      
      // Telefon numarasını formatla (sadece rakamları al)
      phoneNumber = phoneNumber.toString().replace(/\D/g, '');
      if (!phoneNumber.startsWith('9')) phoneNumber = '9' + phoneNumber;
      if (!phoneNumber.startsWith('90')) phoneNumber = '90' + phoneNumber;
      
      // Mesaj şablonunu kişiselleştir
      let message = event.messageTemplate;
      
      // Tüm alanları değiştir
      Object.keys(record).forEach(key => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), record[key]);
      });
      
      // Özel alanları değiştir
      message = message.replace(/{{AD_SOYAD}}/g, record[event.nameColumn] || 'Müşterimiz');
      message = message.replace(/{{DOĞUM_TARİHİ}}/g, formatDate(record[event.dateColumn]));
      
      // WhatsApp mesajı gönder
      await whatsappService.sendMessage(event.userId, phoneNumber, message);
      
      results.success++;
      logger.info(`Doğum günü mesajı gönderildi: ${record[event.nameColumn]}`);
    } catch (error) {
      logger.error(`Doğum günü mesajı gönderme hatası: ${record[event.nameColumn]}`, error);
      results.failed++;
      results.details.push({
        record: record[event.nameColumn],
        error: error.message
      });
    }
  }
}

/**
 * Poliçe bildirimi işle ve gönder
 * @param {Object} event - Poliçe event objesi
 * @param {Object} excelFile - Excel dosyası
 * @param {Object} results - Sonuç objesi
 */
async function processPolicyEvent(event, excelFile, results) {
  // Excel verilerini tarihleriyle beraber parse et
  const { parsedData } = await parseExcelDates(excelFile.data, event.dateColumn);
  
  // Bugünün tarihini al
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Gönderilecek tarihi hesapla (bugün + daysBefore)
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + event.daysBefore);
  
  // Bitiş tarihi hedef tarihte olan poliçeleri bul
  const policyRecords = parsedData.filter(record => {
    if (!record[event.dateColumn]) return false;
    
    const expiryDate = new Date(record[event.dateColumn]);
    expiryDate.setHours(0, 0, 0, 0);
    
    // Tam tarih eşleşmeli
    return expiryDate.getTime() === targetDate.getTime();
  });
  
  logger.info(`${event.daysBefore} gün sonra bitecek ${policyRecords.length} poliçe var`);
  
  // Her poliçe için mesaj gönder
  for (const record of policyRecords) {
    try {
      // Telefon numarasını al ve formatla
      let phoneNumber = record[event.phoneColumn];
      if (!phoneNumber) {
        logger.warn(`Telefon numarası bulunamadı: ${record[event.nameColumn]}`);
        continue;
      }
      
      // Telefon numarasını formatla (sadece rakamları al)
      phoneNumber = phoneNumber.toString().replace(/\D/g, '');
      if (!phoneNumber.startsWith('9')) phoneNumber = '9' + phoneNumber;
      if (!phoneNumber.startsWith('90')) phoneNumber = '90' + phoneNumber;
      
      // Mesaj şablonunu kişiselleştir
      let message = event.messageTemplate;
      
      // Tüm alanları değiştir
      Object.keys(record).forEach(key => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), record[key]);
      });
      
      // Özel alanları değiştir
      message = message.replace(/{{AD_SOYAD}}/g, record[event.nameColumn] || 'Müşterimiz');
      message = message.replace(/{{POLİÇE_NO}}/g, record[event.policyNumberColumn] || '');
      message = message.replace(/{{BİTİŞ_TARİHİ}}/g, formatDate(record[event.dateColumn]));
      
      // WhatsApp mesajı gönder
      await whatsappService.sendMessage(event.userId, phoneNumber, message);
      
      results.success++;
      logger.info(`Poliçe bildirim mesajı gönderildi: ${record[event.nameColumn]}`);
    } catch (error) {
      logger.error(`Poliçe bildirim mesajı gönderme hatası: ${record[event.nameColumn]}`, error);
      results.failed++;
      results.details.push({
        record: record[event.nameColumn],
        error: error.message
      });
    }
  }
}

/**
 * Kullanıcının özel gün bildirimlerini getir
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<Array>} - Özel günler listesi
 */
async function getSpecialEventsByUser(userId) {
  try {
    return await SpecialEvent.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    logger.error(`Kullanıcı özel günlerini getirme hatası: ${userId}`, error);
    throw error;
  }
}

/**
 * Özel gün bildirimini sil
 * @param {string} eventId - Özel gün ID
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise<boolean>} - Başarı durumu
 */
async function deleteSpecialEvent(eventId, userId) {
  try {
    const result = await SpecialEvent.deleteOne({ _id: eventId, userId });
    if (result.deletedCount === 0) {
      throw new Error('Özel gün bulunamadı veya silme izniniz yok');
    }
    logger.info(`Özel gün silindi: ${eventId}, kullanıcı: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Özel gün silme hatası: ${eventId}`, error);
    throw error;
  }
}

// Dışa aktarılan fonksiyonlar
module.exports = {
  createSpecialEvent,
  processSpecialEvents,
  getSpecialEventsByUser,
  deleteSpecialEvent
}; 