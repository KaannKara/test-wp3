const specialEventService = require('../services/specialEventService');
const ExcelFile = require('../models/ExcelFile');
const logger = require('../utils/logger');

/**
 * Yeni doğum günü bildirimi oluştur
 * @route POST /api/special-events/birthday
 */
exports.createBirthdayEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      excelFileId,
      dateColumn,
      nameColumn,
      phoneColumn,
      daysAdvance,
      sendTime,
      messageTemplate
    } = req.body;
    
    // Gerekli alanları kontrol et
    if (!excelFileId || !dateColumn || !nameColumn || !phoneColumn || !messageTemplate) {
      return res.status(400).json({
        message: 'Eksik alan: excelFileId, dateColumn, nameColumn, phoneColumn ve messageTemplate alanları gerekli'
      });
    }
    
    // Excel dosyasının varlığını kontrol et
    const excelFile = await ExcelFile.findOne({ _id: excelFileId, userId });
    if (!excelFile) {
      return res.status(404).json({ message: 'Excel dosyası bulunamadı' });
    }
    
    // Yeni doğum günü bildirimi oluştur
    const birthdayEvent = await specialEventService.createSpecialEvent({
      name: name || 'Doğum Günü Bildirimi',
      type: 'birthday',
      excelFileId,
      dateColumn,
      nameColumn,
      phoneColumn,
      daysAdvance: parseInt(daysAdvance || 0),
      sendTime: sendTime || '09:00',
      messageTemplate
    }, userId);
    
    res.status(201).json(birthdayEvent);
  } catch (error) {
    logger.error('Doğum günü bildirimi oluşturma hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Yeni poliçe bildirimi oluştur
 * @route POST /api/special-events/policy
 */
exports.createPolicyEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      excelFileId,
      dateColumn,
      policyNumberColumn,
      nameColumn,
      phoneColumn,
      daysBefore,
      sendTime,
      messageTemplate
    } = req.body;
    
    // Gerekli alanları kontrol et
    if (!excelFileId || !dateColumn || !policyNumberColumn || !phoneColumn || !messageTemplate) {
      return res.status(400).json({
        message: 'Eksik alan: excelFileId, dateColumn, policyNumberColumn, phoneColumn ve messageTemplate alanları gerekli'
      });
    }
    
    // Excel dosyasının varlığını kontrol et
    const excelFile = await ExcelFile.findOne({ _id: excelFileId, userId });
    if (!excelFile) {
      return res.status(404).json({ message: 'Excel dosyası bulunamadı' });
    }
    
    // Yeni poliçe bildirimi oluştur
    const policyEvent = await specialEventService.createSpecialEvent({
      name: name || 'Poliçe Bildirimi',
      type: 'policy',
      excelFileId,
      dateColumn,
      policyNumberColumn,
      nameColumn: nameColumn || '',
      phoneColumn,
      daysBefore: parseInt(daysBefore || 7),
      sendTime: sendTime || '10:00',
      messageTemplate
    }, userId);
    
    res.status(201).json(policyEvent);
  } catch (error) {
    logger.error('Poliçe bildirimi oluşturma hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Kullanıcının özel gün bildirimlerini getir
 * @route GET /api/special-events
 */
exports.getSpecialEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await specialEventService.getSpecialEventsByUser(userId);
    
    // Excel dosya adlarını ekleyerek yanıt ver
    const fileIds = [...new Set(events.map(event => event.excelFileId.toString()))];
    const excelFiles = await ExcelFile.find({ _id: { $in: fileIds } });
    
    const fileMap = excelFiles.reduce((map, file) => {
      map[file._id.toString()] = file.originalName;
      return map;
    }, {});
    
    const eventsWithFileNames = events.map(event => {
      const eventObj = event.toObject();
      eventObj.excelFileName = fileMap[event.excelFileId.toString()] || 'Bilinmeyen Dosya';
      return eventObj;
    });
    
    res.json(eventsWithFileNames);
  } catch (error) {
    logger.error('Özel gün bildirimleri getirme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Özel gün bildirimini sil
 * @route DELETE /api/special-events/:id
 */
exports.deleteSpecialEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    
    await specialEventService.deleteSpecialEvent(eventId, userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Özel gün bildirimi silme hatası:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Özel günleri manuel olarak işle (admin için)
 * @route POST /api/special-events/process
 */
exports.processSpecialEvents = async (req, res) => {
  try {
    // Admin kontrolü
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir' });
    }
    
    const results = await specialEventService.processSpecialEvents();
    res.json(results);
  } catch (error) {
    logger.error('Özel gün bildirimleri işleme hatası:', error);
    res.status(500).json({ message: error.message });
  }
}; 