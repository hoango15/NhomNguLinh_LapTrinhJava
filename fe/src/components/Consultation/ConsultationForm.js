
"use client"

import { useState, useEffect } from "react"
import { consultationAPI, patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./ConsultationForm.css"

const ConsultationForm = ({ consultation, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    consultationType: "CHAT",
    patientId: "",
    priority: "NORMAL",
    preferredDate: "",
    preferredTime: "",
  })
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "DOCTOR") {
      fetchPatients()
    }

    if (consultation) {
      setFormData({
        title: consultation.title || "",
        description: consultation.description || "",
        consultationType: consultation.consultationType || "CHAT",
        patientId: consultation.patientId || "",
        priority: consultation.priority || "NORMAL",
        preferredDate: consultation.preferredDate ? consultation.preferredDate.split("T")[0] : "",
        preferredTime: consultation.preferredTime || "",
      })
    } else if (user?.role === "PATIENT") {
      setFormData((prev) => ({ ...prev, patientId: user.id }))
    }
  }, [consultation, user])

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách bệnh nhân")
    }
  }

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
        preferredDate: formData.preferredDate
          ? `${formData.preferredDate}T${formData.preferredTime || "09:00"}:00`
          : null,
      }

      if (consultation) {
        await consultationAPI.update(consultation.id, submitData)
        toast.success("Cập nhật yêu cầu tư vấn thành công")
      } else {
        await consultationAPI.create(submitData)
        toast.success("Tạo yêu cầu tư vấn thành công")
      }
      onClose()
    } catch (error) {
      toast.error(consultation ? "Không thể cập nhật yêu cầu" : "Không thể tạo yêu cầu")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{consultation ? "Sửa yêu cầu tư vấn" : "Tạo yêu cầu tư vấn mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="consultation-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Tiêu đề *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ví dụ: Tư vấn về tác dụng phụ thuốc"
              />
            </div>

            <div className="form-group">
              <label htmlFor="consultationType">Loại tư vấn *</label>
              <select
                id="consultationType"
                name="consultationType"
                value={formData.consultationType}
                onChange={handleChange}
                required
              >
                <option value="CHAT">Chat trực tuyến</option>
                <option value="VIDEO_CALL">Video call</option>
              </select>
            </div>

            {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
              <div className="form-group">
                <label htmlFor="patientId">Bệnh nhân *</label>
                <select id="patientId" name="patientId" value={formData.patientId} onChange={handleChange} required>
                  <option value="">Chọn bệnh nhân</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="priority">Mức độ ưu tiên</label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                <option value="LOW">Thấp</option>
                <option value="NORMAL">Bình thường</option>
                <option value="HIGH">Cao</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferredDate">Ngày mong muốn</label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredTime">Giờ mong muốn</label>
              <input
                type="time"
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Mô tả chi tiết *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Mô tả chi tiết về vấn đề cần tư vấn..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : consultation ? "Cập nhật" : "Tạo yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConsultationForm
