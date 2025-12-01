import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getRequests, getDonors } from "../../services/api.js";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { FaHospital, FaClock, FaCheckCircle, FaAmbulance, FaTint } from "react-icons/fa";

function DonationHistory() {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [donorProfile, setDonorProfile] = useState(null);

    useEffect(() => {
        const fetchDonationHistory = async () => {
            try {
                const [donorsRes, requestsRes] = await Promise.all([
                    getDonors(),
                    getRequests()
                ]);

                const profile = donorsRes.data.find(d => d.userId === user.id);
                setDonorProfile(profile);

                if (profile) {
                    // Find all requests where this donor has donated
                    const donorDonations = requestsRes.data.filter(request => {
                        const donorResponse = request.responses?.find(
                            r => r.donorId === profile.id && r.status === "Donated"
                        );
                        return donorResponse !== undefined;
                    });

                    setDonations(donorDonations);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchDonationHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-neutral-600">Loading donation history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-12">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-4xl font-black mb-2">Donation History</h1>
                    <p className="text-red-100">Your contributions to saving lives</p>
                </div>
            </div>

            <div className="container-custom mt-8">
                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">
                                <FaTint className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Total Donations</p>
                                <p className="text-2xl font-black text-neutral-900">{donations.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                                <FaCheckCircle className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Lives Impacted</p>
                                <p className="text-2xl font-black text-neutral-900">{donations.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-2xl">
                                <FaAmbulance className="text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">SOS Donations</p>
                                <p className="text-2xl font-black text-neutral-900">
                                    {donations.filter(d => d.isSOS).length}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Donations List */}
                {donations.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FaTint className="text-6xl text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">No Donations Yet</h3>
                        <p className="text-neutral-600">Start saving lives by responding to blood requests!</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {donations.map((donation) => (
                            <DonationCard key={donation.id} donation={donation} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DonationCard({ donation }) {
    return (
        <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {donation.isSOS && (
                            <Badge variant="error">
                                <FaAmbulance className="text-xs" />
                                SOS
                            </Badge>
                        )}
                        <Badge variant="primary">{donation.bloodGroup}</Badge>
                        <Badge variant="success">
                            <FaCheckCircle className="text-xs" />
                            Donated
                        </Badge>
                    </div>
                    <h3 className="font-bold text-neutral-900">{donation.patientName}</h3>
                    <p className="text-sm text-neutral-600">{donation.hospitalName || donation.hospital}</p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaHospital className="text-red-600" />
                    <span>{donation.hospitalAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <FaClock className="text-red-600" />
                    <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-700">
                    ✓ Verified donation - 60 points earned
                </p>
            </div>
        </Card>
    );
}

export default DonationHistory;
