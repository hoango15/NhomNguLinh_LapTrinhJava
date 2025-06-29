"use client"

import { useState, useEffect } from "react"
import { patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import PatientForm from "./PatientForm"
import "./PatientList.css"

const PatientList = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách bệnh nhân")
      console.error("Fetch patients error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bệnh nhân này?")) {
      try {
        await patientAPI.delete(id)
        toast.success("Xóa bệnh nhân thành công")
        fetchPatients()
      } catch (error) {
        toast.error("Không thể xóa bệnh nhân")
      }
    }
  }

  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPatient(null)
    fetchPatients()
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber?.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || patient.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="patient-list">
      <div className="page-header">
        <h1 className="page-title">Quản lý Bệnh nhân</h1>
        {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm bệnh nhân
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang điều trị</option>
          <option value="INACTIVE">Ngừng điều trị</option>
          <option value="TRANSFERRED">Chuyển viện</option>
        </select>
      </div>

      <div className="patients-grid">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="patient-card">
            <div className="patient-header">
              <h3 className="patient-name">{patient.fullName}</h3>
              <span className={`status-badge ${patient.status?.toLowerCase()}`}>
                {patient.status === "ACTIVE"
                  ? "Đang điều trị"
                  : patient.status === "INACTIVE"
                    ? "Ngừng điều trị"
                    : "Chuyển viện"}
              </span>
            </div>

            <div className="patient-info">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{patient.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Điện thoại:</span>
                <span className="info-value">{patient.phoneNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày sinh:</span>
                <span className="info-value">
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Giới tính:</span>
                <span className="info-value">
                  {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày chẩn đoán:</span>
                <span className="info-value">
                  {patient.diagnosisDate ? new Date(patient.diagnosisDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
            </div>

            <div className="patient-actions">
              <button className="btn btn-outline" onClick={() => (window.location.href = `/patients/${patient.id}`)}>
                Chi tiết
              </button>
              {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
                <>
                  <button className="btn btn-secondary" onClick={() => handleEdit(patient)}>
                    Sửa
                  </button>
                  {user?.role === "ADMIN" && (
                    <button className="btn btn-danger" onClick={() => handleDelete(patient.id)}>
                      Xóa
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="empty-state">
          <p>Không tìm thấy bệnh nhân nào</p>
        </div>
      )}

      {showForm && <PatientForm patient={editingPatient} onClose={handleFormClose} />}
    </div>
  )
}

export default PatientList
