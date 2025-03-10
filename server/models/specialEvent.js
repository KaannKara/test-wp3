const mongoose = require('mongoose');

const specialEventSchema = new mongoose.Schema({
  // İlişkiler
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  excelFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExcelFile',
    required: true
  },

  // Genel bilgiler
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['birthday', 'policy'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'failed'],
    default: 'active'
  },
  
  // Sütun eşleştirmeleri
  columnMappings: {
    dateColumn: {
      type: String,
      required: true
    },
    phoneColumn: {
      type: String,
      required: true
    },
    nameColumn: {
      type: String,
      required: true
    },
    // Poliçe özel sütunlar
    policyNumberColumn: {
      type: String,
      // Yalnızca poliçeler için gerekli
      required: function() {
        return this.type === 'policy';
      }
    }
  },
  
  // Zamanlama
  timing: {
    // Gönderim saati HH:MM formatı
    timeOfDay: {
      type: String,
      default: '09:00'
    },
    // Kaç gün önceden/sonradan gönderilecek (0 = aynı gün)
    daysOffset: {
      type: Number,
      default: 0
    }
  },
  
  // Mesaj şablonu
  messageTemplate: {
    type: String,
    required: true
  },
  
  // İstatistikler
  stats: {
    totalSent: {
      type: Number,
      default: 0
    },
    lastRun: {
      type: Date
    },
    nextRun: {
      type: Date
    },
    deliverySuccess: {
      type: Number,
      default: 0
    },
    deliveryFailed: {
      type: Number,
      default: 0
    }
  },

  // Zaman damgaları
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Doğum günü ayarları
  daysAdvance: {
    type: Number,
    default: 0
  },

  // Poliçe bildirimi ayarları
  daysBefore: {
    type: Number,
    default: 7
  },

  sendTime: {
    type: String,
    default: '09:00'
  },

  active: {
    type: Boolean,
    default: true
  },

  lastRun: {
    type: Date
  },

  lastResult: {
    success: Boolean,
    message: String,
    details: Object
  }
}, { timestamps: true });

// Bir specialEvent güncellenmeden önce updatedAt alanını güncelle
specialEventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Bir specialEvent başarıyla çalıştığında istatistikleri güncelle
specialEventSchema.methods.recordSuccess = async function(count = 1) {
  this.stats.totalSent += count;
  this.stats.deliverySuccess += count;
  this.stats.lastRun = Date.now();
  
  // Sonraki çalışma tarihini hesapla
  const today = new Date();
  today.setDate(today.getDate() + 1); // Basit olarak bir sonraki gün
  this.stats.nextRun = today;
  
  await this.save();
};

// Bir specialEvent başarısız olduğunda istatistikleri güncelle
specialEventSchema.methods.recordFailure = async function(count = 1) {
  this.stats.deliveryFailed += count;
  this.stats.lastRun = Date.now();
  await this.save();
};

// Tarih ve saat geldiğinde özel günleri bulma
specialEventSchema.statics.findDueEvents = async function() {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  
  return this.find({
    active: true,
    sendTime: { $lte: currentTime } // Belirtilen saatten sonra çalışsın
  });
};

const SpecialEvent = mongoose.model('SpecialEvent', specialEventSchema);

module.exports = SpecialEvent; 