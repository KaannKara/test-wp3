import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 py-24 md:py-32 overflow-hidden transition-colors duration-500">
        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle green circles to represent WhatsApp */}
          <div className="absolute top-20 left-8 w-64 h-64 bg-gradient-to-r from-green-500/10 to-green-400/5 rounded-full animate-morphBlob blur-3xl"></div>
          <div className="absolute bottom-24 right-16 w-80 h-80 bg-gradient-to-r from-green-500/5 to-green-400/10 rounded-full animate-morphBlob animation-delay-2000 blur-3xl"></div>
          
          {/* Indigo gradient circles for brand identity */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-indigo-400/5 rounded-full animate-morphBlob animation-delay-3000 blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gradient-to-br from-indigo-400/5 to-indigo-500/10 rounded-full animate-morphBlob animation-delay-1000 blur-3xl"></div>
          
          {/* Floating message bubbles - WhatsApp style */}
          <div className="absolute top-[20%] left-[15%] hidden lg:block">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-float" style={{ animationDuration: '6s', animationDelay: '0.5s' }}>
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zM12.050 4c1.97 0 3.81.76 5.21 2.14 1.39 1.39 2.14 3.24 2.14 5.21 0 4.07-3.31 7.38-7.38 7.38-1.23 0-2.42-.31-3.49-.89l-.4-.25-4.15 1.09 1.11-4.05-.26-.42c-.63-1.1-.95-2.33-.94-3.62 0-4 3.36-7.59 7.42-7.59z"></path>
                <path d="M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.82-.78.99-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.04-.47-.04z"></path>
              </svg>
            </div>
          </div>
          
          <div className="absolute top-[45%] right-[15%] hidden lg:block">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-float animation-delay-1000" style={{ animationDuration: '8s', animationDelay: '1s' }}>
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"></path>
              </svg>
            </div>
          </div>
          
          <div className="absolute bottom-[15%] left-[25%] hidden lg:block">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center animate-float animation-delay-2000" style={{ animationDuration: '7s', animationDelay: '1.5s' }}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
          </div>
          
          {/* Message dots animation */}
          <div className="absolute bottom-[30%] right-[25%] hidden lg:block">
            <div className="flex items-center justify-center space-x-1 bg-white dark:bg-zinc-700 rounded-full py-2 px-4 shadow-lg animate-float" style={{ animationDuration: '5s', animationDelay: '2s' }}>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-dots"></div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-dots" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-dots" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
        
        <div className="container relative mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Main content */}
          <div className="text-center md:text-left order-2 md:order-1">
            <div className="inline-block mb-3 px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-full border border-green-200 dark:border-green-800/50">
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium text-green-800 dark:text-green-300">WhatsApp İş API</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-zinc-900 dark:text-zinc-50 animate-fadeIn">
              <span className="inline-block relative">
                <span className="relative z-10">WhatsApp</span>
                <span className="absolute -bottom-0.5 left-0 right-0 h-3 bg-gradient-to-r from-green-500/20 to-green-400/10 -skew-x-6"></span>
              </span>{" "}
              İşletmeler İçin{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-indigo-600 dark:from-green-400 dark:to-indigo-500">Mesajlaşma Çözümü</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 300 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5.5C54.6667 2 108.333 1 162 2.5C215.667 4 269.333 6 323 8" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="1" y1="5" x2="323" y2="5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#22C55E" />
                      <stop offset="1" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl mb-8 text-zinc-700 dark:text-zinc-300 animate-fadeIn animation-delay-200 max-w-2xl mx-auto md:mx-0">
              WhatsApp üzerinden müşterilerinizle profesyonel iletişim kurun. Mesajlarınızı zamanlanmış veya otomatik olarak gönderin, gruplarınızı yönetin ve özel gün bildirimlerini otomatize edin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center animate-fadeIn animation-delay-400">
              <Link
                to="/register"
                className="group relative overflow-hidden bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Hemen Başlayın
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <span className="absolute inset-0 w-full h-full bg-gradient-shine bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Link>
              
              <Link
                to="/login"
                className="relative overflow-hidden group bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-green-500 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 px-8 py-4 rounded-xl font-semibold transition-all duration-300"
              >
                <span className="relative z-10">Giriş Yap</span>
                <span className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-indigo-500 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            
            {/* Trusted by companies */}
            <div className="mt-12 hidden md:block animate-fadeIn animation-delay-500">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">Önde gelen şirketler tarafından tercih edilmektedir:</p>
              <div className="flex flex-wrap items-center gap-6">
                <img src="/images/client-logo-1.png" alt="Company Logo" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
                <img src="/images/client-logo-2.png" alt="Company Logo" className="h-7 opacity-70 hover:opacity-100 transition-opacity" />
                <img src="/images/client-logo-3.png" alt="Company Logo" className="h-7 opacity-70 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          
          {/* Right side - Phone mockup */}
          <div className="relative order-1 md:order-2 animate-fadeIn -mt-16">
            <div className="relative mx-auto w-full max-w-xs">
              {/* Phone frame */}
              <div className="relative z-10 bg-black rounded-[40px] overflow-hidden p-2 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-20 bg-black z-20 rounded-b-xl"></div>
                <div className="h-[520px] w-full bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden relative">
                  {/* WhatsApp UI Mockup */}
                  <div className="h-14 bg-green-500 text-white flex items-center px-4 shadow-lg">
                    <div className="text-white">
                      <h3 className="font-semibold">İş Mesajları</h3>
                      <p className="text-xs opacity-80">Otomatik bildirimler</p>
                    </div>
                  </div>
                  
                  {/* Message bubble animation */}
                  <div className="h-[456px] bg-[url('/images/whatsapp-bg.png')] bg-repeat bg-center overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-transparent">
                    {/* System message */}
                    <div className="flex justify-center">
                      <div className="bg-white/80 dark:bg-zinc-800/80 rounded-lg px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                        Bugün
                      </div>
                    </div>
                    
                    {/* Message bubbles */}
                    <div className="flex justify-end animate-slideInBottom" style={{ animationDelay: '0.7s' }}>
                      <div className="bg-green-100 dark:bg-green-900/50 text-zinc-800 dark:text-zinc-100 px-3 py-2 rounded-lg rounded-tr-none max-w-[80%] ml-12">
                        <p className="text-sm">Merhaba! ABC şirketinden otomatik bildirim sistemi. Poliçenizin bitiş tarihi yaklaşıyor.</p>
                        <p className="text-right text-xs text-zinc-500 dark:text-zinc-400 mt-1">14:27</p>
                      </div>
                    </div>
                    
                    <div className="flex animate-slideInBottom" style={{ animationDelay: '1.2s' }}>
                      <div className="bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 px-3 py-2 rounded-lg rounded-tl-none max-w-[80%] mr-12">
                        <p className="text-sm">Teşekkürler! Ne zaman bitiyor ve nasıl yenileyebilirim?</p>
                        <p className="text-right text-xs text-zinc-500 dark:text-zinc-400 mt-1">14:29</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end animate-slideInBottom" style={{ animationDelay: '1.7s' }}>
                      <div className="bg-green-100 dark:bg-green-900/50 text-zinc-800 dark:text-zinc-100 px-3 py-2 rounded-lg rounded-tr-none max-w-[80%] ml-12">
                        <p className="text-sm">Poliçeniz 15.04.2023 tarihinde sona erecek. Yenilemek için 0850 123 45 67 numaralı telefonu arayabilir veya web sitemizi ziyaret edebilirsiniz.</p>
                        <p className="text-right text-xs text-zinc-500 dark:text-zinc-400 mt-1">14:30</p>
                      </div>
                    </div>
                    
                    {/* Typing indicator */}
                    <div className="flex animate-slideInBottom" style={{ animationDelay: '2.2s' }}>
                      <div className="bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 px-3 py-2 rounded-lg rounded-tl-none w-20">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-400 animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shadow effects */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-500/20 rounded-full filter blur-xl animate-pulse"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/20 rounded-full filter blur-xl animate-pulse animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider - Hero to Features */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-800 dark:to-zinc-900">
        <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,288L48,272.7C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,229.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="white" className="dark:fill-zinc-900" />
        </svg>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-zinc-900 transition-colors duration-300 section-fade-in">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 text-zinc-800 dark:text-zinc-200 animate-fadeIn section-transition-in">
            Temel Özellikler
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto animate-fadeIn">
            WhatsApp iletişimlerinizi verimli ve etkili bir şekilde yönetmek için ihtiyacınız olan her şey
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group animate-fadeIn delay-100">
              <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-tiltBounce">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-zinc-800 dark:text-zinc-200">Doğrudan Mesajlaşma</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-center">
                Herhangi bir WhatsApp numarasına kolayca mesaj gönderin. Mesajlarınıza görsel veya belge ekleyin.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group animate-fadeIn delay-200">
              <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-tiltBounce">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-zinc-800 dark:text-zinc-200">Grup Yönetimi</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-center">
                Tüm WhatsApp gruplarınızı tek bir yerden görüntüleyin ve yönetin. Birden fazla gruba aynı anda mesaj gönderin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group animate-fadeIn delay-300">
              <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:animate-tiltBounce">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-zinc-800 dark:text-zinc-200">Zamanlanmış Mesajlar</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-center">
                Belirli tarih ve saatlerde gönderilecek mesajları planlayın. Otomatik müşteri hatırlatmaları için mükemmel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider - Features to Interactive Experience */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-b from-white via-zinc-100 to-zinc-800 dark:from-zinc-900 dark:via-zinc-800 dark:to-black">
        <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,288L48,282.7C96,277,192,267,288,229.3C384,192,480,128,576,117.3C672,107,768,149,864,170.7C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="fill-zinc-800 dark:fill-black opacity-90" />
          <path d="M0,288L60,272C120,256,240,224,360,213.3C480,203,600,213,720,208C840,203,960,181,1080,186.7C1200,192,1320,224,1380,240L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" className="fill-zinc-700 dark:fill-zinc-900 opacity-70" />
          <path d="M0,288L24,261.3C48,235,96,181,144,181.3C192,181,240,235,288,229.3C336,224,384,160,432,154.7C480,149,528,203,576,213.3C624,224,672,192,720,176C768,160,816,160,864,154.7C912,149,960,139,1008,160C1056,181,1104,235,1152,245.3C1200,256,1248,224,1296,218.7C1344,213,1392,235,1416,245.3L1440,256L1440,320L1416,320C1392,320,1344,320,1296,320C1248,320,1200,320,1152,320C1104,320,1056,320,1008,320C960,320,912,320,864,320C816,320,768,320,720,320C672,320,624,320,576,320C528,320,480,320,432,320C384,320,336,320,288,320C240,320,192,320,144,320C96,320,48,320,24,320L0,320Z" className="fill-zinc-800/50 dark:fill-black/50" />
        </svg>
      </div>

      {/* Interactive Experience Section */}
      <section className="py-20 bg-zinc-800 dark:bg-black text-white relative overflow-hidden section-fade-in">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-600/20 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 text-white animate-fadeIn section-transition-in">
            İnteraktif Deneyim
          </h2>
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto animate-fadeIn">
            Kullanım kolaylığı için tasarlanmış modern, sezgisel bir arayüz
          </p>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 rounded-xl overflow-hidden shadow-xl animate-glow">
              <div className="border-b border-zinc-700/50 px-6 py-3 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto text-zinc-400 text-sm">WhatsApp Mesajcı Kontrol Paneli</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="col-span-1 animate-float">
                  <div className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600/50">
                    <h3 className="text-lg font-medium text-zinc-200 mb-2">Navigasyon</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-indigo-500/20 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-sm text-zinc-300">Kontrol Paneli</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-600/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                        <span className="text-sm text-zinc-400">Mesaj Gönder</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-600/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                        <span className="text-sm text-zinc-400">Zamanlanmış Görevler</span>
                      </div>
                      <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-zinc-600/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                        <span className="text-sm text-zinc-400">Gruplar</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 space-y-4 animate-float delay-100">
                  <div className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600/50">
                    <h3 className="text-lg font-medium text-zinc-200 mb-3">Aktif Bağlantılar</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-zinc-300">WhatsApp Bağlı</p>
                        <p className="text-zinc-400 text-sm">Son aktif: Şimdi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600/50">
                    <h3 className="text-lg font-medium text-zinc-200 mb-3">Son Aktiviteler</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex-shrink-0 flex items-center justify-center text-indigo-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-zinc-300 text-sm">"Sigorta Müşterileri" grubuna mesaj gönderildi</p>
                          <p className="text-zinc-500 text-xs">2 dakika önce</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/30 flex-shrink-0 flex items-center justify-center text-green-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-zinc-300 text-sm">5 zamanlanmış mesaj başarıyla teslim edildi</p>
                          <p className="text-zinc-500 text-xs">15 dakika önce</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-green-500/20 dark:shadow-green-600/20 transform hover:scale-105 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
              Hemen Başlayın
            </Link>
          </div>
        </div>
      </section>

      {/* Curve Divider - Interactive Experience to How It Works */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-b from-zinc-800 via-zinc-500 to-zinc-100 dark:from-black dark:via-zinc-800 dark:to-zinc-700">
        <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,160L40,165.3C80,171,160,181,240,192C320,203,400,213,480,197.3C560,181,640,139,720,138.7C800,139,880,181,960,186.7C1040,192,1120,160,1200,154.7C1280,149,1360,171,1400,181.3L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z" className="fill-zinc-100 dark:fill-zinc-700 opacity-90" />
          <path d="M0,224L40,229.3C80,235,160,245,240,218.7C320,192,400,128,480,112C560,96,640,128,720,160C800,192,880,224,960,229.3C1040,235,1120,213,1200,208C1280,203,1360,213,1400,218.7L1440,224L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z" className="fill-zinc-200 dark:fill-zinc-700/80 opacity-60" />
        </svg>
      </div>

      {/* How It Works Section */}
      <section className="py-24 bg-zinc-100 dark:bg-zinc-700 transition-colors duration-300 relative overflow-hidden section-fade-in">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full"></div>
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full"></div>
        </div>
      
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-zinc-800 dark:text-zinc-100 animate-fadeIn">
              Nasıl <span className="text-indigo-600 dark:text-indigo-400">Çalışır</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto animate-fadeIn">
              Sadece dört basit adımda WhatsApp entegrasyonunu tamamlayın ve mesaj göndermeye başlayın
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-24 left-1/2 h-[calc(100%-120px)] w-0.5 bg-indigo-500/30 dark:bg-indigo-400/30 -ml-0.5 hidden lg:block"></div>
            
            <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-20">
            {/* Step 1 */}
              <div className="group relative">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl dark:shadow-zinc-900/30 p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-zinc-900/40">
                  <div className="absolute -left-5 lg:left-auto lg:right-8 top-6 z-20">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg lg:text-2xl font-bold shadow-lg shadow-indigo-500/30 dark:shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
                  </div>
                  
                  <div className="pl-8 lg:pl-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">Hesap Oluşturun</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Hızlı ve kolay bir kayıt süreciyle platformumuza üye olun. Tüm WhatsApp mesajlaşma özelliklerine anında erişim sağlayın.
                    </p>
                  </div>
                </div>
            </div>

            {/* Step 2 */}
              <div className="group relative mt-12 lg:mt-0">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl dark:shadow-zinc-900/30 p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-zinc-900/40">
                  <div className="absolute -left-5 lg:left-auto lg:left-8 top-6 z-20">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg lg:text-2xl font-bold shadow-lg shadow-indigo-500/30 dark:shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
                  </div>
                  
                  <div className="pl-8 lg:pl-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">WhatsApp'ı Bağlayın</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Platformumuzda görüntülenen QR kodu WhatsApp Web üzerinden tarayarak WhatsApp hesabınızı sistemimize entegre edin.
                    </p>
                  </div>
                </div>
            </div>

            {/* Step 3 */}
              <div className="group relative">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl dark:shadow-zinc-900/30 p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-zinc-900/40">
                  <div className="absolute -left-5 lg:left-auto lg:right-8 top-6 z-20">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg lg:text-2xl font-bold shadow-lg shadow-indigo-500/30 dark:shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
                  </div>
                  
                  <div className="pl-8 lg:pl-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">Veri Yükleyin</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Excel dosyalarınızı sisteme yükleyin. Müşteri bilgileri, telefon numaraları ve mesaj içeriklerini içeren verilerinizi kolayca düzenleyin.
                    </p>
                  </div>
                </div>
            </div>

            {/* Step 4 */}
              <div className="group relative mt-12 lg:mt-0">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl dark:shadow-zinc-900/30 p-6 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-zinc-900/40">
                  <div className="absolute -left-5 lg:left-auto lg:left-8 top-6 z-20">
                    <div className="w-10 h-10 lg:w-16 lg:h-16 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg lg:text-2xl font-bold shadow-lg shadow-indigo-500/30 dark:shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                      4
                    </div>
                  </div>
                  
                  <div className="pl-8 lg:pl-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">Mesaj Gönderin</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Bireysel veya toplu mesajlarınızı anında ya da ileri bir tarihte göndermek için zamanlamalar oluşturun. Özel gün bildirimleri ayarlayın.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-green-500/20 dark:shadow-green-600/20 transform hover:scale-105 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
              Hemen Başlayın
            </Link>
          </div>
        </div>
      </section>

      {/* Diagonal Divider - How It Works to CTA */}
      <div className="relative h-24 overflow-hidden bg-gradient-to-b from-zinc-100 via-zinc-300 to-indigo-600 dark:from-zinc-700 dark:via-zinc-600 dark:to-indigo-700">
        <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32L48,53.3C96,75,192,117,288,138.7C384,160,480,160,576,138.7C672,117,768,75,864,69.3C960,64,1056,96,1152,101.3C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" className="fill-indigo-600 dark:fill-indigo-700" />
        </svg>
      </div>

      {/* Call to Action Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden section-fade-in">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="wave-animation absolute bottom-0 left-0 w-[200%] h-40 opacity-20">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
          
          {/* Particle Effects */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-white rounded-full opacity-10 animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-white rounded-full opacity-10 animate-ping" style={{ animationDuration: '4s', animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-white rounded-full opacity-10 animate-ping" style={{ animationDuration: '6s' }}></div>
          
          {/* Bright Spot with Glow Effect */}
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-radial from-white/20 to-transparent rounded-full filter blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-radial from-purple-400/20 to-transparent rounded-full filter blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-fadeIn relative inline-block">
                Başlamaya 
                <span className="relative inline-block">
                  <span className="relative z-10"> Hazır mısınız?</span>
                  <span className="absolute bottom-2 left-0 h-3 w-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 opacity-70 rounded-lg transform skew-x-12"></span>
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto animate-fadeIn delay-100 leading-relaxed">
                Müşterilerinizle iletişim kurmak ve <span className="font-semibold text-white">işinizi büyütmek</span> için WhatsApp mesajlaşma sistemimizi kullanan binlerce işletmeye katılın.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left animate-fadeIn delay-200">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Tek Bir Platformda <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-blue-300">Güçlü Çözümler</span></h3>
                <p className="text-white/80 mb-6">Otomatik mesaj gönderimi, bitiş tarihi bildirimleri ve çok daha fazlası. WhatsApp entegrasyonuyla müşteri iletişiminizi güçlendirin.</p>
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 dark:shadow-green-600/20 transform hover:scale-105 transition-all duration-300"
                  >
                    Hemen Başlayın
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:block relative animate-fadeIn delay-300">
                <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                    <div className="flex items-center text-left mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">WhatsApp Entegrasyonu</h4>
                        <p className="text-white/70 text-sm">Hızlı ve güvenli bağlantı</p>
                      </div>
                    </div>
                    <div className="space-y-3 pl-16">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-white/80">Kolay kurulum</p>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-white/80">Otomatik mesajlaşma</p>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-white/80">Excel veri desteği</p>
                      </div>
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-white/80">7/24 destek</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-indigo-500 rounded-full filter blur-xl opacity-70"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full filter blur-xl opacity-70"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Badge */}
        <div className="absolute top-10 right-10 animate-float hidden lg:block">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-xl flex items-center">
            <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-white text-sm font-medium">Çevrimiçi Destek</span>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
