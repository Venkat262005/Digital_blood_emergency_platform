import React, { useState } from 'react';
import { FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { Input, Select } from './ui/Input';
import Button from './ui/Button';

function EditProfileModal({ user, donorProfile, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: donorProfile?.phone || user?.phone || '',
        city: donorProfile?.city || user?.city || '',
        gender: donorProfile?.gender || user?.gender || ''
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
                <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between rounded-t-3xl">
                    <div>
                        <h2 className="text-2xl font-black text-neutral-900">Edit Profile</h2>
                        <p className="text-neutral-600">Update your personal information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                    >
                        <FaTimes className="text-neutral-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        name="name"
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        leftIcon={<FaUser />}
                    />

                    <Input
                        name="phone"
                        type="tel"
                        label="Phone Number"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        leftIcon={<FaPhone />}
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

                    <Select
                        name="gender"
                        label="Gender"
                        placeholder="Select"
                        value={formData.gender}
                        onChange={handleChange}
                        options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" }
                        ]}
                        required
                    />

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            loading={saving}
                            rightIcon={<FaCheckCircle />}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfileModal;
