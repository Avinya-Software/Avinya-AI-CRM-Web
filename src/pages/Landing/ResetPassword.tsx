import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const hasPassword = searchParams.get("hasPassword") === "true";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", {
                email,
                token,
                newPassword: password
            });
            setSuccess(true);
            toast.success("Password set successfully!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.statusMessage || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
                    <h2 className="text-xl font-bold text-red-600">Invalid or Expired Link</h2>
                    <p className="text-gray-600 mt-2">The password reset link is invalid. Please request a new one.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 min-h-[60vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600 mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {success ? "Success!" : (hasPassword ? "Reset Your Password" : "Set Your Password")}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {success ? "Your password has been updated." : `Account: ${email}`}
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <p className="text-gray-600">You can now login with your new password.</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Go to Login <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    placeholder="Min. 8 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                placeholder="Repeat password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (hasPassword ? "Reset Password" : "Set Password")}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
