import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterAdvisor } from "../hooks/advisor/useRegisterAdvisor";

type RegisterErrors = {
  fullName?: string;
  mobileNumber?: string;
  email?: string;
  password?: string;
};

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const navigate = useNavigate();

  const {
    mutate: registerAdvisor,
    isPending,
    isError,
    error,
  } = useRegisterAdvisor();

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors: RegisterErrors = {};

    // Full Name
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Mobile
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\+?[1-9]\d{9,14}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = "Enter a valid mobile number";
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Password (Strong)
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
        form.password
      )
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number & special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- REGISTER ---------------- */

const handleRegister = () => {
  if (!validate()) return;

  registerAdvisor(form, {
    onSuccess: () => {
      toast.success(
        "Registration successful! Once the admin approves your request, you will be able to access the software."
      );

      navigate("/login");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  });
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-800">
            Join us and start managing your clients
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-5">
            {/* Full Name */}
            <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg outline-none
                    ${
                      errors.fullName
                        ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-2 focus:ring-slate-500"
                    }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg outline-none
                    ${
                      errors.mobileNumber
                        ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-2 focus:ring-slate-500"
                    }`}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-xs text-red-600">
                  {errors.mobileNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg outline-none
                    ${
                      errors.email
                        ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-2 focus:ring-slate-500"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-3 rounded-lg outline-none
                    ${
                      errors.password
                        ? "border border-red-500 focus:ring-2 focus:ring-red-500"
                        : "border border-gray-300 focus:ring-2 focus:ring-slate-500"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* API Error */}
            {isError && (
              <p className="text-sm text-red-600 text-center">
                {(error as any)?.response?.data?.message ||
                  "Registration failed"}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              onClick={handleRegister}
              disabled={isPending}
              className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            </form>
          </div>

          {/* Login Link */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center text-sm text-gray-800">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-slate-800 hover:text-slate-700 font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
