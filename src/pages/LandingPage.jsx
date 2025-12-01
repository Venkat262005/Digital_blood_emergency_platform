import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaHeartbeat, FaMapMarkedAlt, FaUserShield, FaAmbulance,
    FaTint, FaUsers, FaAward, FaCheckCircle, FaClock,
    FaHandHoldingHeart, FaPhone, FaChartLine, FaArrowRight
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { getDonors, getRequests } from "../services/api.js";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDonors: 0,
        totalRequests: 0,
        completedRequests: 0,
        activeDonors: 0
    });

    // Fetch real statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [donorsRes, requestsRes] = await Promise.all([
                    getDonors(),
                    getRequests()
                ]);

                const donors = donorsRes.data || [];
                const requests = requestsRes.data || [];

                setStats({
                    totalDonors: donors.length,
                    totalRequests: requests.length,
                    completedRequests: requests.filter(r => r.status === "Closed").length,
                    activeDonors: donors.filter(d => d.availabilityStatus === "Available").length
                });
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            }
        };

        fetchStats();
    }, []);

    // Auto-redirect logged-in users to their dashboard
    useEffect(() => {
        if (user) {
            const dashboardPath = user.role === "donor" ? "/donor/dashboard" : "/receiver/dashboard";
            navigate(dashboardPath, { replace: true });
        }
    }, [user, navigate]);


    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="container-custom section-padding relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 animate-slide-in-left">
                            {/* Badge Removed */}

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                                Save Lives,
                                <span className="block text-red-200">One Drop at a Time</span>
                            </h1>

                            <p className="text-xl text-red-100 max-w-xl leading-relaxed">
                                Connect with verified blood donors instantly. Our emergency platform ensures help reaches those in need within minutes, not hours.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                {user ? (
                                    <Button
                                        to={user.role === "donor" ? "/donor/dashboard" : "/receiver/dashboard"}
                                        size="lg"
                                        className="bg-white text-red-600 hover:bg-red-50 shadow-2xl"
                                    >
                                        Go to Dashboard
                                        <FaArrowRight />
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            to="/signup"
                                            size="lg"
                                            className="bg-white text-red-600 hover:bg-red-50 shadow-2xl"
                                        >
                                            <FaTint />
                                            Find Blood Donors
                                        </Button>
                                        <Button
                                            to="/signup"
                                            size="lg"
                                            variant="outline"
                                            className="border-white text-white hover:bg-white/10"
                                        >
                                            <FaHandHoldingHeart />
                                            Become a Donor
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                                <AnimatedStat number={stats.totalDonors} label="Total Donors" />
                                <AnimatedStat number={stats.totalRequests} label="Total Requests" />
                                <AnimatedStat number={stats.activeDonors} label="Active Donors" />
                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="hidden lg:block animate-slide-in-right">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl"></div>
                                <img
                                    src="https://img.freepik.com/free-vector/blood-donation-concept-illustration_114360-1044.jpg"
                                    alt="Blood Donation"
                                    className="relative w-full rounded-3xl shadow-2xl border-4 border-white/20 animate-float"
                                />
                                {/* Floating Badge */}
                                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl animate-pulse-soft">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <FaCheckCircle className="text-green-600 text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-900">Request Matched!</p>
                                            <p className="text-xs text-neutral-500">Donor found in 2 mins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px]">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="section-padding bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16 animate-slide-in-up">
                        <Badge variant="primary" className="mb-4">
                            Why Choose Us
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
                            Built for Emergencies
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Technology meets compassion. Our platform ensures blood reaches those in need faster than ever before.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                        <FeatureCard
                            icon={<FaAmbulance className="text-3xl" />}
                            title="SOS Emergency"
                            desc="Instant alerts to all nearby donors within 100km radius"
                            color="red"
                        />
                        <FeatureCard
                            icon={<FaMapMarkedAlt className="text-3xl" />}
                            title="Smart Matching"
                            desc="AI-powered location tracking finds closest donors"
                            color="blue"
                        />
                        <FeatureCard
                            icon={<FaUserShield className="text-3xl" />}
                            title="Verified Donors"
                            desc="All donors verified with blood test reports"
                            color="green"
                        />
                        <FeatureCard
                            icon={<FaClock className="text-3xl" />}
                            title="Real-time Updates"
                            desc="Track request status and donor responses live"
                            color="yellow"
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="section-padding bg-neutral-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <Badge variant="primary" className="mb-4">
                            Simple Process
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-neutral-600">
                            Four simple steps to save a life or get help
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* For Donors */}
                        <Card variant="elevated" className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <FaHeartbeat className="text-red-600 text-xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900">For Donors</h3>
                            </div>
                            <div className="space-y-4">
                                <ProcessStep number="1" text="Register and create your donor profile" />
                                <ProcessStep number="2" text="Upload blood test report for verification" />
                                <ProcessStep number="3" text="Mark yourself as 'Available' on dashboard" />
                                <ProcessStep number="4" text="Receive requests and save lives!" />
                            </div>
                            <Button to="/signup" className="w-full mt-6" variant="primary">
                                Become a Donor
                                <FaArrowRight />
                            </Button>
                        </Card>

                        {/* For Receivers */}
                        <Card variant="elevated" className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FaAmbulance className="text-blue-600 text-xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-neutral-900">For Receivers</h3>
                            </div>
                            <div className="space-y-4">
                                <ProcessStep number="1" text="Register and login to the platform" />
                                <ProcessStep number="2" text="Search donors by city and blood group" />
                                <ProcessStep number="3" text="Raise request or trigger SOS emergency" />
                                <ProcessStep number="4" text="Connect with donors via WhatsApp/Phone" />
                            </div>
                            <Button to="/signup" className="w-full mt-6" variant="secondary">
                                Find Blood Donors
                                <FaArrowRight />
                            </Button>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Impact Stats Section */}
            <section className="section-padding bg-gradient-to-br from-red-600 to-red-700 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`
                        ,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            Our Impact
                        </h2>
                        <p className="text-xl text-red-100">
                            Together, we're making a difference
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <AnimatedImpactStat icon={<FaUsers />} number={stats.totalDonors} label="Total Donors" />
                        <AnimatedImpactStat icon={<FaTint />} number={stats.completedRequests} label="Lives Saved" />
                        <AnimatedImpactStat icon={<FaChartLine />} number={stats.totalRequests} label="Total Requests" />
                        <AnimatedImpactStat icon={<FaClock />} number={stats.activeDonors} label="Active Donors" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-white">
                <div className="container-custom">
                    <Card variant="elevated" className="p-12 text-center bg-gradient-red-soft border-red-200">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <FaHeartbeat className="text-red-600 text-4xl" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-neutral-900">
                                Ready to Make a Difference?
                            </h2>
                            <p className="text-xl text-neutral-600">
                                Join thousands of heroes who are saving lives every day
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <Button to="/signup" size="lg" variant="primary">
                                    Get Started Now
                                    <FaArrowRight />
                                </Button>
                                <Button to="/login" size="lg" variant="outline">
                                    Login
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-12">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <FaHeartbeat className="text-red-500 text-3xl" />
                                <h2 className="text-2xl font-bold">BloodLink</h2>
                            </div>
                            <p className="text-neutral-400 max-w-md">
                                Connecting donors with those in need. Every drop counts, every second matters.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-neutral-400">
                                <li><Link to="/login" className="hover:text-white transition">Login</Link></li>
                                <li><Link to="/signup" className="hover:text-white transition">Register</Link></li>
                                <li><Link to="#" className="hover:text-white transition">About Us</Link></li>
                                <li><Link to="#" className="hover:text-white transition">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">Contact</h3>
                            <ul className="space-y-2 text-neutral-400">
                                <li className="flex items-center gap-2">
                                    <FaPhone className="text-sm" />
                                    <span>Emergency: 911</span>
                                </li>
                                <li>support@bloodlink.com</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500 text-sm">
                        © {new Date().getFullYear()} BloodLink. All rights reserved. Saving lives, one donation at a time.
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Component: StatItem
function StatItem({ number, label }) {
    return (
        <div>
            <p className="text-3xl font-black text-white">{number}</p>
            <p className="text-sm text-red-200">{label}</p>
        </div>
    );
}

