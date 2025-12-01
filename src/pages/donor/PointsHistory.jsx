import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getRequests, getDonors } from "../../services/api.js";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { FaAward, FaTint, FaClock, FaCheckCircle, FaHospital, FaChartLine } from "react-icons/fa";

function PointsHistory() {
    const { user } = useAuth();
    const [pointsTransactions, setPointsTransactions] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [donorProfile, setDonorProfile] = useState(null);

    useEffect(() => {
        const fetchPointsHistory = async () => {
            try {
                const [donorsRes, requestsRes] = await Promise.all([
                    getDonors(),
                    getRequests()
                ]);

                const profile = donorsRes.data.find(d => d.userId === user.id);
                setDonorProfile(profile);

                if (profile) {
                    // Get total points from donor profile
                    setTotalPoints(profile.points || 0);

                    // Find all donations to create transaction history
                    const transactions = [];
                    requestsRes.data.forEach(request => {
                        const donorResponse = request.responses?.find(
                            r => r.donorId === profile.id && r.status === "Donated"
                        );

                        if (donorResponse) {
                            transactions.push({
                                id: request.id,
                                type: "donation",
                                points: 60,
                                description: `Donated ${request.bloodGroup} blood`,
                                patientName: request.patientName,
                                hospital: request.hospitalName || request.hospital,
                                date: donorResponse.timestamp || request.createdAt,
                                isSOS: request.isSOS
                            });
                        }
                    });

                    // Sort by date (newest first)
                    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setPointsTransactions(transactions);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchPointsHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-neutral-600">Loading points history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-12">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-8">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-4xl font-black mb-2">Points History</h1>
                    <p className="text-yellow-100">Track your rewards for saving lives</p>
                </div>
            </div>

            <div className="container-custom mt-8">
                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-2xl">
                                <FaAward className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-yellow-700">Total Points</p>
                                <p className="text-3xl font-black text-yellow-900">{totalPoints}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                                <FaTint className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Donations</p>
                                <p className="text-2xl font-black text-neutral-900">{pointsTransactions.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
                                <FaChartLine className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600">Avg per Donation</p>
                                <p className="text-2xl font-black text-neutral-900">
                                    {pointsTransactions.length > 0 ? (totalPoints / pointsTransactions.length).toFixed(1) : 0}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Transactions List */}
                <Card>
                    <Card.Header>
                        <h3 className="text-xl font-bold text-neutral-900">Transaction History</h3>
                    </Card.Header>
                    <Card.Body>
                        {pointsTransactions.length === 0 ? (
                            <div className="text-center py-12">
                                <FaAward className="text-6xl text-neutral-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">No Points Yet</h3>
                                <p className="text-neutral-600">Start donating blood to earn points!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pointsTransactions.map((transaction, index) => (
                                    <TransactionItem key={index} transaction={transaction} />
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}

function TransactionItem({ transaction }) {
    return (
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.isSOS ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                    <FaTint className={transaction.isSOS ? 'text-red-600' : 'text-green-600'} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-neutral-900">{transaction.description}</p>
                        {transaction.isSOS && (
                            <Badge variant="error" className="text-xs">SOS</Badge>
                        )}
                    </div>
                    <p className="text-sm text-neutral-600">{transaction.patientName} • {transaction.hospital}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                        <FaClock />
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-2 text-green-600 font-bold">
                    <span className="text-2xl">+{transaction.points}</span>
                    <FaAward />
                </div>
                <p className="text-xs text-neutral-500 mt-1">points</p>
            </div>
        </div>
    );
}

export default PointsHistory;
