// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
 import { cn } from '../../lib/utils.ts';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: 'features', isScroll: true },
    { name: 'About', path: '/about' },
    // { name: 'Pricing', path: '/pricing' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (location.pathname === '/') {
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update hash in URL
        window.history.pushState(null, '', `/#${id}`);
      }
    } else {
      navigate(`/#${id}`);
    }
    setIsOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-20 md:px-12 backdrop-blur-md border-b border-black/5 dark:border-white/5 bg-white/20 dark:bg-black/20 transition-colors duration-500"
    >
      <Link to="/" className="flex items-center gap-2">
        <img 
          src={theme === 'dark' ? '/Images/dark-logo.png' : '/Images/light-logo.png'} 
          alt="Avinya Logo" 
          className="h-20 w-auto"
        />
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          link.isScroll ? (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.path)}
              className={cn(
                "text-sm font-semibold transition-colors",
                location.pathname === '/' && location.hash === `#${link.path}`
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {link.name}
            </button>
          ) : (
            <Link 
              key={link.name} 
              to={link.path}
              className={cn(
                "text-sm font-semibold transition-colors",
                location.pathname === link.path && !location.hash
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {link.name}
            </Link>
          )
        ))}

        <button
          onClick={() => scrollToSection('booking')}
          className={cn(
            "text-sm font-semibold transition-colors",
            location.pathname === '/' && location.hash === '#booking'
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          Book Demo
        </button>

        <Link 
          to="/login" 
          className="text-sm font-semibold text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Login
        </Link>
        
        <Link 
          to="/signup" 
          className="px-5 py-2.5 rounded-full bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          Sign up
        </Link>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full glass hover:bg-black/5 dark:hover:bg-white/10 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
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
            link.isScroll ? (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.path)}
                className={cn(
                  "text-lg font-medium text-left transition-colors",
                  location.pathname === '/' && location.hash === `#${link.path}`
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-700 dark:text-white/80"
                )}
              >
                {link.name}
              </button>
            ) : (
              <Link 
                key={link.name} 
                to={link.path}
                className={cn(
                  "text-lg font-medium",
                  location.pathname === link.path && !location.hash
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-slate-700 dark:text-white/80"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            )
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
              onClick={() => scrollToSection('booking')}
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
