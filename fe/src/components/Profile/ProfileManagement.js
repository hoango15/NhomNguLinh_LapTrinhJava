"use client"

import { useState, useEffect } from "react"
import { userAPI, patientAPI, doctorAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./ProfileManagement.css"

const ProfileManagement = () => {
  const [activeTab, setActiveTab] = useState("personal")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user, updateUser } = useAuth()

  const [personalData, setPersonalData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
  })

  const [medicalData, setMedicalData] = useState({
    // For patients
    bloodType: "",
    allergies: "",
    chronicDiseases: "",
    insuranceNumber: "",
    // For doctors
    specialization: "",
    licenseNumber: "",
    experience: "",
    qualifications: "",
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferencesData, setPreferencesData] = useState({
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    medicationReminders: true,
  })

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  const fetchUserProfile = async () => {
    try {
      if (user?.role === "PATIENT") {
        const response = await patientAPI.getById(user.id)
        const patientData = response.data
        setPersonalData({
          fullName: patientData.fullName || "",
          email: patientData.email || "",
          phoneNumber: patientData.phoneNumber || "",
          dateOfBirth: patientData.dateOfBirth || "",
          gender: patientData.gender || "",
          address: patientData.address || "",
          emergencyContact: patientData.emergencyContact || "",
          emergencyPhone: patientData.emergencyPhone || "",
        })
        setMedicalData({
          bloodType: patientData.bloodType || "",
          allergies: patientData.allergies || "",
          chronicDiseases: patientData.chronicDiseases || "",
          insuranceNumber: patientData.insuranceNumber || "",
        })
      } else if (user?.role === "DOCTOR") {
        const response = await doctorAPI.getById(user.id)
        const doctorData = response.data
        setPersonalData({
          fullName: doctorData.fullName || "",
          email: doctorData.email || "",
          phoneNumber: doctorData.phoneNumber || "",
          dateOfBirth: doctorData.dateOfBirth || "",
          gender: doctorData.gender || "",
          address: doctorData.address || "",
          emergencyContact: doctorData.emergencyContact || "",
          emergencyPhone: doctorData.emergencyPhone || "",
        })
        setMedicalData({
          specialization: doctorData.specialization || "",
          licenseNumber: doctorData.licenseNumber || "",
          experience: doctorData.experience || "",
          qualifications: doctorData.qualifications || "",
        })
      }

      // Load preferences
      const prefsResponse = await userAPI.getPreferences(user.id)
      if (prefsResponse.data) {
        setPreferencesData(prefsResponse.data)
      }
    } catch (error) {
      console.error("Fetch profile error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (user?.role === "PATIENT") {
        await patientAPI.update(user.id, personalData)
      } else if (user?.role === "DOCTOR") {
        await doctorAPI.update(user.id, personalData)
      }
      toast.success("Cập nhật thông tin cá nhân thành công")
      updateUser({ ...user, ...personalData })
    } catch (error) {
      toast.error("Không thể cập nhật thông tin cá nhân")
    } finally {
      setSaving(false)
    }
  }

  const handleMedicalSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (user?.role === "PATIENT") {
        await patientAPI.updateMedicalInfo(user.id, medicalData)
      } else if (user?.role === "DOCTOR") {
        await doctorAPI.updateProfessionalInfo(user.id, medicalData)
      }
      toast.success("Cập nhật thông tin y tế thành công")
    } catch (error) {
      toast.error("Không thể cập nhật thông tin y tế")
    } finally {
      setSaving(false)
    }
  }

  const handleSecuritySubmit = async (e) => {
    e.preventDefault()
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }
    setSaving(true)
    try {
      await userAPI.changePassword(user.id, {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      })
      toast.success("Đổi mật khẩu thành công")
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast.error("Không thể đổi mật khẩu")
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userAPI.updatePreferences(user.id, preferencesData)
      toast.success("Cập nhật tùy chọn thành công")
    } catch (error) {
      toast.error("Không thể cập nhật tùy chọn")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="profile-management">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={user?.avatar || "/default-avatar.png"} alt="Avatar" className="avatar-image" />
          <button className="avatar-upload-btn">📷 Đổi ảnh</button>
        </div>
        <div className="profile-info">
          <h1>{user?.fullName}</h1>
          <p className="profile-role">
            {user?.role === "PATIENT" ? "Bệnh nhân" : user?.role === "DOCTOR" ? "Bác sĩ" : "Quản trị viên"}
          </p>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          Thông tin cá nhân
        </button>
        <button
          className={`tab-btn ${activeTab === "medical" ? "active" : ""}`}
          onClick={() => setActiveTab("medical")}
        >
          {user?.role === "PATIENT" ? "Thông tin y tế" : "Thông tin chuyên môn"}
        </button>
        <button
          className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          Bảo mật
        </button>
        <button
          className={`tab-btn ${activeTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          Tùy chọn
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "personal" && (
          <form onSubmit={handlePersonalSubmit} className="profile-form">
            <h3>Thông tin cá nhân</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  value={personalData.fullName}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={personalData.email}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  value={personalData.phoneNumber}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giới tính</label>
                <select
                  value={personalData.gender}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <textarea
                value={personalData.address}
                onChange={(e) => setPersonalData((prev) => ({ ...prev, address: e.target.value }))}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Người liên hệ khẩn cấp</label>
                <input
                  type="text"
                  value={personalData.emergencyContact}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>SĐT khẩn cấp</label>
                <input
                  type="tel"
                  value={personalData.emergencyPhone}
                  onChange={(e) => setPersonalData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        )}

        {activeTab === "medical" && (
          <form onSubmit={handleMedicalSubmit} className="profile-form">
            <h3>{user?.role === "PATIENT" ? "Thông tin y tế" : "Thông tin chuyên môn"}</h3>

            {user?.role === "PATIENT" ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nhóm máu</label>
                    <select
                      value={medicalData.bloodType}
                      onChange={(e) => setMedicalData((prev) => ({ ...prev, bloodType: e.target.value }))}
                    >
                      <option value="">Chọn nhóm máu</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Số bảo hiểm</label>
                    <input
                      type="text"
                      value={medicalData.insuranceNumber}
                      onChange={(e) => setMedicalData((prev) => ({ ...prev, insuranceNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Dị ứng</label>
                  <textarea
                    value={medicalData.allergies}
                    onChange={(e) => setMedicalData((prev) => ({ ...prev, allergies: e.target.value }))}
                    rows="3"
                    placeholder="Mô tả các loại dị ứng (nếu có)"
                  />
                </div>

                <div className="form-group">
                  <label>Bệnh mãn tính</label>
                  <textarea
                    value={medicalData.chronicDiseases}
                    onChange={(e) => setMedicalData((prev) => ({ ...prev, chronicDiseases: e.target.value }))}
                    rows="3"
                    placeholder="Mô tả các bệnh mãn tính (nếu có)"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Chuyên khoa</label>
                    <input
                      type="text"
                      value={medicalData.specialization}
                      onChange={(e) => setMedicalData((prev) => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số chứng chỉ hành nghề</label>
                    <input
                      type="text"
                      value={medicalData.licenseNumber}
                      onChange={(e) => setMedicalData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Kinh nghiệm (năm)</label>
                  <input
                    type="number"
                    value={medicalData.experience}
                    onChange={(e) => setMedicalData((prev) => ({ ...prev, experience: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Bằng cấp & Chứng chỉ</label>
                  <textarea
                    value={medicalData.qualifications}
                    onChange={(e) => setMedicalData((prev) => ({ ...prev, qualifications: e.target.value }))}
                    rows="4"
                    placeholder="Mô tả các bằng cấp, chứng chỉ chuyên môn"
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSecuritySubmit} className="profile-form">
            <h3>Bảo mật tài khoản</h3>

            <div className="form-group">
              <label>Mật khẩu hiện tại *</label>
              <input
                type="password"
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu mới *</label>
              <input
                type="password"
                value={securityData.newPassword}
                onChange={(e) => setSecurityData((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        )}

        {activeTab === "preferences" && (
          <form onSubmit={handlePreferencesSubmit} className="profile-form">
            <h3>Tùy chọn cá nhân</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Ngôn ngữ</label>
                <select
                  value={preferencesData.language}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, language: e.target.value }))}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="form-group">
                <label>Múi giờ</label>
                <select
                  value={preferencesData.timezone}
                  onChange={(e) => setPreferencesData((prev) => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                  <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                  <option value="Asia/Singapore">Singapore (GMT+8)</option>
                </select>
              </div>
            </div>

            <div className="preferences-section">
              <h4>Thông báo</h4>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferencesData.emailNotifications}
                    onChange={(e) => setPreferencesData((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                  />
                  Thông báo qua Email
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferencesData.smsNotifications}
                    onChange={(e) => setPreferencesData((prev) => ({ ...prev, smsNotifications: e.target.checked }))}
                  />
                  Thông báo qua SMS
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferencesData.pushNotifications}
                    onChange={(e) => setPreferencesData((prev) => ({ ...prev, pushNotifications: e.target.checked }))}
                  />
                  Thông báo đẩy
                </label>
              </div>
            </div>

            <div className="preferences-section">
              <h4>Nhắc nhở</h4>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferencesData.appointmentReminders}
                    onChange={(e) =>
                      setPreferencesData((prev) => ({ ...prev, appointmentReminders: e.target.checked }))
                    }
                  />
                  Nhắc nhở lịch hẹn
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={preferencesData.medicationReminders}
                    onChange={(e) => setPreferencesData((prev) => ({ ...prev, medicationReminders: e.target.checked }))}
                  />
                  Nhắc nhở uống thuốc
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu tùy chọn"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ProfileManagement
