"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import DoctorForm from "./DoctorForm"
import "./DoctorList.css"

const DoctorList = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await adminAPI.getDoctors()
      setDoctors(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách bác sĩ")
      console.error("Fetch doctors error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này?")) {
      try {
        await adminAPI.deleteDoctor(id)
        toast.success("Xóa bác sĩ thành công")
        fetchDoctors()
      } catch (error) {
        toast.error("Không thể xóa bác sĩ")
      }
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setShowForm(true)
  }

  const handleToggleStatus = async (doctorId, currentStatus) => {
    try {
      await adminAPI.updateDoctorStatus(doctorId, !currentStatus)
      toast.success(`${!currentStatus ? "Kích hoạt" : "Vô hiệu hóa"} bác sĩ thành công`)
      fetchDoctors()
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingDoctor(null)
    fetchDoctors()
  }

  const getSpecializations = () => {
    const specs = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))]
    return specs.sort()
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialization = specializationFilter === "all" || doctor.specialization === specializationFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && doctor.isActive) ||
      (statusFilter === "inactive" && !doctor.isActive)

    return matchesSearch && matchesSpecialization && matchesStatus
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="doctor-list">
      <div className="page-header">
        <h1 className="page-title">Quản lý Bác sĩ</h1>
        {user?.role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm bác sĩ
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả chuyên khoa</option>
          {getSpecializations().map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-header">
              <div className="doctor-avatar">
                <img
                  src={doctor.avatar || `/placeholder.svg?height=80&width=80`}
                  alt={doctor.fullName}
                  className="avatar-img"
                />
              </div>
              <div className="doctor-basic-info">
                <h3 className="doctor-name">{doctor.fullName}</h3>
                <p className="doctor-specialization">{doctor.specialization}</p>
                <div className="doctor-badges">
                  <span className={`status-badge ${doctor.isActive ? "active" : "inactive"}`}>
                    {doctor.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                  </span>
                  {doctor.yearsOfExperience && (
                    <span className="experience-badge">{doctor.yearsOfExperience} năm KN</span>
                  )}
                </div>
              </div>
            </div>

            <div className="doctor-info">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{doctor.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Điện thoại:</span>
                <span className="info-value">{doctor.phoneNumber || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Khoa:</span>
                <span className="info-value">{doctor.department || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Giờ làm việc:</span>
                <span className="info-value">{doctor.availableHours || "N/A"}</span>
              </div>
              {doctor.consultationFee && (
                <div className="info-item">
                  <span className="info-label">Phí tư vấn:</span>
                  <span className="info-value">{doctor.consultationFee.toLocaleString()} VNĐ</span>
                </div>
              )}
              {doctor.licenseNumber && (
                <div className="info-item">
                  <span className="info-label">Số chứng chỉ:</span>
                  <span className="info-value">{doctor.licenseNumber}</span>
                </div>
              )}
            </div>

            {doctor.bio && (
              <div className="doctor-bio">
                <p>{doctor.bio.length > 150 ? `${doctor.bio.substring(0, 150)}...` : doctor.bio}</p>
              </div>
            )}

            <div className="doctor-stats">
              <div className="stat-item">
                <span className="stat-number">{doctor.totalPatients || 0}</span>
                <span className="stat-label">Bệnh nhân</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{doctor.totalConsultations || 0}</span>
                <span className="stat-label">Tư vấn</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{doctor.rating || 0}/5</span>
                <span className="stat-label">Đánh giá</span>
              </div>
            </div>

            <div className="doctor-actions">
              <button className="btn btn-outline" onClick={() => (window.location.href = `/doctors/${doctor.id}`)}>
                Chi tiết
              </button>
              {user?.role === "ADMIN" && (
                <>
                  <button className="btn btn-secondary" onClick={() => handleEdit(doctor)}>
                    Sửa
                  </button>
                  <button
                    className={`btn ${doctor.isActive ? "btn-warning" : "btn-success"}`}
                    onClick={() => handleToggleStatus(doctor.id, doctor.isActive)}
                  >
                    {doctor.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(doctor.id)}>
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <h3>Không tìm thấy bác sĩ nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}

      {showForm && <DoctorForm doctor={editingDoctor} onClose={handleFormClose} />}
    </div>
  )
}

export default DoctorList
