"use client"

import { useState, useEffect } from "react"
import { patientAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./PatientForm.css"

const PatientForm = ({ patient, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    diagnosisDate: "",
    status: "ACTIVE",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.fullName || "",
        email: patient.email || "",
        phoneNumber: patient.phoneNumber || "",
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "",
        gender: patient.gender || "MALE",
        address: patient.address || "",
        emergencyContact: patient.emergencyContact || "",
        emergencyPhone: patient.emergencyPhone || "",
        diagnosisDate: patient.diagnosisDate ? patient.diagnosisDate.split("T")[0] : "",
        status: patient.status || "ACTIVE",
        notes: patient.notes || "",
      })
    }
  }, [patient])

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
      if (patient) {
        await patientAPI.update(patient.id, formData)
        toast.success("Cập nhật bệnh nhân thành công")
      } else {
        await patientAPI.create(formData)
        toast.success("Thêm bệnh nhân thành công")
      }
      onClose()
    } catch (error) {
      toast.error(patient ? "Không thể cập nhật bệnh nhân" : "Không thể thêm bệnh nhân")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{patient ? "Sửa thông tin bệnh nhân" : "Thêm bệnh nhân mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-section">
            <h3>Thông tin cá nhân</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Số điện thoại</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Ngày sinh</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính</label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="ACTIVE">Đang điều trị</option>
                  <option value="INACTIVE">Ngừng điều trị</option>
                  <option value="TRANSFERRED">Chuyển viện</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Địa chỉ</label>
              <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows="2" />
            </div>
          </div>

          <div className="form-section">
            <h3>Liên hệ khẩn cấp</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="emergencyContact">Tên người liên hệ</label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyPhone">Số điện thoại khẩn cấp</label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin y tế</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="diagnosisDate">Ngày chẩn đoán</label>
                <input
                  type="date"
                  id="diagnosisDate"
                  name="diagnosisDate"
                  value={formData.diagnosisDate}
                  onChange={handleChange}
                />
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
                placeholder="Ghi chú thêm về bệnh nhân..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : patient ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PatientForm
