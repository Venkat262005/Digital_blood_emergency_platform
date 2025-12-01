import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRequests, deleteRequest } from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { toast } from "react-toastify";
import { exportRequestPdf } from "../utils/pdfExporter.js";

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await deleteRequest(id);
      toast.success("Request deleted");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete request");
    }
  };

  const handleExportPdf = (req) => {
    exportRequestPdf(req);
  };

  const filtered = requests.filter((r) =>
    statusFilter ? r.status === statusFilter : true
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Emergency Blood Requests
        </h1>
        <Link to="/requests/new" className="btn-primary">
          + New Request
        </Link>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-300 mb-1">
            Filter by status
          </label>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option>Open</option>
            <option>Matched</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-300">
              No requests found. Try changing filters.
            </div>
          )}
          {filtered.map((req) => (
            <div
              key={req.id}
              className="card space-y-2 hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {req.patientName}{" "}
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({req.bloodGroup})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {req.hospital} • {req.city}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Contact: {req.contactNumber}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span
                    className={`block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      req.urgency === "High"
                        ? "bg-red-100 text-red-700"
                        : req.urgency === "Medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {req.urgency} urgency
                  </span>
                  <span
                    className={`block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      req.status === "Open"
                        ? "bg-blue-100 text-blue-700"
                        : req.status === "Matched"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Units required: {req.unitsRequired}</span>
                <span>Created: {req.createdAt}</span>
              </div>

              {req.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {req.notes}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => handleExportPdf(req)}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  PDF
                </button>
                <Link
                  to={`/requests/${req.id}/edit`}
                  className="text-xs px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(req.id)}
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

export default RequestList;
