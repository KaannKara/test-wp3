import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { motion } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state: authState, logout } = useAuth();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 shadow-md z-40 relative">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="pl-0 lg:pl-72 flex transition-all duration-300">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-600">WhatsApp Mesajcı</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex mr-4">
              <Link 
                to="/" 
                className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
              >
                Ana Sayfa
              </Link>
              {authState.isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
                  >
                    Dashboard'a Git
                  </Link>
                  <button 
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    to="/register" 
                    className="ml-2 px-3 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20"
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </nav>
            
            {/* Dark Mode Toggle */}
            <ThemeToggle />
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button 
              className="text-zinc-400 focus:outline-none p-1 rounded-md hover:bg-zinc-800/50 transition-colors"
              onClick={toggleMenu}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-2 pb-4 space-y-1 absolute left-0 right-0 bg-zinc-900 border-b border-zinc-800 shadow-lg z-20"
          >
            <Link 
              to="/" 
              className="block px-4 py-2 text-base text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            {authState.isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-2 text-base text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard'a Git
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-base text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-base text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 text-base bg-green-500 text-white hover:bg-green-600 rounded-md m-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Üye Ol
                </Link>
              </>
            )}
          </motion.nav>
        )}
      </div>
    </header>
  );
};

export default Header; 