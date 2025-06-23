"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./UserForm.css"

const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "PATIENT",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        password: "", // Don't populate password for editing
        role: user.role || "PATIENT",
        isActive: user.isActive !== undefined ? user.isActive : true,
      })
    }
  }, [user])

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
      const submitData = { ...formData }
      if (user && !submitData.password) {
        delete submitData.password // Don't send empty password for updates
      }

      if (user) {
        await adminAPI.updateUser(user.id, submitData)
        toast.success("Cập nhật người dùng thành công")
      } else {
        await adminAPI.createUser(submitData)
        toast.success("Thêm người dùng thành công")
      }
      onClose()
    } catch (error) {
      toast.error(user ? "Không thể cập nhật người dùng" : "Không thể thêm người dùng")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
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
            <label htmlFor="password">{user ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Vai trò *</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="PATIENT">Bệnh nhân</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
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
              {loading ? "Đang xử lý..." : user ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
