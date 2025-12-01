import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDonors, deleteDonor } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { toast } from "react-toastify";
import { exportDonorPdf } from "../utils/pdfExporter.js";

const bloodColors = {
  "A+": "bg-red-100 text-red-700",
  "A-": "bg-red-100 text-red-700",
  "B+": "bg-purple-100 text-purple-700",
  "B-": "bg-purple-100 text-purple-700",
  "AB+": "bg-amber-100 text-amber-700",
  "AB-": "bg-amber-100 text-amber-700",
  "O+": "bg-green-100 text-green-700",
  "O-": "bg-green-100 text-green-700",
};

function DonorList() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await getDonors();
      setDonors(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;
    try {
      await deleteDonor(id);
      toast.success("Donor deleted");
      fetchDonors();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete donor");
    }
  };

  const handleExportPdf = (donor) => {
    exportDonorPdf(donor);
  };

  const filtered = donors.filter((d) => {
    const matchGroup = filterGroup ? d.bloodGroup === filterGroup : true;
    const matchCity = searchCity
      ? d.city?.toLowerCase().includes(searchCity.toLowerCase())
      : true;
    return matchGroup && matchCity;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Donor Directory
        </h1>
        <Link to="/donors/new" className="btn-primary">
          + Add Donor
        </Link>
      </div>

      <div className="card flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">
            Filter by blood group
          </label>
          <select
            className="input"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">All</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">
            Search by city
          </label>
          <input
            className="input"
            placeholder="e.g., Hyderabad"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-300">
              No donors found. Try changing filters.
            </div>
          )}
          {filtered.map((donor) => (
            <div
              key={donor.id}
              className="card space-y-2 hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {donor.name}{" "}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({donor.gender}, {donor.age})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {donor.city} • {donor.phone}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                    bloodColors[donor.bloodGroup] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {donor.bloodGroup}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  Last donation:{" "}
                  <span className="font-semibold">
                    {donor.lastDonationDate || "N/A"}
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-semibold ${
                    donor.availabilityStatus === "Available"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {donor.availabilityStatus}
                </span>
              </div>

              {donor.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {donor.notes}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => handleExportPdf(donor)}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  PDF
                </button>
                <Link
                  to={`/donors/${donor.id}/edit`}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(donor.id)}
                  className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DonorList;
