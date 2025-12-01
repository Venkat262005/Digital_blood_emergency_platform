import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import RequestForm from "./pages/RequestForm.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import DonorDashboard from "./pages/donor/DonorDashboard.jsx";
import DonationHistory from "./pages/donor/DonationHistory.jsx";
import PointsHistory from "./pages/donor/PointsHistory.jsx";
import ReceiverDashboard from "./pages/receiver/ReceiverDashboard.jsx";

import History from "./pages/receiver/History.jsx";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Donor Routes */}
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/donation-history" element={<DonationHistory />} />
          <Route path="/donor/points-history" element={<PointsHistory />} />

          {/* Receiver Routes */}
          <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
          <Route path="/requests/new" element={<RequestForm mode="create" />} />
          <Route path="/requests/:id/edit" element={<RequestForm mode="edit" />} />
          <Route path="/history" element={<History />} />

          {/* Public */}


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="w-full bg-neutral-900 text-white py-6 mt-auto">
        <div className="container-custom text-center">
          <p className="text-sm text-neutral-400">
            © {new Date().getFullYear()} BloodLink. All rights reserved. Saving lives, one donation at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
