// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
 import { cn } from '../../lib/utils.ts';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    // { name: 'Pricing', path: '/pricing' },
  ];

  const scrollToBooking = () => {
    if (location.pathname === '/') {
      const element = document.getElementById('booking');
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#booking';
    }
    setIsOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md border-b border-black/5 dark:border-white/5 bg-white/20 dark:bg-black/20 transition-colors duration-500"
    >
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-white">Avinya</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path}
            className={cn(
              "text-sm font-semibold transition-colors",
              location.pathname === link.path 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full glass hover:bg-black/5 dark:hover:bg-white/10 transition-all mr-2"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
        
        <Link 
          to="/login" 
          className="text-sm font-semibold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors px-4"
        >
          Log in
        </Link>
        
        <Link 
          to="/signup" 
          className="px-5 py-2.5 rounded-full bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          Sign up
        </Link>

        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-2" />

        <button 
          onClick={scrollToBooking}
          className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white/90 transition-all shadow-xl shadow-black/10 dark:shadow-white/10"
        >
          Book Demo
        </button>
      </div>

      <div className="flex items-center gap-4 md:hidden">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full glass"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
        <button 
          className="text-slate-900 dark:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 p-6 bg-white/95 dark:bg-black/95 border-b border-black/5 dark:border-white/10 flex flex-col gap-6 md:hidden backdrop-blur-xl"
        >
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={cn(
                "text-lg font-medium",
                location.pathname === link.path 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-slate-700 dark:text-white/80"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-4 pt-4 border-t border-black/5 dark:border-white/10">
            <Link 
              to="/login"
              className="w-full py-3 text-center text-slate-700 dark:text-white font-semibold border border-black/10 dark:border-white/10 rounded-xl"
              onClick={() => setIsOpen(false)}
            >
              Log in
            </Link>
            <Link 
              to="/signup"
              className="w-full py-3 text-center bg-emerald-500 text-black rounded-xl font-bold"
              onClick={() => setIsOpen(false)}
            >
              Sign up
            </Link>
            <button 
              onClick={scrollToBooking}
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold"
            >
              Book Demo
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
