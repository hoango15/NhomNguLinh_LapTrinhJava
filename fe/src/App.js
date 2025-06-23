"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import HomePage from "./components/Home/HomePage"
import Login from "./components/Auth/Login"
import Dashboard from "./components/Dashboard/Dashboard"
import PatientList from "./components/Patient/PatientList"
import PatientDetail from "./components/Patient/PatientDetail"
import AppointmentList from "./components/Appointment/AppointmentList"
import PrescriptionList from "./components/Prescription/PrescriptionList"
import LabResultList from "./components/LabResult/LabResultList"
import Layout from "./components/Layout/Layout"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import "./App.css"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<PatientList />} />
                  <Route path="/patients/:id" element={<PatientDetail />} />
                  <Route path="/appointments" element={<AppointmentList />} />
                  <Route path="/prescriptions" element={<PrescriptionList />} />
                  <Route path="/lab-results" element={<LabResultList />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
