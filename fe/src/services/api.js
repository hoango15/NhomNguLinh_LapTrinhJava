import axios from "axios"

const API_BASE_URL = "http://localhost:8080/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => api.post("/auth/register", userData),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getPatientStats: () => api.get("/dashboard/patient-stats"),
  getAppointmentStats: () => api.get("/dashboard/appointment-stats"),
}

// Patient API
export const patientAPI = {
  getAll: () => api.get("/patients"),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post("/patients", data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
}
export const arvRegimenAPI = {
  getAll: () => api.get("/arv-regimens"),
  getById: (id) => api.get(`/arv-regimens/${id}`),
  create: (data) => api.post("/arv-regimens", data),
  update: (id, data) => api.put(`/arv-regimens/${id}`, data),
  delete: (id) => api.delete(`/arv-regimens/${id}`),
}


// Appointment API
export const appointmentAPI = {
  getAll: () => api.get("/appointments"),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post("/appointments", data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
}

// Prescription API
export const prescriptionAPI = {
  getAll: () => api.get("/prescriptions"),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post("/prescriptions", data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  getByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
}

// Lab Result API
export const labResultAPI = {
  getAll: () => api.get("/lab-results"),
  getById: (id) => api.get(`/lab-results/${id}`),
  create: (data) => api.post("/lab-results", data),
  update: (id, data) => api.put(`/lab-results/${id}`, data),
  delete: (id) => api.delete(`/lab-results/${id}`),
  getByPatient: (patientId) => api.get(`/lab-results/patient/${patientId}`),
  getByTestType: (testType) => api.get(`/lab-results/test-type/${testType}`),
}

// Notification API
export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post("/notifications", data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/mark-all-read"),
}

// Consultation API
export const consultationAPI = {
  getAll: () => api.get("/consultations"),
  getById: (id) => api.get(`/consultations/${id}`),
  create: (data) => api.post("/consultations", data),
  update: (id, data) => api.put(`/consultations/${id}`, data),
  delete: (id) => api.delete(`/consultations/${id}`),
  getByPatient: (patientId) => api.get(`/consultations/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/consultations/doctor/${doctorId}`),
}

// Report API
export const reportAPI = {
  getPatientReport: (patientId, startDate, endDate) =>
    api.get(`/reports/patient/${patientId}?startDate=${startDate}&endDate=${endDate}`),
  getTreatmentReport: (startDate, endDate) => api.get(`/reports/treatment?startDate=${startDate}&endDate=${endDate}`),
  getMedicationAdherenceReport: (patientId, startDate, endDate) =>
    api.get(`/reports/medication-adherence/${patientId}?startDate=${startDate}&endDate=${endDate}`),
  getLabResultTrends: (patientId, testType, startDate, endDate) =>
    api.get(`/reports/lab-trends/${patientId}?testType=${testType}&startDate=${startDate}&endDate=${endDate}`),
  exportPatientReport: (patientId, format) =>
    api.get(`/reports/export/patient/${patientId}?format=${format}`, { responseType: "blob" }),
}

// Educational Content API
export const educationalContentAPI = {
  getAll: () => api.get("/educational-content"),
  getById: (id) => api.get(`/educational-content/${id}`),
  create: (data) => api.post("/educational-content", data),
  update: (id, data) => api.put(`/educational-content/${id}`, data),
  delete: (id) => api.delete(`/educational-content/${id}`),
  getByCategory: (category) => api.get(`/educational-content/category/${category}`),
  getPublished: () => api.get("/educational-content/published"),
}

// Medication Adherence API
export const medicationAdherenceAPI = {
  getAll: () => api.get("/medication-adherence"),
  getById: (id) => api.get(`/medication-adherence/${id}`),
  create: (data) => api.post("/medication-adherence", data),
  update: (id, data) => api.put(`/medication-adherence/${id}`, data),
  delete: (id) => api.delete(`/medication-adherence/${id}`),
  getByPatient: (patientId) => api.get(`/medication-adherence/patient/${patientId}`),
  recordAdherence: (data) => api.post("/medication-adherence/record", data),
}

// Admin API
export const adminAPI = {
  getSystemStats: () => api.get("/admin/system-stats"),
  getUserStats: () => api.get("/admin/user-stats"),
  getUsers: () => api.get("/admin/users"),
  createUser: (data) => api.post("/admin/users", data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetPassword: (userId) => api.post(`/admin/users/${userId}/reset-password`),
}

// Medication Reminder API
export const medicationReminderAPI = {
  getAll: () => api.get("/medication-reminders"),
  getById: (id) => api.get(`/medication-reminders/${id}`),
  create: (data) => api.post("/medication-reminders", data),
  update: (id, data) => api.put(`/medication-reminders/${id}`, data),
  delete: (id) => api.delete(`/medication-reminders/${id}`),
  getByPatient: (patientId) => api.get(`/medication-reminders/patient/${patientId}`),
  markAsTaken: (id) => api.put(`/medication-reminders/${id}/taken`),
}

// Side Effect API
export const sideEffectAPI = {
  getAll: () => api.get("/side-effects"),
  getById: (id) => api.get(`/side-effects/${id}`),
  create: (data) => api.post("/side-effects", data),
  update: (id, data) => api.put(`/side-effects/${id}`, data),
  delete: (id) => api.delete(`/side-effects/${id}`),
  getByPatient: (patientId) => api.get(`/side-effects/patient/${patientId}`),
  getByMedication: (medicationId) => api.get(`/side-effects/medication/${medicationId}`),
}

// Vital Signs API
export const vitalSignsAPI = {
  getAll: () => api.get("/vital-signs"),
  getById: (id) => api.get(`/vital-signs/${id}`),
  create: (data) => api.post("/vital-signs", data),
  update: (id, data) => api.put(`/vital-signs/${id}`, data),
  delete: (id) => api.delete(`/vital-signs/${id}`),
  getByPatient: (patientId) => api.get(`/vital-signs/patient/${patientId}`),
}

// Treatment Plan API
export const treatmentPlanAPI = {
  getAll: () => api.get("/treatment-plans"),
  getById: (id) => api.get(`/treatment-plans/${id}`),
  create: (data) => api.post("/treatment-plans", data),
  update: (id, data) => api.put(`/treatment-plans/${id}`, data),
  delete: (id) => api.delete(`/treatment-plans/${id}`),
  getByPatient: (patientId) => api.get(`/treatment-plans/patient/${patientId}`),
  getActive: (patientId) => api.get(`/treatment-plans/patient/${patientId}/active`),
}

// Medication API
export const medicationAPI = {
  getAll: () => api.get("/medications"),
  getById: (id) => api.get(`/medications/${id}`),
  create: (data) => api.post("/medications", data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
}

export default api
