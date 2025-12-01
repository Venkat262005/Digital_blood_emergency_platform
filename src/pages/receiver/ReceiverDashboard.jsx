import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDonors, getRequests, sendDonorRequest, createRequest, updateRequest, updateUser } from "../../services/api.js";
import EditProfileModal from "../../components/EditProfileModal.jsx";
import {
    FaWhatsapp, FaAmbulance, FaSearch, FaPlus, FaMapMarkerAlt,
    FaPhone, FaTint, FaCheckCircle, FaClock, FaUser, FaHospital,
    FaFilter, FaTimes, FaBed, FaStickyNote, FaArrowRight, FaEdit
} from "react-icons/fa";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { Input, Select, Textarea } from "../../components/ui/Input";

function ReceiverDashboard() {
    const { user, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(user);
    const [myRequests, setMyRequests] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ bloodGroup: "", city: "" });
    const [showFilters, setShowFilters] = useState(false);

    // Saved request details (filled once, used for all donors)
    const [savedRequestDetails, setSavedRequestDetails] = useState(null);
    const [showDetailsForm, setShowDetailsForm] = useState(false);
    const [requestFormData, setRequestFormData] = useState({
        patientName: "",
        unitsRequired: 1,
        hospital: "",
        hospitalAddress: "",
        bedNumber: "",
        city: "",
        contactNumber: "",
        urgency: "Medium",
        isSOS: false,
        notes: ""
    });
    const [sentDonorIds, setSentDonorIds] = useState(new Set());
    const [submittingDonorId, setSubmittingDonorId] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);

    useEffect(() => {
        if (user) {
            setUserProfile(user);
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [donorsRes, requestsRes] = await Promise.all([
                    getDonors(),
                    getRequests(),
                ]);

                const availableDonors = donorsRes.data.filter(d => d.availabilityStatus === "Available");
                setDonors(availableDonors);

                if (user) {
                    const userRequests = requestsRes.data.filter(req => req.userId === user.id);
                    setMyRequests(userRequests);

                    // Populate sentDonorIds from existing open requests
                    const alreadySentDonorIds = new Set(
                        userRequests
                            .filter(req => req.status === "Open" && req.targetDonorId)
                            .map(req => req.targetDonorId)
                    );
                    setSentDonorIds(alreadySentDonorIds);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filteredDonors = donors.filter((d) => {
        const matchGroup = filters.bloodGroup ? d.bloodGroup === filters.bloodGroup : true;
        const matchCity = filters.city ? d.city?.toLowerCase().includes(filters.city.toLowerCase()) : true;
        return matchGroup && matchCity && d.availabilityStatus === "Available";
    });

    const getWhatsAppLink = (donor) => {
        const message = `URGENT: Hello ${donor.name}, I found your contact on the Emergency Blood Platform. We have an emergency requirement for ${donor.bloodGroup} blood. Are you available to donate?`;
        return `https://wa.me/91${donor.phone}?text=${encodeURIComponent(message)}`;
    };

    const handleRequestFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRequestFormData({
            ...requestFormData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSaveRequestDetails = (e) => {
        e.preventDefault();
        setSavedRequestDetails({ ...requestFormData });
        setShowDetailsForm(false);
        toast.success("Request details saved! Now you can send to multiple donors.");
    };

    const handleSendToSpecificDonor = async (donor) => {
        if (!savedRequestDetails) {
            toast.error("Please fill request details first!");
            setShowDetailsForm(true);
            return;
        }

        // Check if already sent to this donor
        if (sentDonorIds.has(donor.id)) {
            toast.info(`You already sent a request to ${donor.name}`);
            return;
        }

        setSubmittingDonorId(donor.id);

        try {
            const requestData = {
                ...savedRequestDetails,
                bloodGroup: donor.bloodGroup,
                userId: user.id,
                status: "Open",
                createdAt: new Date().toISOString().split("T")[0],
                urgency: savedRequestDetails.isSOS ? "High" : savedRequestDetails.urgency,
                targetDonorId: donor.id,
                targetDonorName: donor.name
            };

            console.log('Sending request with targetDonorId:', donor.id, 'type:', typeof donor.id);
            const res = await createRequest(requestData);
            toast.success(`Request sent to ${donor.name}!`);

            // Send email notification
            try {
                await sendDonorRequest({
                    donorId: donor.id,
                    donorEmail: donor.email || `${donor.phone}@example.com`,
                    receiverName: user.name,
                    receiverEmail: user.email,
                    bloodGroup: donor.bloodGroup,
                    requestDetails: requestData
                });
            } catch (err) {
                console.error("Failed to send email:", err);
            }

            // Update local state
            setMyRequests([...myRequests, { ...requestData, id: res.data.id }]);

            // Mark this donor as sent
            setSentDonorIds(prev => new Set([...prev, donor.id]));
        } catch (err) {
            if (err.response && err.response.status === 409) {
                toast.error("Duplicate request! You already have an open request for this donor.");
            } else {
                toast.error("Failed to send request");
            }
        } finally {
            setSubmittingDonorId(null);
        }
    };

    const handleConfirmDonation = async (requestId, donorId) => {
        try {
            await fetch('http://localhost:5001/confirm-donation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, donorId })
            });

            setMyRequests(prev => prev.map(req => {
                if (req.id === requestId) {
                    const updatedResponses = req.responses.map(r =>
                        r.donorId === donorId ? { ...r, status: 'Donated' } : r
                    );
                    return { ...req, responses: updatedResponses };
                }
                return req;
            }));

            toast.success("Donation confirmed! Thank you.");
        } catch (err) {
            toast.error("Failed to confirm donation");
        }
    };

    const handleMarkAsCompleted = async (requestId) => {
        const request = myRequests.find(r => r.id === requestId);

        if (!request) return;

        const donatedResponses = request.responses?.filter(r => r.status === "Donated") || [];

        if (donatedResponses.length === 0) {
            toast.warning("Please confirm at least one donor's donation before marking as completed.");
            return;
        }

        const confirmed = window.confirm(
            `Mark this request as completed? This will:\n- Close the request\n- Award points to ${donatedResponses.length} donor(s)\n- This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await updateRequest(requestId, { ...request, status: "Closed" });

            for (const response of donatedResponses) {
                try {
                    await fetch('http://localhost:5001/award-points', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            donorId: response.donorId,
                            requestId: requestId,
                            points: 10
                        })
                    });
                } catch (err) {
                    console.error(`Failed to award points to donor ${response.donorId}:`, err);
                }
            }

            setMyRequests(prev => prev.map(req =>
                req.id === requestId ? { ...req, status: "Closed" } : req
            ));

            toast.success(`Request completed! ${donatedResponses.length} donor(s) awarded points.`);
        } catch (err) {
            toast.error("Failed to mark request as completed");
        }
    };

    const handleSaveProfile = async (formData) => {
        try {
            await updateUser(user.id, {
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                gender: formData.gender
            });

            // Update AuthContext and localStorage
            const updates = {
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                gender: formData.gender
            };
            updateUserProfile(updates);

            // Update local state
            setUserProfile({
                ...userProfile,
                ...updates
            });

            toast.success("Profile updated successfully!");
            setShowEditProfile(false);
        } catch (err) {
            toast.error("Failed to update profile");
            console.error(err);
        }
    };

    const handleCancelRequest = async (requestId) => {
        const confirmed = window.confirm("Are you sure you want to cancel this request?");
        if (!confirmed) return;

        try {
            await updateRequest(requestId, { status: "Cancelled" });
            setMyRequests(prev => prev.filter(req => req.id !== requestId));
            toast.success("Request cancelled successfully");
        } catch (err) {
            toast.error("Failed to cancel request");
        }
    };

    const handleEditRequest = (requestId) => {
        navigate(`/requests/${requestId}/edit`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-neutral-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    return (
        <div className="min-h-screen bg-neutral-50 pb-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">
                                Find Blood Donors
                            </h1>
                            <p className="text-red-100">
                                Connect with verified donors in your area. Help is just a click away.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowDetailsForm(true)}
                                size="lg"
                                className="bg-white text-red-600 hover:bg-red-50"
                            >
                                <FaEdit />
                                {savedRequestDetails ? "Edit Details" : "Fill Request Details"}
                            </Button>
                            <Button
                                to="/requests/new"
                                size="lg"
                                variant="outline"
                                className="border-white text-white hover:bg-white/10"
                            >
                                <FaPlus />
                                Create SOS Request
                            </Button>
                        </div>
                    </div>

                    {/* Saved Details Indicator */}
                    {savedRequestDetails && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-white">✓ Request Details Saved</p>
                                    <p className="text-sm text-red-100">
                                        Patient: {savedRequestDetails.patientName} | Hospital: {savedRequestDetails.hospital}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowDetailsForm(true)}
                                    size="sm"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white/10"
                                >
                                    <FaEdit />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container-custom mt-8">
                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<FaUser />}
                        label="Available Donors"
                        value={donors.length}
                        color="green"
                    />
                    <StatCard
                        icon={<FaAmbulance />}
                        label="My Requests"
                        value={myRequests.length}
                        color="red"
                    />
                    <div className="cursor-pointer" onClick={() => navigate('/history')}>
                        <StatCard
                            icon={<FaCheckCircle />}
                            label="Completed"
                            value={myRequests.filter(r => r.status === "Closed").length}
                            color="blue"
                        />
                    </div>
                </div>

                {/* Profile Information */}
                <Card className="mb-8">
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-neutral-900">Profile Information</h3>
                            <Button variant="outline" size="sm" onClick={() => setShowEditProfile(true)}>
                                Edit Profile
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <FaUser className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600">Name</p>
                                        <p className="font-semibold text-neutral-900">{userProfile?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FaPhone className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600">Phone</p>
                                        <p className="font-semibold text-neutral-900">{userProfile?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <FaUser className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-600">Email</p>
                                        <p className="font-semibold text-neutral-900">{userProfile?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <p className="font-semibold text-neutral-900">{userProfile?.city || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* My Requests Section */}
                {myRequests.filter(r => r.status === "Open").length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-neutral-900">My Requests</h2>
                                <p className="text-neutral-600">Track your active blood requests</p>
                            </div>
                            <Badge variant="primary" className="text-base px-4 py-2">
                                {myRequests.filter(r => r.status === "Open").length} Active
                            </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {myRequests.filter(r => r.status === "Open").map(request => (
                                <MyRequestCard
                                    key={request.id}
                                    request={request}
                                    onConfirmDonation={handleConfirmDonation}
                                    onMarkAsCompleted={handleMarkAsCompleted}
                                    onCancelRequest={handleCancelRequest}
                                    onEditRequest={handleEditRequest}
                                />
                            ))}
                        </div>
                    </div>
                )}



                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-neutral-900">Available Donors</h2>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        leftIcon={<FaFilter />}
                    >
                        Filters
                    </Button>
                </div>

                {showFilters && (
                    <Card className="p-6 mb-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Select
                                label="Blood Group"
                                value={filters.bloodGroup}
                                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                                options={bloodGroups.map(bg => ({ value: bg, label: bg }))}
                                placeholder="All Blood Groups"
                            />
                            <Input
                                label="City"
                                placeholder="Search by city..."
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                leftIcon={<FaSearch />}
                            />
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setFilters({ bloodGroup: "", city: "" })}
                                >
                                    <FaTimes />
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Donors Grid */}
                {filteredDonors.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FaUser className="text-6xl text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">No Donors Found</h3>
                        <p className="text-neutral-600">
                            Try adjusting your filters or check back later.
                        </p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDonors.map(donor => (
                            <DonorCard
                                key={donor.id}
                                donor={donor}
                                onSendRequest={handleSendToSpecificDonor}
                                getWhatsAppLink={getWhatsAppLink}
                                hasRequestDetails={!!savedRequestDetails}
                                isSubmitting={submittingDonorId === donor.id}
                                isSent={sentDonorIds.has(donor.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Request Details Form Modal */}
            {showDetailsForm && (
                <RequestDetailsModal
                    formData={requestFormData}
                    onChange={handleRequestFormChange}
                    onSubmit={handleSaveRequestDetails}
                    onClose={() => setShowDetailsForm(false)}
                />
            )}

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <EditProfileModal
                    user={userProfile}
                    onClose={() => setShowEditProfile(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    );
}

// StatCard Component
function StatCard({ icon, label, value, color }) {
    const colorClasses = {
        red: 'bg-red-100 text-red-600',
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

// DonorCard Component
function DonorCard({ donor, onSendRequest, getWhatsAppLink, hasRequestDetails, isSubmitting, isSent }) {
    const getButtonText = () => {
        if (isSent) return "Already Sent";
        if (!hasRequestDetails) return "Fill Details First";
        return "Send Request";
    };

    const isDisabled = !hasRequestDetails || isSubmitting || isSent;

    return (
        <Card variant="interactive" className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900">{donor.name}</h3>
                        <p className="text-sm text-neutral-600">{donor.city}</p>
                    </div>
                </div>
                <Badge variant="error" className="text-lg font-bold">
                    {donor.bloodGroup}
                </Badge>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaPhone className="text-red-600" />
                    <span>{donor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaMapMarkerAlt className="text-red-600" />
                    <span>{donor.address || donor.city}</span>
                </div>
                {donor.rating && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="text-yellow-500">★</span>
                        <span>{donor.rating}/5</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    onClick={() => onSendRequest(donor)}
                    disabled={isDisabled}
                    variant={hasRequestDetails && !isSent ? "primary" : "outline"}
                    className="text-xs"
                    loading={isSubmitting}
                >
                    {getButtonText()}
                </Button>
                <Button
                    as="a"
                    href={getWhatsAppLink(donor)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    className="text-xs bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                >
                    <FaWhatsapp />
                    WhatsApp
                </Button>
            </div>
        </Card>
    );
}

// MyRequestCard Component
function MyRequestCard({ request, onConfirmDonation, onMarkAsCompleted, onCancelRequest, onEditRequest }) {
    const responses = request.responses || [];
    const acceptedResponses = responses.filter(r => r.status === "Accepted");
    const pendingConfirmationResponses = responses.filter(r => r.status === "Donated_Pending_Confirmation");
    const donatedResponses = responses.filter(r => r.status === "Donated");
    const isOpen = request.status === "Open";

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {request.isSOS && (
                            <Badge variant="error">
                                <FaAmbulance className="text-xs" />
                                SOS
                            </Badge>
                        )}
                        <Badge variant="primary">{request.bloodGroup}</Badge>
                        <Badge variant={request.status === "Closed" ? "success" : "neutral"}>
                            {request.status}
                        </Badge>
                    </div>
                    <h3 className="font-bold text-neutral-900">{request.patientName}</h3>
                    <p className="text-sm text-neutral-600">{request.hospitalName || request.hospital}</p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaHospital className="text-red-600" />
                    <span>{request.hospitalAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaClock className="text-red-600" />
                    <span>{new Date(request.createdAt).toLocaleString()}</span>
                </div>
            </div>

            {acceptedResponses.length > 0 && (
                <div className="border-t border-neutral-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-neutral-700 mb-2">
                        Donors Responded ({acceptedResponses.length})
                    </p>
                    <div className="space-y-2">
                        {acceptedResponses.map((response, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-sm">{response.donorName}</p>
                                    <p className="text-xs text-neutral-600">{response.donorPhone}</p>
                                </div>
                                <Badge variant="neutral">Accepted</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pendingConfirmationResponses.length > 0 && (
                <div className="border-t border-neutral-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-yellow-700 mb-2">
                        Pending Verification ({pendingConfirmationResponses.length})
                    </p>
                    <div className="space-y-2">
                        {pendingConfirmationResponses.map((response, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <div>
                                    <p className="font-semibold text-sm">{response.donorName}</p>
                                    <p className="text-xs text-neutral-600">{response.donorPhone}</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => onConfirmDonation(request.id, response.donorId)}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                                >
                                    Verify & Award Points
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {donatedResponses.length > 0 && (
                <div className="border-t border-neutral-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-green-700 mb-2">
                        Donations Verified ({donatedResponses.length})
                    </p>
                    <div className="space-y-2">
                        {donatedResponses.map((response, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
                                <div>
                                    <p className="font-semibold text-sm">{response.donorName}</p>
                                    <p className="text-xs text-neutral-600">{response.donorPhone}</p>
                                </div>
                                <Badge variant="success">
                                    <FaCheckCircle />
                                    Donated
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && (
                <div className="flex gap-2">
                    <Button
                        onClick={() => onEditRequest(request.id)}
                        variant="outline"
                        className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                        <FaEdit />
                        Edit
                    </Button>
                    <Button
                        onClick={() => onCancelRequest(request.id)}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <FaTimes />
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onMarkAsCompleted(request.id)}
                        variant={donatedResponses.length > 0 ? "primary" : "outline"}
                        className={donatedResponses.length > 0
                            ? "flex-1"
                            : "flex-1 text-neutral-600 border-neutral-300"
                        }
                        disabled={donatedResponses.length === 0}
                    >
                        <FaCheckCircle />
                        Complete
                    </Button>
                </div>
            )}
        </Card>
    );
}

// RequestDetailsModal Component
function RequestDetailsModal({ formData, onChange, onSubmit, onClose }) {
    const urgencyLevels = ["Low", "Medium", "High"];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between rounded-t-3xl">
                    <div>
                        <h2 className="text-2xl font-black text-neutral-900">Fill Request Details Once</h2>
                        <p className="text-neutral-600">
                            These details will be used for all donors you send requests to
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                    >
                        <FaTimes className="text-neutral-600" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* SOS Toggle */}
                    <div className={`p-4 rounded-xl border-2 transition-all ${formData.isSOS
                        ? 'bg-red-50 border-red-300'
                        : 'bg-neutral-50 border-neutral-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaAmbulance className={formData.isSOS ? 'text-red-600 text-xl' : 'text-neutral-400 text-xl'} />
                                <div>
                                    <h3 className="font-bold text-neutral-900">Mark as SOS Emergency</h3>
                                    <p className="text-xs text-neutral-600">High priority urgent request</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isSOS"
                                    checked={formData.isSOS}
                                    onChange={onChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            name="patientName"
                            label="Patient Name"
                            placeholder="John Doe"
                            value={formData.patientName}
                            onChange={onChange}
                            required
                            leftIcon={<FaUser />}
                        />
                        <Input
                            name="unitsRequired"
                            type="number"
                            label="Units Required"
                            placeholder="1"
                            value={formData.unitsRequired}
                            onChange={onChange}
                            min="1"
                            required
                            leftIcon={<FaTint />}
                        />
                        <Input
                            name="contactNumber"
                            type="tel"
                            label="Contact Number"
                            placeholder="+1234567890"
                            value={formData.contactNumber}
                            onChange={onChange}
                            required
                            leftIcon={<FaPhone />}
                        />
                        {!formData.isSOS && (
                            <Select
                                name="urgency"
                                label="Urgency Level"
                                value={formData.urgency}
                                onChange={onChange}
                                options={urgencyLevels.map(level => ({ value: level, label: level }))}
                            />
                        )}
                    </div>

                    {/* Hospital Information */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            name="hospital"
                            label="Hospital Name"
                            placeholder="City General Hospital"
                            value={formData.hospital}
                            onChange={onChange}
                            required
                            leftIcon={<FaHospital />}
                        />
                        <Input
                            name="city"
                            label="City"
                            placeholder="New York"
                            value={formData.city}
                            onChange={onChange}
                            required
                            leftIcon={<FaMapMarkerAlt />}
                        />
                        <div className="md:col-span-2">
                            <Input
                                name="hospitalAddress"
                                label="Hospital Address"
                                placeholder="123 Main St, City"
                                value={formData.hospitalAddress}
                                onChange={onChange}
                                required
                                leftIcon={<FaMapMarkerAlt />}
                            />
                        </div>
                        <Input
                            name="bedNumber"
                            label="Bed/Ward Number"
                            placeholder="ICU-101"
                            value={formData.bedNumber}
                            onChange={onChange}
                            leftIcon={<FaBed />}
                        />
                    </div>

                    {/* Additional Notes */}
                    <Textarea
                        name="notes"
                        label="Additional Notes"
                        placeholder="Any additional information..."
                        value={formData.notes}
                        onChange={onChange}
                        rows={3}
                    />

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            rightIcon={<FaCheckCircle />}
                        >
                            Save Details
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReceiverDashboard;
