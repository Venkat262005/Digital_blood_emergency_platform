import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getRequests } from "../../services/api.js";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { FaHospital, FaClock, FaCheckCircle, FaAmbulance } from "react-icons/fa";

function History() {
    const { user } = useAuth();
    const [historyRequests, setHistoryRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getRequests();
                if (user) {
                    const myClosedRequests = res.data.filter(
                        req => req.userId === user.id && req.status === "Closed"
                    );
                    setHistoryRequests(myClosedRequests);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-neutral-600">Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-12">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
                <div className="container-custom">
                    <h1 className="text-3xl md:text-4xl font-black mb-2">Request History</h1>
                    <p className="text-red-100">View your completed and closed blood requests</p>
                </div>
            </div>

            <div className="container-custom mt-8">
                {historyRequests.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FaCheckCircle className="text-6xl text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">No History Found</h3>
                        <p className="text-neutral-600">You haven't completed any requests yet.</p>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {historyRequests.map((request) => (
                            <HistoryCard key={request.id} request={request} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function HistoryCard({ request }) {
    const donatedResponses = request.responses?.filter(r => r.status === "Donated") || [];

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
                        <Badge variant="success">Closed</Badge>
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

            <div className="border-t border-neutral-200 pt-4">
                <p className="text-sm font-semibold text-green-700 mb-2">
                    Donations Received ({donatedResponses.length})
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
        </Card>
    );
}

export default History;
