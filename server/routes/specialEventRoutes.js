const express = require('express');
const router = express.Router();
const { 
  createBirthdayEvent,
  createPolicyEvent,
  getSpecialEvents,
  deleteSpecialEvent,
  processSpecialEvents
} = require('../controllers/specialEventController');
const { protect, admin } = require('../middleware/authMiddleware');

// Tüm rotalar için authentication gerekli
router.use(protect);

// Özel gün bildirimleri oluşturma rotaları
router.post('/birthday', createBirthdayEvent);
router.post('/policy', createPolicyEvent);

// Özel gün bildirimleri listeleme rotası
router.get('/', getSpecialEvents);

// Özel gün bildirimi silme rotası
router.delete('/:id', deleteSpecialEvent);

// Özel günleri işleme rotası (sadece admin)
router.post('/process', admin, processSpecialEvents);

module.exports = router; 