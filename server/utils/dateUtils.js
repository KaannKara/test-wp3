const XLSX = require('xlsx');
const moment = require('moment');
const logger = require('./logger');

/**
 * Excel dosyasındaki verileri parse et, tarihleri düzgün algıla
 * @param {Buffer} excelBuffer - Excel dosyası buffer'ı 
 * @param {string} dateColumn - Tarih sütun adı
 * @returns {Promise<{parsedData: Array, headers: Array}>} - Parse edilmiş veri
 */
async function parseExcelDates(excelBuffer, dateColumn) {
  try {
    // Excel dosyasını yükle
    const workbook = XLSX.read(excelBuffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // JSON'a çevir, tarihleri otomatik algıla
    const rawData = XLSX.utils.sheet_to_json(sheet, { 
      raw: false, 
      dateNF: 'YYYY-MM-DD',
      defval: '',
    });
    
    // Kesin tarih sütununu işle
    const headers = Object.keys(rawData[0] || {});
    const parsedData = rawData.map(row => {
      const newRow = { ...row };
      
      // Tarih sütununu doğru formata çevir
      if (dateColumn && newRow[dateColumn]) {
        try {
          // İlk olarak tarihin zaten Date olup olmadığını kontrol et
          if (!(newRow[dateColumn] instanceof Date)) {
            // Farklı tarih formatlarını ele al
            const dateStr = newRow[dateColumn].toString().trim();
            
            // dd.MM.yyyy formatı
            if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
              const [day, month, year] = dateStr.split('.');
              newRow[dateColumn] = new Date(year, month - 1, day);
            }
            // MM/dd/yyyy formatı
            else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
              const [month, day, year] = dateStr.split('/');
              newRow[dateColumn] = new Date(year, month - 1, day);
            }
            // yyyy-MM-dd formatı
            else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
              const [year, month, day] = dateStr.split('-');
              newRow[dateColumn] = new Date(year, month - 1, day);
            }
            // Diğer formatlar için moment.js kullan
            else {
              const parsedDate = moment(dateStr, [
                'DD.MM.YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD',
                'DD-MM-YYYY', 'YYYY/MM/DD', 'DD/MM/YYYY'
              ]);
              
              if (parsedDate.isValid()) {
                newRow[dateColumn] = parsedDate.toDate();
              } else {
                logger.warn(`Geçersiz tarih formatı: ${dateStr}`);
              }
            }
          }
        } catch (error) {
          logger.error(`Tarih ayrıştırma hatası: ${newRow[dateColumn]}`, error);
        }
      }
      
      return newRow;
    });
    
    return { parsedData, headers };
  } catch (error) {
    logger.error('Excel tarih ayrıştırma hatası:', error);
    throw error;
  }
}

/**
 * Tarihi DD.MM.YYYY formatına dönüştür
 * @param {Date|string} date - Tarih
 * @returns {string} - Formatlanmış tarih
 */
function formatDate(date) {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date.toString();
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    logger.error(`Tarih formatlama hatası: ${date}`, error);
    return date.toString();
  }
}

module.exports = {
  parseExcelDates,
  formatDate
}; 