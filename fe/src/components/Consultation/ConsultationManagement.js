"use client"

import { useState, useEffect } from "react"
import { consultationAPI, patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import ChatWindow from "./ChatWindow"
import "./ConsultationManagement.css"

const ConsultationManagement = () => {
  const [consultations, setConsultations] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    patientId: "",
    subject: "",
    description: "",
    priority: "MEDIUM",
    type: "GENERAL",
  })

  useEffect(() => {
    fetchConsultations()
    if (user?.role !== "PATIENT") {
      fetchPatients()
    }
  }, [user])

  const fetchConsultations = async () => {
    try {
      let response
      if (user?.role === "PATIENT") {
        response = await consultationAPI.getByPatient(user.id)
      } else {
        response = await consultationAPI.getAll()
      }
      setConsultations(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách tư vấn")
      console.error("Fetch consultations error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      console.error("Fetch patients error:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = user?.role === "PATIENT" ? { ...formData, patientId: user.id } : formData

      await consultationAPI.create(submitData)
      toast.success("Tạo yêu cầu tư vấn thành công")
      handleFormClose()
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo yêu cầu tư vấn")
      console.error("Create consultation error:", error)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await consultationAPI.updateStatus(id, status)
      toast.success("Cập nhật trạng thái thành công")
      fetchConsultations()
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái")
    }
  }

  const handleAssignDoctor = async (id, doctorId) => {
    try {
      await consultationAPI.assignDoctor(id, doctorId)
      toast.success("Phân công bác sĩ thành công")
      fetchConsultations()
    } catch (error) {
      toast.error("Không thể phân công bác sĩ")
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setFormData({
      patientId: "",
      subject: "",
      description: "",
      priority: "MEDIUM",
      type: "GENERAL",
    })
    fetchConsultations()
  }

  const openChat = (consultation) => {
    setSelectedConsultation(consultation)
    setShowChat(true)
  }

  const getStatusText = (status) => {
    const statuses = {
      PENDING: "Chờ xử lý",
      IN_PROGRESS: "Đang tư vấn",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    }
    return statuses[status] || status
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      PENDING: "status-pending",
      IN_PROGRESS: "status-progress",
      COMPLETED: "status-completed",
      CANCELLED: "status-cancelled",
    }
    return classes[status] || "status-default"
  }

  const getPriorityText = (priority) => {
    const priorities = {
      LOW: "Thấp",
      MEDIUM: "Trung bình",
      HIGH: "Cao",
      URGENT: "Khẩn cấp",
    }
    return priorities[priority] || priority
  }

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      LOW: "priority-low",
      MEDIUM: "priority-medium",
      HIGH: "priority-high",
      URGENT: "priority-urgent",
    }
    return classes[priority] || "priority-default"
  }

  const getTypeText = (type) => {
    const types = {
      GENERAL: "Tổng quát",
      MEDICATION: "Thuốc",
      SIDE_EFFECTS: "Tác dụng phụ",
      LAB_RESULTS: "Kết quả xét nghiệm",
      APPOINTMENT: "Lịch hẹn",
      EMERGENCY: "Khẩn cấp",
    }
    return types[type] || type
  }

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || consultation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="consultation-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý Tư vấn</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Tạo yêu cầu tư vấn
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm tư vấn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="IN_PROGRESS">Đang tư vấn</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div className="consultations-list">
        {filteredConsultations.map((consultation) => (
          <div key={consultation.id} className="consultation-card">
            <div className="consultation-header">
              <div className="consultation-info">
                <h3 className="consultation-subject">{consultation.subject}</h3>
                <div className="consultation-meta">
                  <span className="consultation-patient">Bệnh nhân: {consultation.patientName}</span>
                  <span className="consultation-date">{new Date(consultation.createdAt).toLocaleString("vi-VN")}</span>
                </div>
              </div>
              <div className="consultation-badges">
                <span className={`status-badge ${getStatusBadgeClass(consultation.status)}`}>
                  {getStatusText(consultation.status)}
                </span>
                <span className={`priority-badge ${getPriorityBadgeClass(consultation.priority)}`}>
                  {getPriorityText(consultation.priority)}
                </span>
                <span className="type-badge">{getTypeText(consultation.type)}</span>
              </div>
            </div>

            <p className="consultation-description">{consultation.description}</p>

            {consultation.doctorName && (
              <div className="consultation-doctor">
                <strong>Bác sĩ phụ trách:</strong> {consultation.doctorName}
              </div>
            )}

            <div className="consultation-actions">
              {consultation.status === "IN_PROGRESS" && (
                <button className="btn btn-primary" onClick={() => openChat(consultation)}>
                  Mở chat
                </button>
              )}

              {user?.role !== "PATIENT" && consultation.status === "PENDING" && (
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => handleStatusUpdate(consultation.id, "IN_PROGRESS")}
                  >
                    Bắt đầu tư vấn
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleAssignDoctor(consultation.id, user.id)}>
                    Nhận tư vấn
                  </button>
                </>
              )}

              {user?.role !== "PATIENT" && consultation.status === "IN_PROGRESS" && (
                <button className="btn btn-outline" onClick={() => handleStatusUpdate(consultation.id, "COMPLETED")}>
                  Hoàn thành
                </button>
              )}

              {consultation.status === "PENDING" && (
                <button className="btn btn-danger" onClick={() => handleStatusUpdate(consultation.id, "CANCELLED")}>
                  Hủy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredConsultations.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Không có yêu cầu tư vấn nào</h3>
          <p>Tạo yêu cầu tư vấn mới để bắt đầu</p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Tạo yêu cầu tư vấn</h2>
              <button className="close-btn" onClick={handleFormClose}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="consultation-form">
              {user?.role !== "PATIENT" && (
                <div className="form-group">
                  <label>Bệnh nhân *</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
                    required
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.fullName} - {patient.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Loại tư vấn *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    <option value="GENERAL">Tổng quát</option>
                    <option value="MEDICATION">Thuốc</option>
                    <option value="SIDE_EFFECTS">Tác dụng phụ</option>
                    <option value="LAB_RESULTS">Kết quả xét nghiệm</option>
                    <option value="APPOINTMENT">Lịch hẹn</option>
                    <option value="EMERGENCY">Khẩn cấp</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mức độ ưu tiên *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    required
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  required
                  placeholder="Nhập tiêu đề tư vấn"
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  rows="4"
                  placeholder="Mô tả chi tiết vấn đề cần tư vấn"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleFormClose}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChat && selectedConsultation && (
        <ChatWindow consultation={selectedConsultation} onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}

export default ConsultationManagement
