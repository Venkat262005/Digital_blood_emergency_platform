import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaKey, FaHeartbeat, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if user exists
            const res = await fetch("https://digital-blood-emergency-platform.onrender.com/users");
            const users = await res.json();
            const user = users.find((u) => u.email === email);

            if (!user) {
                toast.error("Email not found");
                setLoading(false);
                return;
            }

            // Generate OTP
            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            setGeneratedOtp(newOtp);

            // Send OTP via Email
            const emailRes = await fetch("https://digital-blood-emergency-platform.onrender.com/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: newOtp }),
            });

            if (emailRes.ok) {
                toast.success("OTP sent to your email!");
                setStep(2);
            } else {
                const errorData = await emailRes.json().catch(() => ({}));
                console.error("OTP send failed:", errorData);
                // Show OTP on page for testing when email fails
                toast.warning(`Email not configured. Test OTP: ${newOtp}`, { autoClose: false });
                setStep(2);
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error("Server error. Make sure backend is running on port 5001.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (otp !== generatedOtp) {
            toast.error("Invalid OTP");
            return;
        }

        setLoading(true);
        try {
            // Find user again to get ID
            const res = await fetch("https://digital-blood-emergency-platform.onrender.com/users");
            const users = await res.json();
            const user = users.find((u) => u.email === email);

            // Update password
            await fetch(`https://digital-blood-emergency-platform.onrender.com/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });

            toast.success("Password reset successfully! Please login.");
            navigate("/login");
        } catch (err) {
            toast.error("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-red-600 to-red-700 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative z-10 max-w-md space-y-8 animate-slide-in-left">
                    <div className="flex items-center gap-3">
                        <FaHeartbeat className="text-5xl" />
                        <h1 className="text-4xl font-black">BloodLink</h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold leading-tight">
                            Reset Your Password
                        </h2>
                        <p className="text-red-100 text-lg">
                            Don't worry! It happens. We'll help you get back to saving lives in no time.
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Feature text="Secure OTP verification" />
                        <Feature text="Quick password reset process" />
                        <Feature text="Back to your dashboard in minutes" />
                    </div>
                </div>
            </div>

            {/* Right Side - Reset Form */}
            <div className="flex items-center justify-center p-6 bg-neutral-50">
                <div className="w-full max-w-md space-y-8 animate-slide-in-right">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FaHeartbeat className="text-red-600 text-3xl" />
                            <h1 className="text-2xl font-black text-neutral-900">BloodLink</h1>
                        </div>
                        <p className="text-neutral-600">Reset your password</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                        <div>
                            <h2 className="text-3xl font-black text-neutral-900 mb-2">Forgot Password</h2>
                            <p className="text-neutral-600">
                                {step === 1 ? "Enter your email to receive OTP" : "Enter OTP and new password"}
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-2">
                            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-red-600' : 'bg-neutral-200'}`}></div>
                            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-red-600' : 'bg-neutral-200'}`}></div>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <Input
                                    type="email"
                                    label="Email Address"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    leftIcon={<FaEnvelope />}
                                    helperText="We'll send a 4-digit OTP to this email"
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    loading={loading}
                                    rightIcon={<FaArrowRight />}
                                >
                                    Send OTP
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="alert-info">
                                    <FaCheckCircle className="text-lg" />
                                    <div>
                                        <p className="font-semibold">OTP Sent!</p>
                                        <p className="text-sm">Check your email for the verification code</p>
                                    </div>
                                </div>

                                <Input
                                    type="text"
                                    label="Enter OTP"
                                    placeholder="1234"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    leftIcon={<FaKey />}
                                    maxLength={4}
                                />

                                <Input
                                    type="password"
                                    label="New Password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    leftIcon={<FaLock />}
                                    helperText="Minimum 6 characters"
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    loading={loading}
                                    rightIcon={<FaArrowRight />}
                                >
                                    Reset Password
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-sm text-neutral-600 hover:text-neutral-900 font-medium"
                                >
                                    ← Back to email
                                </button>
                            </form>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-neutral-500">Remembered your password?</span>
                            </div>
                        </div>

                        <Button
                            to="/login"
                            variant="outline"
                            className="w-full"
                            size="lg"
                        >
                            Back to Login
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Feature({ text }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-sm" />
            </div>
            <span className="text-red-100">{text}</span>
        </div>
    );
}

export default ForgotPassword;
