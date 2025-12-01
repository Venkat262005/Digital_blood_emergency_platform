import React, { useState } from 'react';
import { FaUserEdit, FaHistory, FaStar, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

function RightSidebar({ userType, profile, onUpdateProfile, historyItems = [] }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(profile || {});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleSave = async () => {
        try {
            await onUpdateProfile(editData);
            setIsEditing(false);
            // toast.success("Profile updated successfully!"); // Parent handles toast usually, but good to have here if not
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    return (
        <div className="glass-card h-full rounded-3xl p-6 flex flex-col gap-6 sticky top-6">
            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    History
                </button>
                {userType === 'donor' && (
                    <button
                        onClick={() => setActiveTab('points')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'points' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Points
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <FaUserEdit className="text-red-500" /> Personal Details
                            </h3>
                            {!isEditing ? (
                                <button
                                    onClick={() => { setEditData(profile); setIsEditing(true); }}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleSave} className="text-green-600 hover:text-green-700"><FaSave /></button>
                                    <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-600"><FaTimes /></button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="label">Full Name</label>
                                {isEditing ? (
                                    <input name="name" value={editData.name || ''} onChange={handleInputChange} className="input py-2" />
                                ) : (
                                    <p className="font-semibold text-slate-800">{profile?.name || 'N/A'}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">Phone</label>
                                {isEditing ? (
                                    <input name="phone" value={editData.phone || ''} onChange={handleInputChange} className="input py-2" />
                                ) : (
                                    <p className="font-semibold text-slate-800">{profile?.phone || 'N/A'}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">City</label>
                                {isEditing ? (
                                    <input name="city" value={editData.city || ''} onChange={handleInputChange} className="input py-2" />
                                ) : (
                                    <p className="font-semibold text-slate-800">{profile?.city || 'N/A'}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">Address</label>
                                {isEditing ? (
                                    <textarea name="address" value={editData.address || ''} onChange={handleInputChange} className="input py-2" rows="2" />
                                ) : (
                                    <p className="text-sm text-slate-600">{profile?.address || 'N/A'}</p>
                                )}
                            </div>

                            {userType === 'donor' && (
                                <div className="pt-2 border-t border-slate-100">
                                    <label className="label">Blood Group</label>
                                    <p className="text-lg font-black text-red-600">{profile?.bloodGroup}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <FaHistory className="text-red-500" />
                            {userType === 'donor' ? 'Donation History' : 'Request History'}
                        </h3>

                        {historyItems.length === 0 ? (
                            <p className="text-sm text-slate-400 italic text-center py-4">No history found.</p>
                        ) : (
                            <div className="space-y-3">
                                {historyItems.map((item, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                                                <p className="text-xs text-slate-500">{item.date}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === 'Completed' || item.status === 'Donated' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* POINTS TAB (Donor Only) */}
                {activeTab === 'points' && userType === 'donor' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center py-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
                            <p className="text-yellow-800 text-xs font-bold uppercase tracking-wider">Total Points</p>
                            <h2 className="text-4xl font-extrabold text-yellow-600 mt-1">{profile?.points || 0}</h2>
                            <div className="flex justify-center gap-1 mt-2 text-yellow-400 text-sm">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                            </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm mt-4">Points Activity</h3>
                        <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                            {/* Mock Points History - In a real app, this would come from props */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                                <p className="text-sm font-bold text-slate-800">Donation Completed</p>
                                <p className="text-xs text-slate-500">Earned 50 points</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                <p className="text-sm font-bold text-slate-800">Profile Verified</p>
                                <p className="text-xs text-slate-500">Earned 20 points</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                                <p className="text-sm font-bold text-slate-800">Account Created</p>
                                <p className="text-xs text-slate-500">Welcome bonus</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RightSidebar;
