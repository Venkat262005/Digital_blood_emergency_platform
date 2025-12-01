import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ebp_auth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("ebp_auth_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) throw new Error("Email and password required");

    // Fetch users from mock DB
    const res = await fetch("https://digital-blood-emergency-platform.onrender.com/users");
    const users = await res.json();

    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid credentials");

    const userData = { ...found };
    delete userData.password; // Don't store password in state

    setUser(userData);
    localStorage.setItem("ebp_auth_user", JSON.stringify(userData));
    return userData;
  };

  const signup = async (data) => {
    // Check if email exists
    const res = await fetch("https://digital-blood-emergency-platform.onrender.com/users");
    const users = await res.json();
    if (users.find(u => u.email === data.email)) {
      throw new Error("Email already exists");
    }

    // Create user
    const newUser = {
      ...data,
      id: String(Date.now()) // Simple ID generation
    };

    await fetch("https://digital-blood-emergency-platform.onrender.com/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    // If donor, create donor profile entry
    if (data.role === "donor") {
      const donorProfile = {
        userId: newUser.id,
        name: data.name,
        bloodGroup: data.bloodGroup || "",
        phone: data.phone || "",
        city: data.city || "",
        gender: data.gender || "",
        availabilityStatus: "Available",
        eligibilityStatus: "Eligible",
        lastDonationDate: "",
        notes: ""
      };
      const donorRes = await fetch("https://digital-blood-emergency-platform.onrender.com/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorProfile)
      });
      const donorData = await donorRes.json();

      // Check for missed SOS notifications
      try {
        await fetch("https://digital-blood-emergency-platform.onrender.com/check-missed-notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ donorId: donorData.id })
        });
      } catch (err) {
        console.error("Failed to check for missed notifications:", err);
      }
    }

    const userData = { ...newUser };
    delete userData.password;

    setUser(userData);
    localStorage.setItem("ebp_auth_user", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ebp_auth_user");
  };

  const updateUserProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("ebp_auth_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
