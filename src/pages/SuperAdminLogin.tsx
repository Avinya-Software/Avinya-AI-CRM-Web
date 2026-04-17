import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLoginSuperAdmin } from "../hooks/admin/useLoginAdmin";
import { useAuth } from "../auth/useAuth";
import { storage } from "../utils/storage";

type LoginErrors = {
  email?: string;
  password?: string;
};

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const navigate = useNavigate();

  const {
    mutate: loginSuperAdmin,
    isPending: isLoading,
    isError,
    error: loginErr
  } = useLoginSuperAdmin();

  /*   VALIDATION   */
  const validate = () => {
    const newErrors: LoginErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { login } = useAuth();

  /*   SUPER ADMIN LOGIN   */
  const handleLogin = () => {
    if (!validate()) return;

    // Clear existing storage to ensure no stale data interferes with the login
    storage.clearToken();
    storage.clearUserId();
    localStorage.removeItem("advisor");
    localStorage.removeItem("isSuperAdmin");

    loginSuperAdmin(
      { email, password },
      {
        onSuccess: (res) => {
          const data = res.data;
          // Set SuperAdmin flag before calling login
          localStorage.setItem("isSuperAdmin", "true");
          // Use the auth context login to ensure state remains updated
          login(data.token, data.userId);
          navigate("/users"); // Redirect to admin dashboard
        }
      }
    );
  };

  const errorMessage = (loginErr as any)?.response?.data?.message || "Login failed";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Login Card */}
        <div className="bg-white rounded-[4vh] shadow-[0_2vh_5vh_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden p-[5vh]">

          {/* Header Icon */}
          <div className="flex justify-center mb-[3vh]">
            <div className="w-[8vh] h-[8vh] bg-gradient-to-br from-[#38b2ac] to-[#0bc5ea] rounded-[2vh] flex items-center justify-center shadow-lg shadow-cyan-200">
              <span className="text-white text-[4vh]">✨</span>
            </div>
          </div>

          <div className="text-center mb-[4vh]">
            <h1 className="text-[3.5vh] font-bold text-[#1e293b] mb-[1vh]">
              Welcome SuperAdmin
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="space-y-[3vh]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-[3vh]"
            >
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#334155]">
                  <Mail className="w-4 h-4" />
                  <label className="text-xs font-semibold uppercase tracking-wider">
                    Email Address
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="pintu.avinya@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full px-5 py-3.5 rounded-xl bg-[#eff6ff] border-none outline-none transition-all text-[#1e293b] placeholder:text-slate-400/70 focus:ring-2 focus:ring-emerald-500/20
                      ${errors.email ? "ring-2 ring-red-500/20" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#334155]">
                    <Lock className="w-4 h-4" />
                    <label className="text-xs font-semibold uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`w-full px-5 py-3.5 rounded-xl bg-[#eff6ff] border-none outline-none transition-all text-[#1e293b] placeholder:text-slate-400/70 focus:ring-2 focus:ring-emerald-500/20
                      ${errors.password ? "ring-2 ring-red-500/20" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* API Error */}
              {isError && (
                <p className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-lg">
                  {errorMessage}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#10b981] text-white py-[2vh] rounded-[1.5vh] font-bold hover:bg-[#059669] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
