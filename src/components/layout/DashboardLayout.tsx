import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const { user } = state;

  // JavaScript yüklendiğinde sidebar'ın görünürlüğünü kontrol edecek state
  const [hasHydrated, setHasHydrated] = useState(false);

  // Check for large screen on component mount and window resize
  useEffect(() => {
    // JavaScript yüklendi, hydration tamamlandı
    setHasHydrated(true);
    
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Use the logout function from AuthContext
    logout();
    // Redirect to login page
    navigate('/login');
  };

  const sidebarLinks = [
    {
      title: 'Panel',
      path: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      title: 'Mesaj Gönder',
      path: '/dashboard/send-message',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: 'Gruplar',
      path: '/dashboard/groups',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Zamanlanmış Mesajlar',
      path: '/dashboard/scheduled-messages',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Özel Gün Bildirimleri',
      path: '/dashboard/special-events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    // Admin only links
    ...(user?.role === 'admin' ? [
      {
        title: 'Üyeler',
        path: '/dashboard/users',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      }
    ] : []),
    {
      title: 'Ayarlar',
      path: '/dashboard/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground dark:bg-zinc-900">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar - Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-20 bg-zinc-900/70 dark:bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={toggleSidebar}
            />
          )}
        </AnimatePresence>
        
        {/* Sidebar Content */}
        <motion.aside
          className={cn(
            "fixed z-30 inset-y-0 left-0 w-72 shadow-lg",
            "bg-zinc-800 text-zinc-100 border-r border-zinc-700 dark:bg-zinc-900 dark:border-zinc-800",
            "lg:static lg:h-auto",
            "lg:translate-x-0",
            // Sidebar kapalıyken ve küçük ekrandaysa gizle, ama sadece JS yüklendikten sonra
            hasHydrated && !isLargeScreen && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
          )}
          initial={false}
          animate={{ 
            x: 0 // Artık transformu sadece CSS ile yapacağız
          }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-700 dark:border-zinc-800">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-zinc-100">Panel</h2>
            </div>
            <button
              className="lg:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
              onClick={toggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 px-3">
            <div className="py-2 px-3 bg-zinc-700/50 dark:bg-zinc-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">{user?.username || 'Kullanıcı'}</p>
                  <p className="text-xs text-zinc-400">{user?.email || 'Email yok'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <nav className="mt-6 px-3">
            <div className="space-y-1.5">
              {sidebarLinks.map((link) => {
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                      "font-medium text-sm group relative overflow-hidden",
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/70 dark:hover:bg-zinc-800/70"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-item"
                        className="absolute inset-0 bg-indigo-600 z-[-1]"
                        initial={{ borderRadius: 8 }}
                        animate={{ borderRadius: 8 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className={cn(
                      "flex items-center",
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-100"
                    )}>
                      {link.icon}
                      {link.title}
                    </span>
                    
                    {isActive && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
              
              <div className="h-px my-4 bg-zinc-700 dark:bg-zinc-800" />
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-red-500/20 transition-all duration-200 font-medium text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </nav>
          
          <div className="px-3 mt-6 absolute bottom-4 left-0 right-0">
            <div className={cn(
              "px-3 py-2 rounded-lg text-xs",
              state.user 
                ? "bg-green-500/10 dark:bg-green-500/10 text-green-500 dark:text-green-400" 
                : "bg-zinc-700/20 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-500"
            )}>
              <p className="flex items-center">
                {state.user ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                WhatsApp Durumu: 
                <span className={cn(
                  "ml-1 font-medium",
                  state.user ? "text-green-500 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"
                )}>
                  {state.user ? 'Aktif' : 'Pasif'}
                </span>
              </p>
            </div>
          </div>
        </motion.aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 bg-zinc-100 dark:bg-zinc-900 text-foreground overflow-hidden">
          {/* Mobile Toggle Button */}
          <button
            className="fixed bottom-6 right-6 z-20 lg:hidden h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Content */}
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardLayout; 