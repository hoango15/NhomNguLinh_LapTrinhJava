"use client"

import { useState, useEffect } from "react"
import { medicationReminderAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import ReminderForm from "./ReminderForm"
import "./ReminderList.css"

const ReminderList = () => {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await medicationReminderAPI.getByPatient(user.id)
      setReminders(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách nhắc nhở")
      console.error("Fetch reminders error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhắc nhở này?")) {
      try {
        await medicationReminderAPI.delete(id)
        toast.success("Xóa nhắc nhở thành công")
        fetchReminders()
      } catch (error) {
        toast.error("Không thể xóa nhắc nhở")
      }
    }
  }

  const handleEdit = (reminder) => {
    setEditingReminder(reminder)
    setShowForm(true)
  }

  const handleMarkAsTaken = async (id) => {
    try {
      await medicationReminderAPI.markAsTaken(id)
      toast.success("Đã ghi nhận uống thuốc")
      fetchReminders()
    } catch (error) {
      toast.error("Không thể ghi nhận")
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingReminder(null)
    fetchReminders()
  }

  const getNextReminderTime = (reminder) => {
    const now = new Date()
    const times = reminder.reminderTimes || []

    for (const time of times) {
      const [hours, minutes] = time.split(":")
      const reminderTime = new Date()
      reminderTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

      if (reminderTime > now) {
        return reminderTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      }
    }

    // If no time today, return first time tomorrow
    if (times.length > 0) {
      return `Ngày mai ${times[0]}`
    }

    return "Chưa đặt"
  }

  const isReminderActive = (reminder) => {
    if (!reminder.isActive) return false

    const now = new Date()
    const startDate = new Date(reminder.startDate)
    const endDate = reminder.endDate ? new Date(reminder.endDate) : null

    return now >= startDate && (!endDate || now <= endDate)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="reminder-list">
      <div className="page-header">
        <h1 className="page-title">Nhắc nhở Uống thuốc</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Thêm nhắc nhở
        </button>
      </div>

      <div className="reminders-grid">
        {reminders.map((reminder) => (
          <div key={reminder.id} className={`reminder-card ${isReminderActive(reminder) ? "active" : "inactive"}`}>
            <div className="reminder-header">
              <h3 className="reminder-title">{reminder.medicationName}</h3>
              <div className="reminder-badges">
                <span className={`status-badge ${isReminderActive(reminder) ? "active" : "inactive"}`}>
                  {isReminderActive(reminder) ? "Đang hoạt động" : "Không hoạt động"}
                </span>
              </div>
            </div>

            <div className="reminder-info">
              <div className="info-item">
                <span className="info-label">Liều dùng:</span>
                <span className="info-value">{reminder.dosage}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tần suất:</span>
                <span className="info-value">{reminder.frequency}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Lần nhắc tiếp theo:</span>
                <span className="info-value">{getNextReminderTime(reminder)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Thời gian nhắc:</span>
                <div className="reminder-times">
                  {reminder.reminderTimes?.map((time, index) => (
                    <span key={index} className="time-badge">
                      {time}
                    </span>
                  )) || <span>Chưa đặt</span>}
                </div>
              </div>
              {reminder.notes && (
                <div className="info-item full-width">
                  <span className="info-label">Ghi chú:</span>
                  <span className="info-value">{reminder.notes}</span>
                </div>
              )}
            </div>

            <div className="reminder-actions">
              {isReminderActive(reminder) && (
                <button className="btn btn-success btn-sm" onClick={() => handleMarkAsTaken(reminder.id)}>
                  ✅ Đã uống
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(reminder)}>
                Sửa
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(reminder.id)}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {reminders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">⏰</div>
          <h3>Chưa có nhắc nhở nào</h3>
          <p>Thêm nhắc nhở để không bao giờ quên uống thuốc</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Thêm nhắc nhở đầu tiên
          </button>
        </div>
      )}

      {showForm && <ReminderForm reminder={editingReminder} onClose={handleFormClose} />}
    </div>
  )
}

export default ReminderList
