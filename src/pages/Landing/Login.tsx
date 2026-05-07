import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginAdmin } from "../../hooks/admin/useLoginAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../context/PermissionContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../auth/useAuth";
import { toast } from "react-hot-toast";
// import { motion, AnimatePresence } from "motion/react";
import { motion, AnimatePresence } from "framer-motion";
import SEO from '../../components/common/SEO.tsx';

type LoginErrors = { email?: string; password?: string };

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isReady } = usePermissions();
  const [loginDone, setLoginDone] = useState(false);
  const { login: authLogin } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const inputClassName = `w-full px-5 py-4 rounded-2xl transition-all outline-none ${isDark ? "bg-slate-900/70 border border-white/10 text-white placeholder:text-slate-500 focus:bg-slate-900/80" : "bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"}`;

  const { mutate: loginAdmin, isPending: adminLoading, isError: adminError, error: adminErr } = useLoginAdmin();

  const validate = () => {
    const newErrors: LoginErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Enter a valid email address";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdvisorLogin = () => {
    if (!validate() || adminLoading) return;

    loginAdmin(
      { email, password },
      {
        onSuccess: (res) => {
          const data = res.data;
          authLogin(data.token, data.userId);
          queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
          queryClient.invalidateQueries({ queryKey: ["user-menu"] });
          setLoginDone(true);
          toast.success("Welcome back!");
        },
        onError: (err: any) => {
          const respData = err?.response?.data;
          if (respData?.statusMessage) {
            toast.error(respData.statusMessage);
          } else if (respData?.message) {
            toast.error(respData.message);
          } else {
            toast.error("Login failed. Please check your credentials.");
          }
        }
      }
    );
  };

  useEffect(() => {
    if (loginDone && isReady) {
      navigate("/dashboard");
    }
  }, [loginDone, isReady, navigate]);

  const errorMessage = (adminErr as any)?.response?.data?.statusMessage || (adminErr as any)?.response?.data?.message;

  return (
    <div className="min-h-screen pb-16 px-4 relative overflow-hidden flex items-center justify-center">
      <SEO
        title="Login - Secure Access to Your Intelligent CRM"
        description="Log in to Avinya AI CRM to manage your leads, automate your tasks, and view your sales performance analytics."
        keywords="CRM Login, Avinya AI Login, Secure Sales Portal"
      />
      {/* Mesh Background Effect */}
      <div className="mesh-bg absolute inset-0 z-0" />
      <div className="mesh-pattern absolute inset-0 z-0 opacity-10" />

      <div className="w-full max-w-[440px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`glass-card p-12 rounded-[40px] relative ${theme === "dark" ? "bg-slate-950/95 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.35)]" : "bg-white/95 border border-slate-200/70 shadow-2xl backdrop-blur-xl"}`}
        >
          <div className="text-center mb-10 relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <img
                src={theme === 'dark' ? '/Images/dark-logo.png' : '/Images/light-logo.png'}
                alt="Avinya Logo"
                className="h-32 w-auto object-contain"
              />
            </motion.div>
            <h1 className={`text-[32px] font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Welcome Back</h1>
            <p className={`text-[15px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAdvisorLogin(); }} className="space-y-6 relative">

            <div className="space-y-2">
              <label className={`text-sm font-semibold flex items-center gap-2 ml-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                  className={`${inputClassName} text-[15px] ${errors.email ? "border-red-500/50 focus:ring-4 focus:ring-red-500/10" : "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"}`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-400 ml-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  <Lock className="w-4 h-4" /> Password
                </label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  className={`${inputClassName} pr-12 text-[15px] ${errors.password ? "border-red-500/50 focus:ring-4 focus:ring-red-500/10" : "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-400 ml-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {adminError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
              >
                {errorMessage || "Login failed. Please check your credentials."}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={adminLoading}
              className="w-full py-[18px] bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group text-base mt-8"
            >
              {adminLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className={`mt-8 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Don't have an account?{" "}
            <Link to="/signup" className={`font-bold hover:underline ${isDark ? "text-emerald-400" : "text-emerald-500"}`}>
              Create one for free
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
