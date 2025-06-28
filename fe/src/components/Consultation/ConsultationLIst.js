"use client"

import { useState, useEffect } from "react"
import { consultationAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import ConsultationForm from "./ConsultationForm"
import ChatWindow from "./ChatWindow"
import "./ConsultationList.css"

const ConsultationList = () => {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      let response
      if (user?.role === "DOCTOR") {
        response = await consultationAPI.getByDoctor(user.id)
      } else if (user?.role === "PATIENT") {
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

  const handleStartChat = (consultation) => {
    setSelectedConsultation(consultation)
    setShowChat(true)
  }

  const handleCloseChat = () => {
    setShowChat(false)
    setSelectedConsultation(null)
    fetchConsultations()
  }

  const getStatusText = (status) => {
    const statuses = {
      PENDING: "Chờ xử lý",
      ACTIVE: "Đang tư vấn",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    }
    return statuses[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "warning",
      ACTIVE: "success",
      COMPLETED: "info",
      CANCELLED: "danger",
    }
    return colors[status] || "secondary"
  }

  const filteredConsultations = consultations.filter((consultation) => {
    if (statusFilter === "all") return true
    return consultation.status === statusFilter
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="consultation-list">
      <div className="page-header">
        <h1 className="page-title">Tư vấn trực tuyến</h1>
        {user?.role === "PATIENT" && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Yêu cầu tư vấn
          </button>
        )}
      </div>

      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="ACTIVE">Đang tư vấn</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div className="consultations-grid">
        {filteredConsultations.map((consultation) => (
          <div key={consultation.id} className="consultation-card">
            <div className="consultation-header">
              <h3 className="consultation-title">{consultation.title || "Tư vấn sức khỏe"}</h3>
              <span className={`status-badge ${getStatusColor(consultation.status)}`}>
                {getStatusText(consultation.status)}
              </span>
            </div>

            <div className="consultation-info">
              <div className="info-item">
                <span className="info-label">Bệnh nhân:</span>
                <span className="info-value">{consultation.patientName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bác sĩ:</span>
                <span className="info-value">{consultation.doctorName || "Chưa phân công"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày tạo:</span>
                <span className="info-value">{new Date(consultation.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Loại:</span>
                <span className="info-value">{consultation.consultationType === "CHAT" ? "Chat" : "Video Call"}</span>
              </div>
              {consultation.description && (
                <div className="info-item full-width">
                  <span className="info-label">Mô tả:</span>
                  <span className="info-value">{consultation.description}</span>
                </div>
              )}
            </div>

            <div className="consultation-actions">
              {consultation.status === "ACTIVE" && (
                <button className="btn btn-success" onClick={() => handleStartChat(consultation)}>
                  {consultation.consultationType === "CHAT" ? "Vào Chat" : "Tham gia Video"}
                </button>
              )}
              {consultation.status === "PENDING" && user?.role === "DOCTOR" && (
                <button className="btn btn-primary" onClick={() => handleStartChat(consultation)}>
                  Bắt đầu tư vấn
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={() => (window.location.href = `/consultations/${consultation.id}`)}
              >
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredConsultations.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Không có cuộc tư vấn nào</h3>
          <p>
            {user?.role === "PATIENT"
              ? "Bạn chưa có cuộc tư vấn nào. Hãy tạo yêu cầu tư vấn mới."
              : "Chưa có cuộc tư vấn nào trong hệ thống."}
          </p>
        </div>
      )}

      {showForm && <ConsultationForm onClose={() => setShowForm(false)} />}
      {showChat && <ChatWindow consultation={selectedConsultation} onClose={handleCloseChat} />}
    </div>
  )
}

export default ConsultationList
