import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDonors, updateRequest, updateDonor, updateUser, getRequests } from "../../services/api.js";
import EditProfileModal from "../../components/EditProfileModal.jsx";
import { toast } from "react-toastify";
import { calculateDistance } from "../../utils/geo.js";
import {
    FaAmbulance, FaMapMarkerAlt, FaPhone, FaTint, FaCheckCircle,
    FaClock, FaStar, FaAward, FaChartLine, FaToggleOn, FaToggleOff,
    FaUser, FaEnvelope, FaFileUpload
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

function DonorDashboard() {
    const { user, updateUserProfile } = useAuth();
    const [donorProfile, setDonorProfile] = useState(null);
    const [sosRequests, setSosRequests] = useState([]);
    const [directRequests, setDirectRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);

    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.log("Geolocation error:", error);
                }
            );
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [donorsRes, requestsRes] = await Promise.all([
                    getDonors(),
                    getRequests(),
                ]);

                const profile = donorsRes.data.find((d) => d.userId === user.id);
                setDonorProfile(profile);

                if (profile) {
                    console.log('Donor Profile:', profile);
                    console.log('Donor ID:', profile.id, 'Type:', typeof profile.id);

                    const donorLat = currentLocation?.latitude || profile.latitude;
                    const donorLng = currentLocation?.longitude || profile.longitude;

                    const nearbySOS = requestsRes.data.filter((req) => {
                        // Must be SOS and Open
                        if (!req.isSOS || req.status === "Closed") return false;

                        // Check distance if coordinates available
                        if (!req.latitude || !donorLat) return true;

                        const dist = calculateDistance(donorLat, donorLng, req.latitude, req.longitude);
                        req.distance = dist.toFixed(1);
                        return dist <= 100 && req.bloodGroup === profile.bloodGroup;
                    });
                    setSosRequests(nearbySOS);

                    console.log('All Requests:', requestsRes.data);
                    const myDirectRequests = requestsRes.data.filter(req => {
                        const isTarget = req.targetDonorId === profile.id && req.status === "Open";

                        if (isTarget && req.latitude && donorLat) {
                            const dist = calculateDistance(donorLat, donorLng, req.latitude, req.longitude);
                            req.distance = dist.toFixed(1);
                        }

                        return isTarget;
                    });
                    console.log('Filtered Direct Requests:', myDirectRequests);
                    setDirectRequests(myDirectRequests);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user, currentLocation]);

    const toggleAvailability = async () => {
        if (!donorProfile) return;

        if (donorProfile.eligibilityStatus !== "Eligible") {
            toast.error("You are not eligible to donate based on your blood report.");
            return;
        }

        const newStatus = donorProfile.availabilityStatus === "Available" ? "Unavailable" : "Available";

        try {
            await updateDonor(donorProfile.id, { ...donorProfile, availabilityStatus: newStatus });
            setDonorProfile({ ...donorProfile, availabilityStatus: newStatus });
            toast.success(`Status updated to ${newStatus} `);
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('report', file);
        formData.append('donorId', donorProfile.id);

        try {
            const res = await fetch('https://digital-blood-emergency-platform.onrender.com/upload-report', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();

            setDonorProfile(prev => ({
                ...prev,
                reportUrl: data.reportUrl,
                eligibilityStatus: data.eligibilityStatus,
                nextEligibleDate: data.nextEligibleDate
            }));

            // Use the server message which includes cooldown info
            if (data.eligibilityStatus === 'Eligible') {
                toast.success(data.message);
            } else {
                toast.warning(data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload report');
        }
    };

    const handleMarkAsDonated = async (request) => {
        try {
            const responses = request.responses || [];
            const updatedResponses = responses.map(r =>
                r.donorId === donorProfile.id ? { ...r, status: "Donated_Pending_Confirmation" } : r
            );

            await updateRequest(request.id, { ...request, responses: updatedResponses });
            toast.success("Marked as donated! Waiting for receiver confirmation.");

            setSosRequests(prev => prev.map(req =>
                req.id === request.id ? { ...req, responses: updatedResponses } : req
            ));
            setDirectRequests(prev => prev.map(req =>
                req.id === request.id ? { ...req, responses: updatedResponses } : req
            ));
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleAcceptRequest = async (request) => {
        try {
            const responses = request.responses || [];
            const existingResponse = responses.find(r => r.donorId === donorProfile.id);

            if (existingResponse) {
                toast.info("You've already responded to this request");
                return;
            }

            responses.push({
                donorId: donorProfile.id,
                donorName: donorProfile.name,
                donorPhone: donorProfile.phone,
                status: "Accepted",
                timestamp: new Date().toISOString()
            });

            await updateRequest(request.id, { ...request, responses });
            toast.success("Request accepted! Patient will contact you.");

            // Update both SOS and Direct Requests state
            setSosRequests(prev => prev.map(req =>
                req.id === request.id ? { ...req, responses } : req
            ));
            setDirectRequests(prev => prev.map(req =>
                req.id === request.id ? { ...req, responses } : req
            ));
        } catch (err) {
            toast.error("Failed to accept request");
        }
    };

    const handleSaveProfile = async (formData) => {
        try {
            // Update user data
            await updateUser(user.id, {
                name: formData.name,
                phone: formData.phone,
                city: formData.city
            });

            // Update donor data - preserve ALL existing fields
            await updateDonor(donorProfile.id, {
                ...donorProfile,  // Keep all existing fields
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                gender: formData.gender
            });

            // Update AuthContext and localStorage
            updateUserProfile({
                name: formData.name,
                phone: formData.phone,
                city: formData.city
            });

            // Update local state
            setDonorProfile(prev => ({
                ...prev,
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                gender: formData.gender
            }));

            toast.success("Profile updated successfully!");
            setShowEditProfile(false);
        } catch (err) {
            toast.error("Failed to update profile");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-neutral-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!donorProfile) {
        return (
            <div className="container-custom py-12">
                <Card className="p-12 text-center">
                    <FaUser className="text-6xl text-neutral-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Profile Not Found</h2>
                    <p className="text-neutral-600">Please complete your donor registration.</p>
                </Card>
            </div>
        );
    }

    const isAvailable = donorProfile.availabilityStatus === "Available";
    const isEligible = donorProfile.eligibilityStatus === "Eligible";

    return (
        <div className="min-h-screen bg-neutral-50 pb-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">
                                Welcome back, {donorProfile.name}!
                            </h1>
                            <p className="text-red-100">
                                Thank you for being a life-saver. Your contribution makes a difference.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-red-200">Availability Status</p>
                                <p className="text-lg font-bold">{donorProfile.availabilityStatus}</p>
                            </div>
                            <button
                                onClick={toggleAvailability}
                                disabled={!isEligible}
                                className={`p-3 rounded-2xl transition-all ${isAvailable
                                    ? 'bg-white/20 hover:bg-white/30'
                                    : 'bg-white/10 hover:bg-white/20'
                                    } ${!isEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={!isEligible ? "Not eligible to donate" : "Toggle availability"}
                            >
                                {isAvailable ? (
                                    <FaToggleOn className="text-4xl" />
                                ) : (
                                    <FaToggleOff className="text-4xl" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom mt-8">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Stats Cards */}
                    <StatCard
                        icon={<FaTint />}
                        label="Blood Group"
                        value={donorProfile.bloodGroup}
                        color="red"
                    />
                    <StatCard
                        icon={<FaAward />}
                        label="Total Points"
                        value={donorProfile.points || 0}
                        color="yellow"
                    />
                    <StatCard
                        icon={<FaCheckCircle />}
                        label="Donations"
                        value={donorProfile.donationCount || 0}
                        color="green"
                    />
                    <StatCard
                        icon={<FaStar />}
                        label="Rating"
                        value={`${donorProfile.rating || 0}/5`}
                        color="blue"
                    />
                </div >

                {/* Eligibility Alert */}
                {
                    !isEligible && (
                        <div className="alert-warning mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <FaClock className="text-xl shrink-0" />
                                <div>
                                    <p className="font-semibold">Not Eligible to Donate</p>
                                    <p className="text-sm">
                                        {donorProfile.nextEligibleDate
                                            ? `You can donate again after ${new Date(donorProfile.nextEligibleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (${donorProfile.gender === 'Female' ? '4' : '3'} month cooldown period).`
                                            : 'Please upload your blood test report for verification.'
                                        }
                                    </p>
                                </div>
                            </div>
                            {!donorProfile.nextEligibleDate && (
                                <div className="ml-auto">
                                    <input
                                        type="file"
                                        id="report-upload"
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={handleFileUpload}
                                    />
                                    <label
                                        htmlFor="report-upload"
                                        className="flex items-center gap-2 bg-white text-yellow-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors font-medium text-sm"
                                    >
                                        <FaFileUpload />
                                        Upload Report
                                    </label>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Direct Requests Section */}
                {
                    directRequests.length > 0 && (
                        <div className="mt-8 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-neutral-900">Direct Requests</h2>
                                    <p className="text-neutral-600">Requests specifically sent to you</p>
                                </div>
                                <Badge variant="primary" className="text-base px-4 py-2">
                                    <FaUser />
                                    {directRequests.length} Requests
                                </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {directRequests.map((request) => (
                                    <RequestCard
                                        key={request.id}
                                        request={request}
                                        donorProfile={donorProfile}
                                        onAccept={handleAcceptRequest}
                                        onMarkAsDonated={handleMarkAsDonated}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* SOS Requests Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-neutral-900">Emergency Requests</h2>
                            <p className="text-neutral-600">SOS requests within 100km matching your blood group</p>
                        </div>
                        <Badge variant="error" className="text-base px-4 py-2">
                            <FaAmbulance />
                            {sosRequests.length} Active
                        </Badge>
                    </div>

                    {sosRequests.length === 0 ? (
                        <Card className="p-12 text-center">
                            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Emergency Requests</h3>
                            <p className="text-neutral-600">
                                Great! There are no SOS requests in your area right now.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {sosRequests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    donorProfile={donorProfile}
                                    onAccept={handleAcceptRequest}
                                    onMarkAsDonated={handleMarkAsDonated}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile Info */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <Card>
                        <Card.Header>
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-neutral-900">Profile Information</h3>
                                <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
                                    Edit Profile
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body className="space-y-4">
                            <InfoRow icon={<FaUser />} label="Name" value={donorProfile.name} />
                            <InfoRow icon={<FaEnvelope />} label="Email" value={user.email} />
                            <InfoRow icon={<FaPhone />} label="Phone" value={donorProfile.phone} />
                            <InfoRow icon={<FaMapMarkerAlt />} label="City" value={donorProfile.city} />
                            <InfoRow icon={<FaTint />} label="Blood Group" value={donorProfile.bloodGroup} />
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>
                            <h3 className="text-xl font-bold text-neutral-900">Donation Stats</h3>
                        </Card.Header>
                        <Card.Body className="space-y-4">
                            <InfoRow icon={<FaCheckCircle />} label="Total Donations" value={donorProfile.donationCount || 0} />
                            <InfoRow icon={<FaAward />} label="Points Earned" value={donorProfile.points || 0} />
                            <InfoRow icon={<FaStar />} label="Rating" value={`${donorProfile.rating || 0}/5`} />
                            <InfoRow icon={<FaChartLine />} label="Status" value={donorProfile.eligibilityStatus} />
                        </Card.Body>
                    </Card>
                </div>
            </div >
            {showEditProfile && (
                <EditProfileModal
                    user={user}
                    donorProfile={donorProfile}
                    onClose={() => setShowEditProfile(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </div >
    );
}

// StatCard Component
function StatCard({ icon, label, value, color }) {
    const colorClasses = {
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${colorClasses[color]} rounded-2xl flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-neutral-600">{label}</p>
                    <p className="text-2xl font-black text-neutral-900">{value}</p>
                </div>
            </div>
        </Card>
    );
}

// RequestCard Component
function RequestCard({ request, donorProfile, onAccept, onMarkAsDonated }) {
    const myResponse = request.responses?.find(r => r.donorId === donorProfile.id);
    const hasResponded = !!myResponse;
    const isAccepted = myResponse?.status === "Accepted";
    const isPendingConfirmation = myResponse?.status === "Donated_Pending_Confirmation";
    const isDonated = myResponse?.status === "Donated";

    const handleContactReceiver = () => {
        if (request.contactNumber) {
            window.location.href = `tel:${request.contactNumber}`;
        }
    };

    const handleNavigateToHospital = () => {
        if (request.latitude && request.longitude) {
            // Open Google Maps with directions
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`;
            window.open(mapsUrl, '_blank');
        } else if (request.hospitalAddress) {
            // Fallback to address search
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.hospitalAddress)}`;
            window.open(mapsUrl, '_blank');
        }
    };

    return (
        <Card variant="interactive" className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="error">
                            <FaAmbulance className="text-xs" />
                            SOS
                        </Badge>
                        <Badge variant="primary">{request.bloodGroup}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">{request.patientName}</h3>
                    <p className="text-sm text-neutral-600">{request.hospitalName || request.hospital}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-red-600">
                        {request.distance ? request.distance : "N/A"}
                    </p>
                    <p className="text-xs text-neutral-500">
                        {request.distance ? "km (approx)" : "Distance"}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaMapMarkerAlt className="text-red-600" />
                    <span>{request.hospitalAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaPhone className="text-red-600" />
                    <span>{request.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaClock className="text-red-600" />
                    <span>{new Date(request.createdAt).toLocaleString()}</span>
                </div>
            </div>

            {hasResponded ? (
                <div className="space-y-3">
                    {isAccepted && (
                        <Button
                            onClick={() => onMarkAsDonated(request)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            <FaCheckCircle />
                            Mark as Donated
                        </Button>
                    )}

                    {isPendingConfirmation && (
                        <Badge variant="warning" className="w-full justify-center py-3">
                            <FaClock />
                            Waiting for Confirmation
                        </Badge>
                    )}

                    {isDonated && (
                        <Badge variant="success" className="w-full justify-center py-3">
                            <FaCheckCircle />
                            Donation Verified
                        </Badge>
                    )}

                    {!isAccepted && !isPendingConfirmation && !isDonated && (
                        <Badge variant="success" className="w-full justify-center py-3">
                            <FaCheckCircle />
                            Request Accepted
                        </Badge>
                    )}

                    {/* Contact and Navigate Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={handleContactReceiver}
                            variant="outline"
                            className="text-xs bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                        >
                            <FaPhone />
                            Contact
                        </Button>
                        <Button
                            onClick={handleNavigateToHospital}
                            variant="outline"
                            className="text-xs bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                        >
                            <FaMapMarkerAlt />
                            Navigate
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    onClick={() => onAccept(request)}
                    className="w-full"
                    variant="primary"
                >
                    Accept Request
                </Button>
            )}
        </Card>
    );
}

// InfoRow Component
function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-600">
                {icon}
            </div>
            <div>
                <p className="text-xs text-neutral-500">{label}</p>
                <p className="font-semibold text-neutral-900">{value}</p>
            </div>
        </div>
    );
}

export default DonorDashboard;
