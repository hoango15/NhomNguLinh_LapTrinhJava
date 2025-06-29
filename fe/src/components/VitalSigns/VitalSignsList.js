"use client"

import { useState, useEffect } from "react"
import { vitalSignsAPI, patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import VitalSignsForm from "./VitalSignsForm"
import VitalSignsChart from "./VitalSignsChart"
import "./VitalSignsList.css"

const VitalSignsList = () => {
  const [vitalSigns, setVitalSigns] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVitalSigns, setEditingVitalSigns] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [viewMode, setViewMode] = useState("list") // list or chart
  const [dateRange, setDateRange] = useState("7") // days
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      let vitalSignsRes
      if (user.role === "PATIENT") {
        vitalSignsRes = await vitalSignsAPI.getByPatient(user.id)
      } else {
        vitalSignsRes = await vitalSignsAPI.getAll()
      }

      const patientsRes = await patientAPI.getAll()

      setVitalSigns(vitalSignsRes.data)
      setPatients(patientsRes.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu dấu hiệu sinh tồn")
      console.error("Fetch vital signs error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      try {
        await vitalSignsAPI.delete(id)
        toast.success("Xóa bản ghi thành công")
        fetchData()
      } catch (error) {
        toast.error("Không thể xóa bản ghi")
      }
    }
  }

  const handleEdit = (vitalSign) => {
    setEditingVitalSigns(vitalSign)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingVitalSigns(null)
    fetchData()
  }

  const getStatusColor = (value, type) => {
    switch (type) {
      case "bloodPressureSystolic":
        if (value < 90) return "low"
        if (value > 140) return "high"
        return "normal"
      case "bloodPressureDiastolic":
        if (value < 60) return "low"
        if (value > 90) return "high"
        return "normal"
      case "heartRate":
        if (value < 60) return "low"
        if (value > 100) return "high"
        return "normal"
      case "temperature":
        if (value < 36) return "low"
        if (value > 37.5) return "high"
        return "normal"
      case "oxygenSaturation":
        if (value < 95) return "low"
        return "normal"
      default:
        return "normal"
    }
  }

  const getFilteredVitalSigns = () => {
    let filtered = vitalSigns

    if (selectedPatient) {
      filtered = filtered.filter((vs) => vs.patientId === Number.parseInt(selectedPatient))
    }

    if (dateRange !== "all") {
      const days = Number.parseInt(dateRange)
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((vs) => new Date(vs.recordedAt) >= cutoffDate)
    }

    return filtered.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
  }

  const filteredVitalSigns = getFilteredVitalSigns()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="vital-signs-list">
      <div className="page-header">
        <h1 className="page-title">Dấu hiệu Sinh tồn</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
              📋 Danh sách
            </button>
            <button
              className={`toggle-btn ${viewMode === "chart" ? "active" : ""}`}
              onClick={() => setViewMode("chart")}
            >
              📊 Biểu đồ
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm bản ghi
          </button>
        </div>
      </div>

      <div className="filters">
        {user.role !== "PATIENT" && (
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả bệnh nhân</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </select>
        )}
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="filter-select">
          <option value="7">7 ngày qua</option>
          <option value="30">30 ngày qua</option>
          <option value="90">3 tháng qua</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      {viewMode === "list" && (
        <div className="vital-signs-grid">
          {filteredVitalSigns.map((vitalSign) => (
            <div key={vitalSign.id} className="vital-sign-card">
              <div className="vital-sign-header">
                <div className="record-info">
                  <h3 className="patient-name">{vitalSign.patientName}</h3>
                  <span className="record-date">{new Date(vitalSign.recordedAt).toLocaleString("vi-VN")}</span>
                </div>
                <div className="record-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(vitalSign)}>
                    Sửa
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vitalSign.id)}>
                    Xóa
                  </button>
                </div>
              </div>

              <div className="vital-signs-grid-display">
                {vitalSign.bloodPressureSystolic && vitalSign.bloodPressureDiastolic && (
                  <div className="vital-item">
                    <div className="vital-label">Huyết áp</div>
                    <div
                      className={`vital-value ${getStatusColor(vitalSign.bloodPressureSystolic, "bloodPressureSystolic")}`}
                    >
                      {vitalSign.bloodPressureSystolic}/{vitalSign.bloodPressureDiastolic} mmHg
                    </div>
                  </div>
                )}

                {vitalSign.heartRate && (
                  <div className="vital-item">
                    <div className="vital-label">Nhịp tim</div>
                    <div className={`vital-value ${getStatusColor(vitalSign.heartRate, "heartRate")}`}>
                      {vitalSign.heartRate} bpm
                    </div>
                  </div>
                )}

                {vitalSign.temperature && (
                  <div className="vital-item">
                    <div className="vital-label">Nhiệt độ</div>
                    <div className={`vital-value ${getStatusColor(vitalSign.temperature, "temperature")}`}>
                      {vitalSign.temperature}°C
                    </div>
                  </div>
                )}

                {vitalSign.respiratoryRate && (
                  <div className="vital-item">
                    <div className="vital-label">Nhịp thở</div>
                    <div className="vital-value normal">{vitalSign.respiratoryRate} /phút</div>
                  </div>
                )}

                {vitalSign.oxygenSaturation && (
                  <div className="vital-item">
                    <div className="vital-label">SpO2</div>
                    <div className={`vital-value ${getStatusColor(vitalSign.oxygenSaturation, "oxygenSaturation")}`}>
                      {vitalSign.oxygenSaturation}%
                    </div>
                  </div>
                )}

                {vitalSign.weight && (
                  <div className="vital-item">
                    <div className="vital-label">Cân nặng</div>
                    <div className="vital-value normal">{vitalSign.weight} kg</div>
                  </div>
                )}

                {vitalSign.height && (
                  <div className="vital-item">
                    <div className="vital-label">Chiều cao</div>
                    <div className="vital-value normal">{vitalSign.height} cm</div>
                  </div>
                )}

                {vitalSign.bmi && (
                  <div className="vital-item">
                    <div className="vital-label">BMI</div>
                    <div className="vital-value normal">{vitalSign.bmi}</div>
                  </div>
                )}
              </div>

              {vitalSign.notes && (
                <div className="vital-notes">
                  <strong>Ghi chú:</strong> {vitalSign.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewMode === "chart" && (
        <VitalSignsChart vitalSigns={filteredVitalSigns} patients={patients} selectedPatient={selectedPatient} />
      )}

      {filteredVitalSigns.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Không có dữ liệu dấu hiệu sinh tồn</h3>
          <p>Thêm bản ghi đầu tiên để bắt đầu theo dõi</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Thêm bản ghi đầu tiên
          </button>
        </div>
      )}

      {showForm && <VitalSignsForm vitalSigns={editingVitalSigns} patients={patients} onClose={handleFormClose} />}
    </div>
  )
}

export default VitalSignsList
