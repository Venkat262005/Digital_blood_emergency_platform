import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaHeartbeat, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user) {
      if (user.role === "donor") navigate("/donor/dashboard");
      else navigate("/receiver/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back!");
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
              Welcome Back to Saving Lives
            </h2>
            <p className="text-red-100 text-lg">
              Continue your journey of making a difference. Every login brings you closer to saving a life.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Feature text="Access your dashboard instantly" />
            <Feature text="Track your donation history" />
            <Feature text="Connect with those in need" />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-md space-y-8 animate-slide-in-right">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaHeartbeat className="text-red-600 text-3xl" />
              <h1 className="text-2xl font-black text-neutral-900">BloodLink</h1>
            </div>
            <p className="text-neutral-600">Welcome back!</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-black text-neutral-900 mb-2">Login</h2>
              <p className="text-neutral-600">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<FaEnvelope />}
              />

              <Input
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<FaLock />}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="checkbox" />
                  <span className="text-neutral-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-red-600 hover:text-red-700 font-semibold">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={loading}
                rightIcon={<FaArrowRight />}
              >
                Login
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">New to BloodLink?</span>
              </div>
            </div>

            <Button
              to="/signup"
              variant="outline"
              className="w-full"
              size="lg"
            >
              Create an Account
            </Button>
          </div>

          <p className="text-center text-xs text-neutral-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
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

export default Login;
