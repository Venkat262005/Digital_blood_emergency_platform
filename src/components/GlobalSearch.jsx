import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { getDonors, getRequests } from "../services/api.js";
import { toast } from "react-toastify";

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ donors: [], requests: [] });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setOpen(true);
    try {
      const [donorRes, reqRes] = await Promise.all([getDonors(), getRequests()]);
      const q = query.trim().toLowerCase();
      const donors = donorRes.data.filter((d) => {
        return (
          d.name?.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q) ||
          d.bloodGroup?.toLowerCase().includes(q)
        );
      });
      const requests = reqRes.data.filter((r) => {
        return (
          r.patientName?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q) ||
          r.bloodGroup?.toLowerCase().includes(q) ||
          r.hospital?.toLowerCase().includes(q)
        );
      });
      setResults({ donors, requests });
    } catch (err) {
      console.error(err);
      toast.error("Global search failed");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center gap-1">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            <FaSearch />
          </span>
          <input
            className="input pl-7 pr-2 py-1 text-xs w-40 sm:w-52"
            placeholder="Search donor / request"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setOpen(true)}
          />
        </div>
        <button
          type="submit"
          className="hidden sm:inline-flex text-[11px] px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Go
        </button>
      </form>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-80 overflow-auto z-30 card shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Global results for "{query}"
            </span>
            <button
              type="button"
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
              onClick={close}
            >
              Close
            </button>
          </div>

          {loading ? (
            <div className="text-xs text-slate-500">Searching...</div>
          ) : (
            <>
              <div className="mb-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Donors
                </div>
                {results.donors.length === 0 && (
                  <div className="text-[11px] text-slate-400">
                    No donor matches
                  </div>
                )}
                {results.donors.slice(0, 5).map((d) => (
                  <div
                    key={`donor-${d.id}`}
                    className="text-[11px] text-slate-700 dark:text-slate-100 py-1 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <span className="font-semibold">{d.name}</span>{" "}
                    <span className="text-slate-500 dark:text-slate-400">
                      ({d.bloodGroup}) • {d.city}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Requests
                </div>
                {results.requests.length === 0 && (
                  <div className="text-[11px] text-slate-400">
                    No request matches
                  </div>
                )}
                {results.requests.slice(0, 5).map((r) => (
                  <div
                    key={`req-${r.id}`}
                    className="text-[11px] text-slate-700 dark:text-slate-100 py-1 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <span className="font-semibold">{r.patientName}</span>{" "}
                    <span className="text-slate-500 dark:text-slate-400">
                      ({r.bloodGroup}) • {r.hospital} • {r.city}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
