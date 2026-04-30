import { useState } from 'react';
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Mail, Lock, User, Building, Phone, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { registerAdvisorApi } from "../../api/advisor.api";
import SEO from "../../components/common/SEO.tsx";
import { storage } from "../../utils/storage";

export default function Signup() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    companyPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const inputClassName = `w-full px-5 py-3.5 rounded-2xl transition-all outline-none ${isDark ? "bg-slate-100 border border-slate-700/30 text-slate-900 placeholder:text-slate-500 focus:bg-white" : "bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white"}`;

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.companyPhone.trim()) {
      newErrors.companyPhone = 'Company phone is required';
    } else if (!/^\+?[0-9\s\-()]{10,}$/.test(formData.companyPhone)) {
      newErrors.companyPhone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors above');
      return;
    }

    setLoading(true);

    // Clear existing storage to ensure no stale data interferes with the registration/session
    storage.clearAll();

    try {
      const response = await registerAdvisorApi({
        fullName: formData.fullName,
        companyName: formData.companyName,
        companyPhone: formData.companyPhone,
        email: formData.email,
        password: formData.password,
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        setSuccess(true);
        toast.success('Account created successfully! Redirecting to login...');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 px-4 relative overflow-hidden flex items-center justify-center">
      <Toaster position="top-right" />

      <SEO
        title="Get Started - Join 5,000+ Teams Scaling with AI"
        description="Sign up for Avinya AI CRM and start automating your sales workflows today. Free 14-day trial included."
        keywords="Sign up AI CRM, Avinya AI Registration, CRM Free Trial"
      />

      <div className="bg-mesh absolute inset-0 opacity-50 dark:opacity-100" />

      {/* 🔥 SMALLER CONTAINER */}
      <div className="w-full max-w-2xl relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-6 md:p-8 rounded-3xl ${isDark
            ? "bg-slate-950/95 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
            : "bg-white/95 border border-slate-200/70 shadow-xl backdrop-blur-xl"
            }`}
        >

          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img
                src={theme === 'dark' ? '/Images/dark-logo.png' : '/Images/light-logo.png'}
                alt="Avinya Logo"
                className="h-32 w-auto object-contain"
              />
            </Link>

            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Get Started
            </h1>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              You’re getting 7 days of free access as part of our beta program. After you sign up, our team will review and approve your account within 2 hours so you can start using it.            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-5 p-3 rounded-xl flex items-start gap-3 ${isDark
                ? "bg-emerald-500/10 border border-emerald-500/30"
                : "bg-emerald-50 border border-emerald-200"
                }`}
            >
              <CheckCircle className={`w-4 h-4 mt-0.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
              <div>
                <p className={`font-semibold text-sm ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                  Account Created!
                </p>
                <p className={`text-xs ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                  Redirecting you to login...
                </p>
              </div>
            </motion.div>
          )}

          {/* FORM */}
          <form className="w-full space-y-5" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`${inputClassName} ${errors.fullName ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
              />
              {errors.fullName && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Building className="w-4 h-4" /> Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Acme Inc"
                className={`${inputClassName} ${errors.companyName ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
              />
              {errors.companyName && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.companyName}
                </div>
              )}
            </div>

            {/* Mobile + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Company Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Company Phone <span className="text-red-500">*</span>
                </label>

                <input
                  type="tel"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    handleInputChange(e);
                  }}
                  placeholder="9876543210"
                  className={`${inputClassName} ${errors.companyPhone
                    ? isDark
                      ? "border-red-500/50"
                      : "border-red-300"
                    : ""
                    }`}
                />

                {errors.companyPhone && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.companyPhone}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  className={`${inputClassName} ${errors.email
                    ? isDark
                      ? "border-red-500/50"
                      : "border-red-300"
                    : ""
                    }`}
                />

                {errors.email && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`${inputClassName} pr-12 ${errors.password ? "border-red-400" : ""
                      }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Confirm Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`${inputClassName} pr-12 ${errors.confirmPassword ? "border-red-400" : ""
                      }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 transition rounded-xl font-bold text-white flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={`mt-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Already have an account?{" "}
            <Link
              to="/login"
              className={`font-bold hover:underline ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
            >
              Sign in instead
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
