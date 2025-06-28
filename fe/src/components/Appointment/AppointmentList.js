"use client"

import { useState, useEffect } from "react"
import { appointmentAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import AppointmentForm from "./AppointmentForm"
import AppointmentCalendar from "./AppointmentCalendar"
import "./AppointmentList.css"

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [viewMode, setViewMode] = useState("list") // list or calendar
  const [filterStatus, setFilterStatus] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll()
      setAppointments(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách lịch hẹn")
      console.error("Fetch appointments error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?")) {
      try {
        await appointmentAPI.delete(id)
        toast.success("Xóa lịch hẹn thành công")
        fetchAppointments()
      } catch (error) {
        toast.error("Không thể xóa lịch hẹn")
      }
    }
  }

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAppointment(null)
    fetchAppointments()
  }

  const getStatusText = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "Đã lên lịch"
      case "CONFIRMED":
        return "Đã xác nhận"
      case "COMPLETED":
        return "Hoàn thành"
      case "CANCELLED":
        return "Đã hủy"
      case "NO_SHOW":
        return "Không đến"
      default:
        return status
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    if (filterStatus === "all") return true
    return appointment.status === filterStatus
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="appointment-list">
      <div className="page-header">
        <h1 className="page-title">Quản lý Lịch hẹn</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
              📋 Danh sách
            </button>
            <button
              className={`toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              📅 Lịch
            </button>
          </div>
          {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Thêm lịch hẹn
            </button>
          )}
        </div>
      </div>

      {viewMode === "list" && (
        <>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">Tất cả trạng thái</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="NO_SHOW">Không đến</option>
            </select>
          </div>

          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <h3 className="appointment-title">{appointment.title || "Khám định kỳ"}</h3>
                  <span className={`status-badge ${appointment.status?.toLowerCase()}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className="appointment-info">
                  <div className="info-item">
                    <span className="info-label">Ngày giờ:</span>
                    <span className="info-value">{new Date(appointment.appointmentDate).toLocaleString("vi-VN")}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Bệnh nhân:</span>
                    <span className="info-value">{appointment.patientName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Bác sĩ:</span>
                    <span className="info-value">{appointment.doctorName}</span>
                  </div>
                  {appointment.notes && (
                    <div className="info-item">
                      <span className="info-label">Ghi chú:</span>
                      <span className="info-value">{appointment.notes}</span>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
                    <>
                      <button className="btn btn-secondary" onClick={() => handleEdit(appointment)}>
                        Sửa
                      </button>
                      {user?.role === "ADMIN" && (
                        <button className="btn btn-danger" onClick={() => handleDelete(appointment.id)}>
                          Xóa
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="empty-state">
              <p>Không tìm thấy lịch hẹn nào</p>
            </div>
          )}
        </>
      )}

      {viewMode === "calendar" && <AppointmentCalendar appointments={appointments} onAppointmentClick={handleEdit} />}

      {showForm && <AppointmentForm appointment={editingAppointment} onClose={handleFormClose} />}
    </div>
  )
}

export default AppointmentList
