"use client"

import { useState, useEffect } from "react"
import { sideEffectAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./SideEffectForm.css"

const SideEffectForm = ({ sideEffect, medications, onClose }) => {
  const [formData, setFormData] = useState({
    medicationId: "",
    effectName: "",
    severity: "MILD",
    occurredAt: "",
    duration: "",
    description: "",
    actionTaken: "",
    resolved: false,
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (sideEffect) {
      setFormData({
        medicationId: sideEffect.medicationId || "",
        effectName: sideEffect.effectName || "",
        severity: sideEffect.severity || "MILD",
        occurredAt: sideEffect.occurredAt ? new Date(sideEffect.occurredAt).toISOString().slice(0, 16) : "",
        duration: sideEffect.duration || "",
        description: sideEffect.description || "",
        actionTaken: sideEffect.actionTaken || "",
        resolved: sideEffect.resolved || false,
      })
    } else {
      // Set default time to now
      setFormData((prev) => ({
        ...prev,
        occurredAt: new Date().toISOString().slice(0, 16),
      }))
    }
  }, [sideEffect])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        patientId: user.id,
        occurredAt: new Date(formData.occurredAt).toISOString(),
      }

      if (sideEffect) {
        await sideEffectAPI.update(sideEffect.id, submitData)
        toast.success("Cập nhật tác dụng phụ thành công")
      } else {
        await sideEffectAPI.create(submitData)
        toast.success("Ghi nhận tác dụng phụ thành công")
      }
      onClose()
    } catch (error) {
      toast.error(sideEffect ? "Không thể cập nhật" : "Không thể ghi nhận tác dụng phụ")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const commonSideEffects = [
    "Buồn nôn",
    "Nôn mửa",
    "Tiêu chảy",
    "Đau đầu",
    "Chóng mặt",
    "Mệt mỏi",
    "Mất ngủ",
    "Phát ban da",
    "Ngứa",
    "Đau bụng",
    "Khó tiêu",
    "Sốt",
    "Đau cơ",
    "Đau khớp",
    "Khác",
  ]

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{sideEffect ? "Sửa tác dụng phụ" : "Ghi nhận tác dụng phụ"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="side-effect-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="medicationId">Thuốc liên quan *</label>
              <select
                id="medicationId"
                name="medicationId"
                value={formData.medicationId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn thuốc</option>
                {medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.name} - {medication.strength}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="effectName">Tác dụng phụ *</label>
              <select id="effectName" name="effectName" value={formData.effectName} onChange={handleChange} required>
                <option value="">Chọn tác dụng phụ</option>
                {commonSideEffects.map((effect) => (
                  <option key={effect} value={effect}>
                    {effect}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Mức độ nghiêm trọng *</label>
              <select id="severity" name="severity" value={formData.severity} onChange={handleChange} required>
                <option value="MILD">Nhẹ</option>
                <option value="MODERATE">Vừa</option>
                <option value="SEVERE">Nặng</option>
                <option value="CRITICAL">Nghiêm trọng</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="occurredAt">Thời gian xảy ra *</label>
              <input
                type="datetime-local"
                id="occurredAt"
                name="occurredAt"
                value={formData.occurredAt}
                onChange={handleChange}
                required
                max={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Thời gian kéo dài</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Ví dụ: 2 giờ, 1 ngày"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Mô tả chi tiết</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Mô tả chi tiết về tác dụng phụ, mức độ ảnh hưởng..."
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="actionTaken">Biện pháp đã thực hiện</label>
            <textarea
              id="actionTaken"
              name="actionTaken"
              value={formData.actionTaken}
              onChange={handleChange}
              rows="3"
              placeholder="Các biện pháp đã thực hiện để giảm tác dụng phụ..."
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="resolved" checked={formData.resolved} onChange={handleChange} />
              <span className="checkmark"></span>
              Tác dụng phụ đã hết
            </label>
          </div>

          <div className="severity-guide">
            <h4>Hướng dẫn đánh giá mức độ:</h4>
            <div className="severity-levels">
              <div className="severity-item mild">
                <strong>Nhẹ:</strong> Không ảnh hưởng đến hoạt động hàng ngày
              </div>
              <div className="severity-item moderate">
                <strong>Vừa:</strong> Ảnh hưởng một phần đến hoạt động hàng ngày
              </div>
              <div className="severity-item severe">
                <strong>Nặng:</strong> Ảnh hưởng nghiêm trọng đến hoạt động hàng ngày
              </div>
              <div className="severity-item critical">
                <strong>Nghiêm trọng:</strong> Cần can thiệp y tế ngay lập tức
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : sideEffect ? "Cập nhật" : "Ghi nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SideEffectForm
