
// import { motion } from 'motion/react';
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Mail, Lock, User, Building } from 'lucide-react';
import { useTheme } from "../../context/ThemeContext";

export default function Signup() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputClassName = `w-full px-5 py-3.5 rounded-2xl transition-all outline-none ${isDark ? "bg-slate-100 border border-slate-700/30 text-slate-900 placeholder:text-slate-500 focus:bg-white" : "bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"}`;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden flex items-center justify-center">
      <div className="bg-mesh absolute inset-0 opacity-50 dark:opacity-100" />

      <div className="container max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-8 md:p-12 rounded-[2.5rem] ${isDark ? "bg-slate-950/95 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.25)]" : "bg-white/95 border border-slate-200/70 shadow-2xl backdrop-blur-xl"}`}
        >
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="text-white w-7 h-7" />
              </div>
            </Link>
            <h1 className={`text-3xl font-display font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Get Started</h1>
            <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Join 5,000+ teams scaling with Avinya</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <Building className="w-4 h-4" /> Company Name
              </label>
              <input
                type="text"
                placeholder="Acme Inc"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <Lock className="w-4 h-4" /> Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClassName}
              />
            </div>

            <button className="w-full py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4">
              Create Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className={`mt-8 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Already have an account?{' '}
            <Link to="/login" className={`font-bold hover:underline ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              Sign in instead
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
