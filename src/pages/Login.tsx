import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginAdmin } from "../hooks/admin/useLoginAdmin";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../context/PermissionContext";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-hot-toast";
import { storage } from "../utils/storage";
import SEO from "../components/common/SEO";

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

    // Clear existing storage to ensure no stale data interferes with the login
    storage.clearToken();
    storage.clearUserId();
    localStorage.removeItem("advisor");
    localStorage.removeItem("isSuperAdmin");

    loginAdmin(
      { email, password },
      {
        onSuccess: (res) => {
          const data = res.data;
          authLogin(data.token, data.userId);
          queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
          queryClient.invalidateQueries({ queryKey: ["user-menu"] });
          setLoginDone(true);
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

  // ✅ Navigate to first permitted route once permissions are ready
  useEffect(() => {
    if (loginDone && isReady) {
      navigate("/redirect");
    }
  }, [loginDone, isReady, navigate]);

  const errorMessage = (adminErr as any)?.response?.data?.statusMessage || (adminErr as any)?.response?.data?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <SEO 
        title="Login - Avinya AI CRM" 
        description="Sign in to your Avinya AI CRM dashboard to manage leads, tasks, and track your sales performance." 
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-800">Sign in to access your CRM dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); handleAdvisorLogin(); }} className="space-y-6">

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email" placeholder="you@company.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                    className={`w-full pl-11 pr-4 py-3 rounded-lg outline-none transition-all border ${errors.email ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-slate-500"}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    className={`w-full pl-11 pr-11 py-3 rounded-lg outline-none transition-all border ${errors.password ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-slate-500"}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
              </div>

              {adminError && <p className="text-sm text-red-600 text-center">{errorMessage || "Login failed"}</p>}

              <button type="submit" disabled={adminLoading}
                className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {adminLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Signing in...</>
                  : <>Sign In<ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center text-sm text-gray-800">
            Don't have an account?{" "}
            <Link to="/register" className="text-slate-800 hover:text-slate-700 font-semibold">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;