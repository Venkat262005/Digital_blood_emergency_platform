import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
});

// Donors
export const getDonors = () => api.get("/donors");
export const getDonorById = (id) => api.get(`/donors/${id}`);
export const createDonor = (data) => api.post("/donors", data);
export const updateDonor = (id, data) => api.put(`/donors/${id}`, data);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data); // For updating generic user details
export const deleteDonor = (id) => api.delete(`/donors/${id}`);

// Requests
export const getRequests = () => api.get("/requests");
export const getRequestById = (id) => api.get(`/requests/${id}`);
export const createRequest = (data) => api.post("/requests", data);
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data);
export const deleteRequest = (id) => api.delete(`/requests/${id}`);

// Send Donor Request
export const sendDonorRequest = (data) => api.post("/send-donor-request", data);


export default api;
