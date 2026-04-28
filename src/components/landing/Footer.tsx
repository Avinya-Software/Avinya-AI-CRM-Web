import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  
  return (
    <footer className="py-20 px-6 border-t border-black/5 dark:border-white/10 transition-colors duration-500">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img 
                src={theme === 'dark' ? '/Images/dark-logo.png' : '/Images/light-logo.png'} 
                alt="Avinya Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-slate-600 dark:text-white/40 font-light leading-relaxed">
              The AI-powered CRM platform that works as hard as you do. 
              Automate your sales, scale your business.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Twitter} />
              <SocialLink icon={Github} />
              <SocialLink icon={Linkedin} />
              <SocialLink icon={Mail} />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Product</h4>
            <ul className="space-y-4 text-slate-600 dark:text-white/40 text-sm font-medium">
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">AI Assistant</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Voice CRM</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Company</h4>
            <ul className="space-y-4 text-slate-600 dark:text-white/40 text-sm font-medium">
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Newsletter</h4>
            <p className="text-slate-600 dark:text-white/40 text-sm mb-4">Get the latest updates on AI and sales.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 text-sm flex-1 outline-none focus:border-emerald-500/50 transition-colors text-slate-900 dark:text-white"
              />
              <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-white/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 dark:text-white/20 text-xs font-medium uppercase tracking-widest">
          <p>© 2026 Avinya AI CRM. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon: Icon }: { icon: any }) {
  return (
    <a href="#" className="w-10 h-10 rounded-full glass dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/10 transition-all">
      <Icon className="w-5 h-5" />
    </a>
  );
}
