import { useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useWhatsApp } from '../../contexts/WhatsAppContext';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Dashboard = () => {
  const { state: authState } = useAuth();
  const { 
    connectionStatus, 
    qrCode, 
    groups, 
    loading, 
    error, 
    initializeWhatsApp,
    clearError 
  } = useWhatsApp();

  // Clear error on component unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 mb-6 text-foreground border border-zinc-200 dark:border-zinc-800"
        >
          <h1 className="text-2xl font-bold mb-4">Kontrol Paneli</h1>
          <p className="text-muted-foreground mb-4">Tekrar hoşgeldin, {authState.user?.username || 'Kullanıcı'}!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <motion.div 
              variants={itemVariants}
              className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-500/30 transition-colors duration-300"
            >
              <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">WhatsApp Durumu</h2>
              <p className="text-muted-foreground mb-4">
              {connectionStatus === 'connected' 
                  ? 'WhatsApp bağlantınız kuruldu ve kullanıma hazır.' 
                : connectionStatus === 'connecting'
                    ? 'WhatsApp\'a bağlanılıyor...'
                    : 'WhatsApp bağlı değil. Bağlanmak için QR kodu taratın.'}
            </p>
            <div className="mt-2">
              {connectionStatus === 'connected' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                    <span className="h-2 w-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
                    Bağlı
                </span>
              ) : (
                <button
                  onClick={initializeWhatsApp}
                  disabled={loading.connection || connectionStatus === 'connecting'}
                    className={cn(
                      "px-4 py-2 rounded-md transition-all duration-300 font-medium text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-background",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    )}
                  >
                    {loading.connection ? 'Başlatılıyor...' : connectionStatus === 'connecting' ? 'QR Kodu Taratın' : 'WhatsApp\'a Bağlan'}
                </button>
              )}
            </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700/50 hover:border-purple-500/30 transition-colors duration-300"
            >
              <h2 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">Bugün Gönderilen Mesajlar</h2>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
              <p className="text-muted-foreground mt-2">Bugün hiç mesaj göndermediniz.</p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700/50 hover:border-emerald-500/30 transition-colors duration-300"
            >
              <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Gruplar</h2>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{groups.length}</p>
              <p className="text-muted-foreground mt-2">
              {groups.length === 0 
                  ? 'Hiç WhatsApp grubu bulunamadı.' 
                : groups.length === 1 
                    ? '1 WhatsApp grubu mevcut.' 
                    : `${groups.length} WhatsApp grubu mevcut.`}
            </p>
            </motion.div>
          </div>
        </motion.div>
      
      {(qrCode || connectionStatus === 'connecting') && (
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-800"
          >
            <h2 className="text-xl font-semibold mb-4">WhatsApp Bağlantısı</h2>
          
          {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            {loading.connection ? (
              <div className="flex flex-col items-center p-8">
                  <svg className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                  <p className="text-muted-foreground">QR kodu oluşturuluyor...</p>
              </div>
            ) : qrCode ? (
                <div className="p-4 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white">
                  <img src={qrCode} alt="WhatsApp QR Kodu" className="w-64 h-64" />
              </div>
            ) : (
                <p className="text-muted-foreground">QR kodu bekleniyor...</p>
            )}
            
            <div className="mt-6 text-center max-w-md">
                <h3 className="text-lg font-medium mb-2">Nasıl bağlanılır:</h3>
                <ol className="text-muted-foreground text-left space-y-2 list-decimal list-inside">
                  <li>Telefonunuzda WhatsApp'ı açın</li>
                  <li>Menü <span className="font-mono">⋮</span> veya Ayarlar'a dokunun ve Bağlı Cihazlar'ı seçin</li>
                  <li>"Cihaz Bağla" seçeneğine dokunun</li>
                  <li>Yukarıda görüntülenen QR kodu taratın</li>
              </ol>
                <p className="mt-4 text-sm text-muted-foreground">
                  Bağlantı tamamlanana kadar bu pencereyi açık tutun. QR kod 45 saniye sonra geçersiz olacaktır.
              </p>
            </div>
          </div>
          </motion.div>
        )}
        
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 border border-zinc-200 dark:border-zinc-800"
        >
          <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="/dashboard/send-message" 
              className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300"
            >
            <div className="flex items-start">
                <div className="bg-indigo-100 dark:bg-indigo-500/20 p-3 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-4">
                  <h3 className="text-lg font-medium">Mesaj Gönder</h3>
                  <p className="text-muted-foreground mt-1">Herhangi bir WhatsApp numarasına mesaj gönderin</p>
                </div>
              </div>
            </motion.a>
            
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="/dashboard/groups" 
              className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-emerald-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300"
            >
            <div className="flex items-start">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                  <h3 className="text-lg font-medium">Grupları Görüntüle</h3>
                  <p className="text-muted-foreground mt-1">WhatsApp gruplarınızı yönetin</p>
                </div>
              </div>
            </motion.a>
            
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href="/dashboard/scheduled-messages" 
              className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-purple-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300"
            >
            <div className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-500/20 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                  <h3 className="text-lg font-medium">Mesaj Zamanla</h3>
                  <p className="text-muted-foreground mt-1">Otomatik gönderilecek mesajları zamanla</p>
                </div>
              </div>
            </motion.a>
            </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard; 