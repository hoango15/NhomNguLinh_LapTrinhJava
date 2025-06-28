"use client"

import { useState, useEffect } from "react"
import { appointmentAPI, patientAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./AppointmentForm.css"

const AppointmentForm = ({ appointment, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    appointmentDate: "",
    appointmentTime: "",
    patientId: "",
    notes: "",
    status: "SCHEDULED",
  })
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPatients()
    if (appointment) {
      const appointmentDateTime = new Date(appointment.appointmentDate)
      setFormData({
        title: appointment.title || "",
        appointmentDate: appointmentDateTime.toISOString().split("T")[0],
        appointmentTime: appointmentDateTime.toTimeString().slice(0, 5),
        patientId: appointment.patientId || "",
        notes: appointment.notes || "",
        status: appointment.status || "SCHEDULED",
      })
    }
  }, [appointment])

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
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)
      const submitData = {
        ...formData,
        appointmentDate: appointmentDateTime.toISOString(),
      }

      if (appointment) {
        await appointmentAPI.update(appointment.id, submitData)
        toast.success("Cập nhật lịch hẹn thành công")
      } else {
        await appointmentAPI.create(submitData)
        toast.success("Thêm lịch hẹn thành công")
      }
      onClose()
    } catch (error) {
      toast.error(appointment ? "Không thể cập nhật lịch hẹn" : "Không thể thêm lịch hẹn")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{appointment ? "Sửa lịch hẹn" : "Thêm lịch hẹn mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="appointment-form">
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
                placeholder="Ví dụ: Khám định kỳ"
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="appointmentDate">Ngày hẹn *</label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentTime">Giờ hẹn *</label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="SCHEDULED">Đã lên lịch</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="NO_SHOW">Không đến</option>
              </select>
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
              placeholder="Ghi chú thêm về lịch hẹn..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : appointment ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentForm
