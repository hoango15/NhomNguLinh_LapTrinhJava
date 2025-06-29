"use client"

import { useState, useEffect } from "react"
import { vitalSignsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import VitalSignsForm from "./VitalSignsForm"
import VitalSignsChart from "./VitalSignsChart"
import "./VitalSignsTracker.css"

const VitalSignsTracker = () => {
  const [vitalSigns, setVitalSigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVitalSign, setEditingVitalSign] = useState(null)
  const [viewMode, setViewMode] = useState("list") // list or chart
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchVitalSigns()
  }, [])

  const fetchVitalSigns = async () => {
    try {
      const response = await vitalSignsAPI.getByPatient(user.id)
      setVitalSigns(response.data)
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
        fetchVitalSigns()
      } catch (error) {
        toast.error("Không thể xóa bản ghi")
      }
    }
  }

  const handleEdit = (vitalSign) => {
    setEditingVitalSign(vitalSign)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingVitalSign(null)
    fetchVitalSigns()
  }

  const getLatestVitalSigns = () => {
    if (vitalSigns.length === 0) return null
    return vitalSigns.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))[0]
  }

  const getVitalSignStatus = (type, value) => {
    const ranges = {
      bloodPressureSystolic: { normal: [90, 140], low: [0, 90], high: [140, 300] },
      bloodPressureDiastolic: { normal: [60, 90], low: [0, 60], high: [90, 200] },
      heartRate: { normal: [60, 100], low: [0, 60], high: [100, 200] },
      temperature: { normal: [36.1, 37.2], low: [0, 36.1], high: [37.2, 50] },
      weight: { normal: [40, 150], low: [0, 40], high: [150, 300] },
      height: { normal: [140, 200], low: [0, 140], high: [200, 300] },
    }

    const range = ranges[type]
    if (!range || !value) return "normal"

    if (value < range.normal[0]) return "low"
    if (value > range.normal[1]) return "high"
    return "normal"
  }

  const latestVitalSigns = getLatestVitalSigns()
  const filteredVitalSigns = vitalSigns.filter((vs) => {
    const recordDate = new Date(vs.recordedAt).toISOString().split("T")[0]
    return recordDate >= dateRange.startDate && recordDate <= dateRange.endDate
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="vital-signs-tracker">
      <div className="page-header">
        <h1 className="page-title">Theo dõi Dấu hiệu Sinh tồn</h1>
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

      {latestVitalSigns && (
        <div className="latest-vitals">
          <h2>Dấu hiệu gần nhất</h2>
          <div className="vitals-grid">
            <div className="vital-card">
              <div className="vital-icon">🩸</div>
              <div className="vital-info">
                <div className="vital-label">Huyết áp</div>
                <div className="vital-value">
                  {latestVitalSigns.bloodPressureSystolic}/{latestVitalSigns.bloodPressureDiastolic} mmHg
                </div>
                <div
                  className={`vital-status ${getVitalSignStatus("bloodPressureSystolic", latestVitalSigns.bloodPressureSystolic)}`}
                >
                  {getVitalSignStatus("bloodPressureSystolic", latestVitalSigns.bloodPressureSystolic) === "normal"
                    ? "Bình thường"
                    : getVitalSignStatus("bloodPressureSystolic", latestVitalSigns.bloodPressureSystolic) === "high"
                      ? "Cao"
                      : "Thấp"}
                </div>
              </div>
            </div>

            <div className="vital-card">
              <div className="vital-icon">❤️</div>
              <div className="vital-info">
                <div className="vital-label">Nhịp tim</div>
                <div className="vital-value">{latestVitalSigns.heartRate} bpm</div>
                <div className={`vital-status ${getVitalSignStatus("heartRate", latestVitalSigns.heartRate)}`}>
                  {getVitalSignStatus("heartRate", latestVitalSigns.heartRate) === "normal"
                    ? "Bình thường"
                    : getVitalSignStatus("heartRate", latestVitalSigns.heartRate) === "high"
                      ? "Cao"
                      : "Thấp"}
                </div>
              </div>
            </div>

            <div className="vital-card">
              <div className="vital-icon">🌡️</div>
              <div className="vital-info">
                <div className="vital-label">Nhiệt độ</div>
                <div className="vital-value">{latestVitalSigns.temperature}°C</div>
                <div className={`vital-status ${getVitalSignStatus("temperature", latestVitalSigns.temperature)}`}>
                  {getVitalSignStatus("temperature", latestVitalSigns.temperature) === "normal"
                    ? "Bình thường"
                    : getVitalSignStatus("temperature", latestVitalSigns.temperature) === "high"
                      ? "Sốt"
                      : "Thấp"}
                </div>
              </div>
            </div>

            <div className="vital-card">
              <div className="vital-icon">⚖️</div>
              <div className="vital-info">
                <div className="vital-label">Cân nặng</div>
                <div className="vital-value">{latestVitalSigns.weight} kg</div>
                <div className="vital-status normal">Ghi nhận</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="filters">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
          className="date-input"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
          className="date-input"
        />
      </div>

      {viewMode === "list" && (
        <div className="vital-signs-list">
          {filteredVitalSigns.map((vitalSign) => (
            <div key={vitalSign.id} className="vital-sign-card">
              <div className="vital-sign-header">
                <h3>Bản ghi dấu hiệu sinh tồn</h3>
                <span className="record-date">{new Date(vitalSign.recordedAt).toLocaleDateString("vi-VN")}</span>
              </div>

              <div className="vital-sign-data">
                <div className="data-grid">
                  <div className="data-item">
                    <span className="data-label">Huyết áp:</span>
                    <span className="data-value">
                      {vitalSign.bloodPressureSystolic}/{vitalSign.bloodPressureDiastolic} mmHg
                    </span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Nhịp tim:</span>
                    <span className="data-value">{vitalSign.heartRate} bpm</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Nhiệt độ:</span>
                    <span className="data-value">{vitalSign.temperature}°C</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Cân nặng:</span>
                    <span className="data-value">{vitalSign.weight} kg</span>
                  </div>
                  {vitalSign.height && (
                    <div className="data-item">
                      <span className="data-label">Chiều cao:</span>
                      <span className="data-value">{vitalSign.height} cm</span>
                    </div>
                  )}
                  {vitalSign.oxygenSaturation && (
                    <div className="data-item">
                      <span className="data-label">SpO2:</span>
                      <span className="data-value">{vitalSign.oxygenSaturation}%</span>
                    </div>
                  )}
                </div>

                {vitalSign.notes && (
                  <div className="vital-notes">
                    <strong>Ghi chú:</strong> {vitalSign.notes}
                  </div>
                )}
              </div>

              <div className="vital-sign-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(vitalSign)}>
                  Sửa
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vitalSign.id)}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "chart" && <VitalSignsChart data={filteredVitalSigns} dateRange={dateRange} />}

      {filteredVitalSigns.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Chưa có dữ liệu dấu hiệu sinh tồn</h3>
          <p>Hãy thêm bản ghi đầu tiên để theo dõi sức khỏe của bạn</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Thêm bản ghi đầu tiên
          </button>
        </div>
      )}

      {showForm && <VitalSignsForm vitalSign={editingVitalSign} onClose={handleFormClose} />}
    </div>
  )
}

export default VitalSignsTracker