// Component: FeatureCard
function FeatureCard({ icon, title, desc, color }) {
    const colorClasses = {
        red: 'bg-red-100 text-red-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    };

    return (
        <Card variant="interactive" className="p-6 text-center group">
            <div className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
        </Card>
    );
}

// Component: ProcessStep
function ProcessStep({ number, text }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 text-red-600 font-bold rounded-xl flex items-center justify-center">
                {number}
            </div>
            <p className="text-neutral-700 font-medium pt-2">{text}</p>
        </div>
    );
}

// Component: ImpactStat
function ImpactStat({ icon, number, label }) {
    return (
        <div className="text-center">
            <div className="text-5xl mb-3 opacity-80">{icon}</div>
            <p className="text-4xl font-black mb-1">{number}</p>
            <p className="text-red-200">{label}</p>
        </div>
    );
}

// Component: AnimatedStat (with counter animation)
function AnimatedStat({ number, label }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Always animate, even if number is 0
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = number / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            if (currentStep === steps) {
                setCount(number);
            } else {
                setCount(Math.floor(increment * currentStep));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [number]);

    return (
        <div>
            <p className="text-3xl font-black text-white">{count}</p>
            <p className="text-sm text-red-200">{label}</p>
        </div>
    );
}

// Component: AnimatedImpactStat (with counter animation)
function AnimatedImpactStat({ icon, number, label }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = number / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            if (currentStep === steps) {
                setCount(number);
                clearInterval(timer);
            } else {
                setCount(Math.floor(increment * currentStep));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [number]);

    return (
        <div className="text-center">
            <div className="text-5xl mb-3 opacity-80">{icon}</div>
            <p className="text-4xl font-black mb-1">{count}</p>
            <p className="text-red-200">{label}</p>
        </div>
    );
}

export default LandingPage;
