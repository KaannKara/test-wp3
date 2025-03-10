import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  
  const { register, state, clearError } = useAuth();
  const { loading, error, isAuthenticated } = state;

  // Clear validation errors when inputs change
  useEffect(() => {
    if (username || email || password || confirmPassword) {
      setValidationErrors({});
    }
  }, [username, email, password, confirmPassword]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    // Clear any errors on component mount
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, clearError]);
  
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!username.trim()) {
      errors.username = 'Kullanıcı adı gereklidir';
    }
    
    if (!email.trim()) {
      errors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!password) {
      errors.password = 'Şifre gereklidir';
    } else if (password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await register(username, email, password);
  };
  
  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-200px)] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-600/20 dark:shadow-green-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Yeni Hesap Oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-500 dark:hover:text-green-400 transition-colors">
              Giriş yapın
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-900/30 sm:rounded-xl sm:px-10 border border-zinc-100 dark:border-zinc-700 transition-colors duration-300">
            
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 mb-6 border-l-4 border-red-500 dark:border-red-500/50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Kullanıcı Adı
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${validationErrors.username ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'} rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-green-500 dark:focus:border-green-600 transition-colors duration-200 sm:text-sm`}
                    placeholder="kullanici_adiniz"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {validationErrors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{validationErrors.username}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  E-posta Adresi
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${validationErrors.email ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'} rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-green-500 dark:focus:border-green-600 transition-colors duration-200 sm:text-sm`}
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Şifre
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${validationErrors.password ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'} rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-green-500 dark:focus:border-green-600 transition-colors duration-200 sm:text-sm`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Şifreniz en az 6 karakter olmalıdır</p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Şifre Tekrarı
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${validationErrors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-zinc-300 dark:border-zinc-600'} rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-green-500 dark:focus:border-green-600 transition-colors duration-200 sm:text-sm`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-700/30 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-zinc-300 text-green-600 focus:ring-green-500 dark:border-zinc-600 dark:bg-zinc-700 dark:checked:bg-green-600"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-zinc-700 dark:text-zinc-300">
                      Kullanım koşullarını kabul ediyorum
                    </label>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Kişisel verilerinizin işlenmesi ve gizlilik politikasını kabul ettiğinizi onaylıyorsunuz.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg shadow-green-600/20 dark:shadow-green-600/10"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 group-hover:text-green-400 dark:group-hover:text-green-300" />
                    </span>
                  )}
                  {loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-100 dark:border-green-900/20">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                </svg>
                WhatsApp Bağlantısı
              </h3>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300/80">
                Kayıt olduktan sonra, WhatsApp hesabınızı QR kod ile bağlayarak hızlıca mesajlaşma sistemimizi kullanmaya başlayabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register; 