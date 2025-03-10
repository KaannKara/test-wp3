import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('light');

  // Sayfa yüklendiğinde sistem tercihini veya kaydedilmiş tercihi kontrol et
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 transition-all duration-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 overflow-hidden"
      aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      <div className="relative z-10">
        {theme === 'light' ? (
          <Moon size={18} className="text-zinc-600 dark:text-zinc-300" />
        ) : (
          <Sun size={18} className="text-indigo-500" />
        )}
      </div>
      <span className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full scale-0 transition-transform duration-300 group-hover:scale-100"></span>
    </button>
  );
};

export default ThemeToggle; 