"use client"

import { useState, useEffect } from "react"
import { vitalSignsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./VitalSignsForm.css"

const VitalSignsForm = ({ vitalSign, onClose }) => {
  const [formData, setFormData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    oxygenSaturation: "",
    recordedAt: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (vitalSign) {
      setFormData({
        bloodPressureSystolic: vitalSign.bloodPressureSystolic || "",
        bloodPressureDiastolic: vitalSign.bloodPressureDiastolic || "",
        heartRate: vitalSign.heartRate || "",
        temperature: vitalSign.temperature || "",
        weight: vitalSign.weight || "",
        height: vitalSign.height || "",
        oxygenSaturation: vitalSign.oxygenSaturation || "",
        recordedAt: vitalSign.recordedAt ? new Date(vitalSign.recordedAt).toISOString().slice(0, 16) : "",
        notes: vitalSign.notes || "",
      })
    } else {
      // Set default time to now
      setFormData((prev) => ({
        ...prev,
        recordedAt: new Date().toISOString().slice(0, 16),
      }))
    }
  }, [vitalSign])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        patientId: user.id,
        recordedAt: new Date(formData.recordedAt).toISOString(),
        // Convert string values to numbers where needed
        bloodPressureSystolic: formData.bloodPressureSystolic
          ? Number.parseFloat(formData.bloodPressureSystolic)
          : null,
        bloodPressureDiastolic: formData.bloodPressureDiastolic
          ? Number.parseFloat(formData.bloodPressureDiastolic)
          : null,
        heartRate: formData.heartRate ? Number.parseFloat(formData.heartRate) : null,
        temperature: formData.temperature ? Number.parseFloat(formData.temperature) : null,
        weight: formData.weight ? Number.parseFloat(formData.weight) : null,
        height: formData.height ? Number.parseFloat(formData.height) : null,
        oxygenSaturation: formData.oxygenSaturation ? Number.parseFloat(formData.oxygenSaturation) : null,
      }

      if (vitalSign) {
        await vitalSignsAPI.update(vitalSign.id, submitData)
        toast.success("Cập nhật dấu hiệu sinh tồn thành công")
      } else {
        await vitalSignsAPI.create(submitData)
        toast.success("Thêm dấu hiệu sinh tồn thành công")
      }
      onClose()
    } catch (error) {
      toast.error(vitalSign ? "Không thể cập nhật" : "Không thể thêm dấu hiệu sinh tồn")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getVitalSignStatus = (type, value) => {
    if (!value) return ""

    const ranges = {
      bloodPressureSystolic: { normal: [90, 140], unit: "mmHg" },
      bloodPressureDiastolic: { normal: [60, 90], unit: "mmHg" },
      heartRate: { normal: [60, 100], unit: "bpm" },
      temperature: { normal: [36.1, 37.2], unit: "°C" },
      oxygenSaturation: { normal: [95, 100], unit: "%" },
    }

    const range = ranges[type]
    if (!range) return ""

    const numValue = Number.parseFloat(value)
    if (numValue < range.normal[0]) return "low"
    if (numValue > range.normal[1]) return "high"
    return "normal"
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{vitalSign ? "Sửa dấu hiệu sinh tồn" : "Thêm dấu hiệu sinh tồn"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vital-signs-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-group">
              <label htmlFor="recordedAt">Thời gian đo *</label>
              <input
                type="datetime-local"
                id="recordedAt"
                name="recordedAt"
                value={formData.recordedAt}
                onChange={handleChange}
                required
                max={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Dấu hiệu sinh tồn</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bloodPressureSystolic">
                  Huyết áp tâm thu (mmHg)
                  {formData.bloodPressureSystolic && (
                    <span
                      className={`status-indicator ${getVitalSignStatus("bloodPressureSystolic", formData.bloodPressureSystolic)}`}
                    >
                      {getVitalSignStatus("bloodPressureSystolic", formData.bloodPressureSystolic) === "normal"
                        ? "✓"
                        : getVitalSignStatus("bloodPressureSystolic", formData.bloodPressureSystolic) === "high"
                          ? "↑"
                          : "↓"}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="bloodPressureSystolic"
                  name="bloodPressureSystolic"
                  value={formData.bloodPressureSystolic}
                  onChange={handleChange}
                  min="50"
                  max="300"
                  step="1"
                  placeholder="120"
                />
                <small className="form-help">Bình thường: 90-140 mmHg</small>
              </div>

              <div className="form-group">
                <label htmlFor="bloodPressureDiastolic">
                  Huyết áp tâm trương (mmHg)
                  {formData.bloodPressureDiastolic && (
                    <span
                      className={`status-indicator ${getVitalSignStatus("bloodPressureDiastolic", formData.bloodPressureDiastolic)}`}
                    >
                      {getVitalSignStatus("bloodPressureDiastolic", formData.bloodPressureDiastolic) === "normal"
                        ? "✓"
                        : getVitalSignStatus("bloodPressureDiastolic", formData.bloodPressureDiastolic) === "high"
                          ? "↑"
                          : "↓"}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="bloodPressureDiastolic"
                  name="bloodPressureDiastolic"
                  value={formData.bloodPressureDiastolic}
                  onChange={handleChange}
                  min="30"
                  max="200"
                  step="1"
                  placeholder="80"
                />
                <small className="form-help">Bình thường: 60-90 mmHg</small>
              </div>

              <div className="form-group">
                <label htmlFor="heartRate">
                  Nhịp tim (bpm)
                  {formData.heartRate && (
                    <span className={`status-indicator ${getVitalSignStatus("heartRate", formData.heartRate)}`}>
                      {getVitalSignStatus("heartRate", formData.heartRate) === "normal"
                        ? "✓"
                        : getVitalSignStatus("heartRate", formData.heartRate) === "high"
                          ? "↑"
                          : "↓"}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="heartRate"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  min="30"
                  max="200"
                  step="1"
                  placeholder="72"
                />
                <small className="form-help">Bình thường: 60-100 bpm</small>
              </div>

              <div className="form-group">
                <label htmlFor="temperature">
                  Nhiệt độ (°C)
                  {formData.temperature && (
                    <span className={`status-indicator ${getVitalSignStatus("temperature", formData.temperature)}`}>
                      {getVitalSignStatus("temperature", formData.temperature) === "normal"
                        ? "✓"
                        : getVitalSignStatus("temperature", formData.temperature) === "high"
                          ? "↑"
                          : "↓"}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  min="30"
                  max="45"
                  step="0.1"
                  placeholder="36.5"
                />
                <small className="form-help">Bình thường: 36.1-37.2°C</small>
              </div>

              <div className="form-group">
                <label htmlFor="weight">Cân nặng (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="20"
                  max="300"
                  step="0.1"
                  placeholder="65.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="height">Chiều cao (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  min="100"
                  max="250"
                  step="0.1"
                  placeholder="170"
                />
              </div>

              <div className="form-group">
                <label htmlFor="oxygenSaturation">
                  SpO2 (%)
                  {formData.oxygenSaturation && (
                    <span
                      className={`status-indicator ${getVitalSignStatus("oxygenSaturation", formData.oxygenSaturation)}`}
                    >
                      {getVitalSignStatus("oxygenSaturation", formData.oxygenSaturation) === "normal" ? "✓" : "↓"}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  id="oxygenSaturation"
                  name="oxygenSaturation"
                  value={formData.oxygenSaturation}
                  onChange={handleChange}
                  min="70"
                  max="100"
                  step="1"
                  placeholder="98"
                />
                <small className="form-help">Bình thường: 95-100%</small>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Ghi chú thêm về tình trạng sức khỏe, triệu chứng..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : vitalSign ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VitalSignsForm
