import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRequestById, createRequest, updateRequest } from "../services/api.js";
import { toast } from "react-toastify";
import {
  FaAmbulance, FaUser, FaTint, FaHospital, FaMapMarkerAlt,
  FaPhone, FaBed, FaStickyNote, FaExclamationTriangle, FaArrowRight
} from "react-icons/fa";
import { Input, Textarea, Select } from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import LocationPicker from "../components/LocationPicker.jsx";

function RequestForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    unitsRequired: 1,
    hospital: "",
    hospitalAddress: "",
    bedNumber: "",
    city: "",
    contactNumber: "",
    urgency: "Medium",
    isSOS: false,
    notes: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    if (mode === "edit" && id) {
      getRequestById(id)
        .then((res) => {
          setFormData(res.data);
        })
        .catch(() => {
          toast.error("Failed to load request");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mode, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        userId: user?.id,
        status: "Open",
        createdAt: new Date().toISOString().split("T")[0],
        urgency: formData.isSOS ? "High" : formData.urgency,
      };

      if (mode === "create") {
        const res = await createRequest(data);
        toast.success(formData.isSOS ? "SOS Request Raised!" : "Request created successfully!");

        // Trigger Alert
        try {
          await fetch("http://localhost:5001/send-sos-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestData: { ...formData, id: res.data.id } }),
          });
          toast.success("Alert sent to nearby eligible donors!");
        } catch (err) {
          console.error("Failed to send alert", err);
        }
      } else {
        await updateRequest(id, data);
        toast.success("Request updated successfully!");
      }
      navigate("/receiver/dashboard");
      navigate("/receiver/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error("Duplicate request! You already have an open request with these details.");
      } else {
        toast.error("Failed to save request");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-600">Loading request...</p>
        </div>
      </div>
    );
  }

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = ["Low", "Medium", "High"];

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4">
            {mode === "create" ? "New Request" : "Edit Request"}
          </Badge>
          <h1 className="text-4xl font-black text-neutral-900 mb-3">
            {mode === "create" ? "Create Blood Request" : "Edit Blood Request"}
          </h1>
          <p className="text-lg text-neutral-600">
            Fill in the details below to connect with nearby donors
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* SOS Toggle */}
            <div className={`p-6 rounded-2xl border-2 transition-all ${formData.isSOS
              ? 'bg-red-50 border-red-300 shadow-lg shadow-red-100'
              : 'bg-neutral-50 border-neutral-200'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.isSOS ? 'bg-red-600 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                    <FaAmbulance className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Emergency SOS</h3>
                    <p className="text-sm text-neutral-600">
                      Notify all nearby donors within 100km instantly
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isSOS"
                    checked={formData.isSOS}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>

            {/* Patient Information */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <FaUser className="text-red-600" />
                Patient Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  name="patientName"
                  label="Patient Name"
                  placeholder="John Doe"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  leftIcon={<FaUser />}
                />
                <Select
                  name="bloodGroup"
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  options={bloodGroups.map(bg => ({ value: bg, label: bg }))}
                  placeholder="Select Blood Group"
                  required
                />
                <Input
                  name="unitsRequired"
                  type="number"
                  label="Units Required"
                  placeholder="1"
                  value={formData.unitsRequired}
                  onChange={handleChange}
                  min="1"
                  required
                  leftIcon={<FaTint />}
                />
                <Input
                  name="contactNumber"
                  type="tel"
                  label="Contact Number"
                  placeholder="+1234567890"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  leftIcon={<FaPhone />}
                />
              </div>
            </div>

            {/* Hospital Information */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <FaHospital className="text-red-600" />
                Hospital Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  name="hospital"
                  label="Hospital Name"
                  placeholder="City General Hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  required
                  leftIcon={<FaHospital />}
                />
                <Input
                  name="city"
                  label="City"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  leftIcon={<FaMapMarkerAlt />}
                />
                <div className="md:col-span-2">
                  <Input
                    name="hospitalAddress"
                    label="Hospital Address"
                    placeholder="123 Main St, City"
                    value={formData.hospitalAddress}
                    onChange={handleChange}
                    required
                    leftIcon={<FaMapMarkerAlt />}
                  />
                </div>
                <Input
                  name="bedNumber"
                  label="Bed/Ward Number"
                  placeholder="ICU-101"
                  value={formData.bedNumber}
                  onChange={handleChange}
                  leftIcon={<FaBed />}
                />
                {!formData.isSOS && (
                  <Select
                    name="urgency"
                    label="Urgency Level"
                    value={formData.urgency}
                    onChange={handleChange}
                    options={urgencyLevels.map(level => ({ value: level, label: level }))}
                  />
                )}
              </div>
            </div>

            {/* Location Picker */}
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-600" />
                Hospital Location
              </h3>
              <div className="rounded-2xl overflow-hidden border-2 border-neutral-200">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  address={formData.hospitalAddress}
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                />
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Click on the map to set the hospital location for accurate donor matching
              </p>
            </div>

            {/* Additional Notes */}
            <div>
              <Textarea
                name="notes"
                label="Additional Notes"
                placeholder="Any additional information or special requirements..."
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                leftIcon={<FaStickyNote />}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/receiver/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={submitting}
                disabled={submitting}
                rightIcon={<FaArrowRight />}
              >
                {mode === "create"
                  ? (formData.isSOS ? "Raise SOS Alert" : "Create Request")
                  : "Update Request"
                }
              </Button>
            </div>

            {/* Warning for SOS */}
            {formData.isSOS && (
              <div className="alert-warning">
                <FaExclamationTriangle className="text-xl" />
                <div>
                  <p className="font-semibold">Emergency SOS Alert</p>
                  <p className="text-sm">
                    This will immediately notify all eligible donors within 100km. Use only for genuine emergencies.
                  </p>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

export default RequestForm;
