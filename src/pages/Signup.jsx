import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import {
    FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt,
    FaTint, FaHeartbeat, FaArrowRight, FaCheckCircle, FaHandHoldingHeart
} from "react-icons/fa";
import { Input, Select } from "../components/ui/Input";
import Button from "../components/ui/Button";

function Signup() {
    const [role, setRole] = useState("donor");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        city: "",
        bloodGroup: "",
        gender: "",
    });

    const { signup, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === "donor") navigate("/donor/dashboard");
            else navigate("/receiver/dashboard");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await signup({ ...formData, role });
            toast.success("Account created successfully!");
            if (user.role === "donor") {
                navigate("/donor/dashboard");
            } else {
                navigate("/receiver/dashboard");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const bloodGroupOptions = [
        { value: "A+", label: "A+" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B-", label: "B-" },
        { value: "AB+", label: "AB+" },
        { value: "AB-", label: "AB-" },
        { value: "O+", label: "O+" },
        { value: "O-", label: "O-" },
    ];

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
                            Join the Life-Saving Community
                        </h2>
                        <p className="text-red-100 text-lg">
                            Be part of a network that connects donors with those in need. Your registration could save a life today.
                        </p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <Feature text="Connect with verified donors instantly" />
                        <Feature text="Real-time emergency notifications" />
                        <Feature text="Track your impact and earn rewards" />
                        <Feature text="Join 10,000+ active life-savers" />
                    </div>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex items-center justify-center p-6 bg-neutral-50">
                <div className="w-full max-w-md space-y-8 animate-slide-in-right">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <FaHeartbeat className="text-red-600 text-3xl" />
                            <h1 className="text-2xl font-black text-neutral-900">BloodLink</h1>
                        </div>
                        <p className="text-neutral-600">Create your account</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
                        <div>
                            <h2 className="text-3xl font-black text-neutral-900 mb-2">Sign Up</h2>
                            <p className="text-neutral-600">Choose your role to get started</p>
                        </div>

                        {/* Role Selector */}
                        <div className="grid grid-cols-2 gap-3 p-2 bg-neutral-100 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setRole("donor")}
                                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl font-semibold transition-all ${role === "donor"
                                    ? "bg-white text-red-600 shadow-md"
                                    : "text-neutral-600 hover:text-neutral-900"
                                    }`}
                            >
                                <FaHandHoldingHeart className="text-2xl" />
                                <span className="text-sm">I want to Donate</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("receiver")}
                                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl font-semibold transition-all ${role === "receiver"
                                    ? "bg-white text-red-600 shadow-md"
                                    : "text-neutral-600 hover:text-neutral-900"
                                    }`}
                            >
                                <FaTint className="text-2xl" />
                                <span className="text-sm">I need Blood</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                name="name"
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                leftIcon={<FaUser />}
                            />

                            <Input
                                name="email"
                                type="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                leftIcon={<FaEnvelope />}
                            />

                            <Input
                                name="password"
                                type="password"
                                label="Password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                leftIcon={<FaLock />}
                                helperText="Minimum 6 characters"
                            />

                            {/* Donor-specific fields */}
                            {role === "donor" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            name="gender"
                                            label="Gender"
                                            placeholder="Select"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            options={[
                                                { value: "Male", label: "Male" },
                                                { value: "Female", label: "Female" },
                                                { value: "Other", label: "Other" }
                                            ]}
                                            required
                                        />
                                        <Select
                                            name="bloodGroup"
                                            label="Blood Group"
                                            placeholder="Select"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            options={bloodGroupOptions}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            name="phone"
                                            type="tel"
                                            label="Phone"
                                            placeholder="+1234567890"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            leftIcon={<FaPhone />}
                                        />
                                        <Input
                                            name="city"
                                            label="City"
                                            placeholder="New York"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            leftIcon={<FaMapMarkerAlt />}
                                        />
                                    </div>
                                </>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={loading}
                                rightIcon={<FaArrowRight />}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-neutral-500">Already have an account?</span>
                            </div>
                        </div>

                        <Button
                            to="/login"
                            variant="outline"
                            className="w-full"
                            size="lg"
                        >
                            Login
                        </Button>
                    </div>

                    <p className="text-center text-xs text-neutral-500">
                        By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
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

export default Signup;
