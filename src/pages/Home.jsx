import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserPlus, FaSearch, FaAmbulance } from "react-icons/fa";
import { getDonors, getRequests } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { motion } from "framer-motion";

function Home() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, rRes] = await Promise.all([getDonors(), getRequests()]);
        setDonors(dRes.data);
        setRequests(rRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalDonors = donors.length;
  const availableDonors = donors.filter(
    (d) => d.availabilityStatus === "Available"
  ).length;

  const totalRequests = requests.length;
  const openRequests = requests.filter((r) => r.status === "Open").length;
  const matchedRequests = requests.filter((r) => r.status === "Matched").length;
  const closedRequests = requests.filter((r) => r.status === "Closed").length;

  const bloodCounts = donors.reduce((acc, d) => {
    if (!d.bloodGroup) return acc;
    acc[d.bloodGroup] = (acc[d.bloodGroup] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <motion.section
        className="card flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-red-50 via-white to-red-100"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex-1 space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Digital Platform for{" "}
            <span className="text-primary">Emergency Blood Donation</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            Quickly connect patients in emergency situations with nearby blood
            donors. Maintain a donor directory, manage blood requests, and track
            status using a simple, fast, and responsive web application.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link to="/requests/new" className="btn-primary">
              <FaAmbulance className="mr-2" />
              Raise Emergency Request
            </Link>
            <Link
              to="/donors/new"
              className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-red-50 transition"
            >
              <FaUserPlus className="mr-2" />
              Register as Donor
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <motion.div
            className="w-52 h-52 rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-red-100 flex items-center justify-center text-primary text-6xl shadow-lg shadow-red-200/50"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaSearch />
          </motion.div>
        </div>
      </motion.section>

      {loading ? (
        <Loader />
      ) : (
        <>
          <section className="grid md:grid-cols-4 gap-4">
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Donors
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {totalDonors}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {availableDonors} currently available
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Requests
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {totalRequests}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {openRequests} open • {matchedRequests} matched
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Closed Requests
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {closedRequests}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Completed / no longer active
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Unique Blood Groups
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {Object.keys(bloodCounts).length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Coverage across donor base
              </div>
            </motion.div>
          </section>

          <section className="grid md:grid-cols-3 gap-4">
            <div className="card">
              <h2 className="text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100">
                Manage Donors
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                Store donor details with blood group, location, and availability.
                Export individual donor records as PDF.
              </p>
              <Link
                to="/donors"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all donors →
              </Link>
            </div>
            <div className="card">
              <h2 className="text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100">
                Track Requests
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                Create and manage emergency blood requests with status, urgency,
                and units required. Export request details as PDF.
              </p>
              <Link
                to="/requests"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all requests →
              </Link>
            </div>
            <div className="card">
              <h2 className="text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100">
                Tech Stack Overview
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                React + Vite, Tailwind CSS, Axios, React Router DOM, JSON-Server,
                React Toastify, and jsPDF for PDF exports — ideal for a modern
                full-stack mini project.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
