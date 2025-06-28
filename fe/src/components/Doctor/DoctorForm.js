"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./DoctorForm.css"

const DoctorForm = ({ doctor, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    qualifications: "",
    department: "",
    consultationFee: "",
    availableHours: "",
    bio: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)

  const specializations = [
    "HIV/AIDS Specialist",
    "Infectious Disease",
    "Internal Medicine",
    "Immunology",
    "Dermatology",
    "Psychiatry",
    "Cardiology",
    "Nephrology",
    "Hepatology",
    "General Practice",
  ]

  useEffect(() => {
    if (doctor) {
      setFormData({
        fullName: doctor.fullName || "",
        email: doctor.email || "",
        password: "", 
        phoneNumber: doctor.phoneNumber || "",
        specialization: doctor.specialization || "",
        licenseNumber: doctor.licenseNumber || "",
        yearsOfExperience: doctor.yearsOfExperience || "",
        qualifications: doctor.qualifications || "",
        department: doctor.department || "",
        consultationFee: doctor.consultationFee || "",
        availableHours: doctor.availableHours || "",
        bio: doctor.bio || "",
        isActive: doctor.isActive !== undefined ? doctor.isActive : true,
      })
    }
  }, [doctor])

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
        role: "DOCTOR",
        yearsOfExperience: Number.parseInt(formData.yearsOfExperience) || 0,
        consultationFee: Number.parseFloat(formData.consultationFee) || 0,
      }

      if (doctor && !submitData.password) {
        delete submitData.password // 
      }

      if (doctor) {
        await adminAPI.updateDoctor(doctor.id, submitData)
        toast.success("Cập nhật bác sĩ thành công")
      } else {
        await adminAPI.createDoctor(submitData)
        toast.success("Thêm bác sĩ thành công")
      }
      onClose()
    } catch (error) {
      toast.error(doctor ? "Không thể cập nhật bác sĩ" : "Không thể thêm bác sĩ")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{doctor ? "Sửa thông tin bác sĩ" : "Thêm bác sĩ mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="doctor-form">
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
                <label htmlFor="password">{doctor ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!doctor}
                  minLength="6"
                />
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
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin chuyên môn</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="specialization">Chuyên khoa *</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn chuyên khoa</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="licenseNumber">Số chứng chỉ hành nghề</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="yearsOfExperience">Số năm kinh nghiệm</label>
                <input
                  type="number"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  min="0"
                  max="50"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Khoa/Phòng ban</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Ví dụ: Khoa Nhiễm"
                />
              </div>

              <div className="form-group">
                <label htmlFor="consultationFee">Phí tư vấn (VNĐ)</label>
                <input
                  type="number"
                  id="consultationFee"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="availableHours">Giờ làm việc</label>
                <input
                  type="text"
                  id="availableHours"
                  name="availableHours"
                  value={formData.availableHours}
                  onChange={handleChange}
                  placeholder="Ví dụ: 8:00-17:00, T2-T6"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="qualifications">Bằng cấp & Chứng chỉ</label>
              <textarea
                id="qualifications"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows="3"
                placeholder="Liệt kê các bằng cấp, chứng chỉ chuyên môn..."
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="bio">Tiểu sử nghề nghiệp</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Mô tả về kinh nghiệm, chuyên môn, thành tích..."
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              <span className="checkmark"></span>
              Tài khoản hoạt động
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : doctor ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorForm
