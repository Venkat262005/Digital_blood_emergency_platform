import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createDonor,
  getDonorById,
  updateDonor,
} from "../services/api.js";
import { toast } from "react-toastify";
import Loader from "../components/Loader.jsx";

const initialState = {
  name: "",
  age: "",
  gender: "Male",
  bloodGroup: "A+",
  phone: "",
  city: "",
  lastDonationDate: "",
  availabilityStatus: "Available",
  notes: "",
};

function DonorForm({ mode }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(mode === "edit");
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = mode === "edit";

  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const res = await getDonorById(id);
        setForm(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load donor");
      } finally {
        setLoading(false);
      }
    };

    if (isEdit && id) {
      fetchDonor();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.city) {
      toast.warn("Name, phone, and city are required");
      return;
    }

    try {
      if (isEdit) {
        await updateDonor(id, form);
        toast.success("Donor updated successfully");
      } else {
        await createDonor(form);
        toast.success("Donor created successfully");
      }
      navigate("/donors");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save donor");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
        {isEdit ? "Edit Donor" : "Add New Donor"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
              Full Name *
            </label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Donor name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
                Age
              </label>
              <input
                type="number"
                className="input"
                name="age"
                value={form.age}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
                Gender
              </label>
              <select
                className="input"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
              Blood Group
            </label>
            <select
              className="input"
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
            >
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
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
              Phone *
            </label>
            <input
              className="input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Contact number"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
              City *
            </label>
            <input
              className="input"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="City / Area"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
              Last Donation Date
            </label>
            <input
              type="date"
              className="input"
              name="lastDonationDate"
              value={form.lastDonationDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
              Availability Status
            </label>
            <select
              className="input"
              name="availabilityStatus"
              value={form.availabilityStatus}
              onChange={handleChange}
            >
              <option>Available</option>
              <option>Not Available</option>
              <option>Temporarily Unavailable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200 mb-1">
            Notes
          </label>
          <textarea
            className="input min-h-[80px]"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any medical conditions, time preferences, etc."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/donors")}
            className="text-xs px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs">
            {isEdit ? "Update Donor" : "Create Donor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DonorForm;
