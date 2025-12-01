import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaHome, FaMapMarkedAlt, FaUser, FaClipboardList,
    FaUserPlus, FaHistory, FaHospital, FaClinicMedical,
    FaLanguage, FaInfoCircle, FaShieldAlt, FaStar, FaBell, FaTimes,
    FaHandHoldingHeart, FaTint, FaHeartbeat, FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { icon: FaHome, label: 'Home', path: '/' },
        {
            icon: FaMapMarkedAlt,
            label: user?.role === 'donor' ? 'Dashboard' : 'Find Donors',
            path: user?.role === 'receiver' ? '/receiver/dashboard' : '/donor/dashboard'
        },
        { icon: FaClipboardList, label: 'Requests', path: '/requests/new', roles: ['receiver'] },
        { icon: FaHistory, label: 'My History', path: user?.role === 'donor' ? '/donor/dashboard' : '/receiver/dashboard' },
        { icon: FaHospital, label: 'Hospitals', path: '#' },
        { icon: FaInfoCircle, label: 'About Us', path: '#' },
        { icon: FaShieldAlt, label: 'Privacy Policy', path: '#' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
        onClose();
    };

    // Filter menu items based on user role
    const filteredMenuItems = menuItems.filter(item =>
        !item.roles || item.roles.includes(user?.role)
    );

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            ></div>

            {/* Sidebar Drawer */}
            <div className={`fixed top-0 left-0 h-full w-[280px] bg-gradient-to-b from-red-600 to-red-700 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>

                {/* Header Section */}
                <div className="relative h-56 bg-white rounded-b-[60%] flex flex-col items-center justify-center pt-6 pb-10 mb-2 shadow-lg">
                    {/* Logo Icons */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="relative">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center border-2 border-red-200 shadow-md">
                                <FaHandHoldingHeart className="text-red-600 text-2xl" />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center border-2 border-red-700 shadow-md">
                                <FaTint className="text-white text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Brand Name */}
                    <h1 className="text-3xl font-black text-red-600 tracking-tight mb-1">
                        Blood<span className="text-red-700">Link</span>
                    </h1>
                    <p className="text-xs text-slate-600 font-semibold tracking-wide">Save lives together</p>

                    {/* User Info */}
                    {user && (
                        <div className="mt-3 px-4 py-2 bg-red-50 rounded-full">
                            <p className="text-xs font-bold text-red-700 capitalize">{user.role}</p>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 shadow-sm"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="px-3 pb-20 overflow-y-auto h-[calc(100%-14rem)] custom-scrollbar">
                    <ul className="space-y-0.5">
                        {filteredMenuItems.map((item, index) => (
                            <li key={index}>
                                <NavLink
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-white text-red-600 font-bold shadow-md'
                                            : 'text-white hover:bg-white/15 hover:translate-x-1'
                                        }`
                                    }
                                >
                                    <item.icon className="text-lg flex-shrink-0" />
                                    <span className="text-[15px] font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}

                        {/* Logout Option */}
                        {user && (
                            <li className="pt-2 mt-2 border-t border-white/20">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-white hover:bg-white/15 hover:translate-x-1 transition-all duration-200"
                                >
                                    <FaSignOutAlt className="text-lg flex-shrink-0" />
                                    <span className="text-[15px] font-medium">Logout</span>
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
