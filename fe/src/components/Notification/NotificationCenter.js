"use client"

import { useState, useEffect } from "react"
import { notificationAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./NotificationCenter.css"

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read
  const { user } = useAuth()

  useEffect(() => {
    fetchNotifications()
   
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getByUser(user.id)
      setNotifications(response.data)
    } catch (error) {
      console.error("Fetch notifications error:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id)
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
      )
    } catch (error) {
      toast.error("Không thể đánh dấu đã đọc")
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc")
    } catch (error) {
      toast.error("Không thể đánh dấu tất cả đã đọc")
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "APPOINTMENT_REMINDER":
        return "📅"
      case "MEDICATION_REMINDER":
        return "💊"
      case "LAB_RESULT":
        return "🧪"
      case "SYSTEM":
        return "⚙️"
      case "TREATMENT_UPDATE":
        return "📋"
      default:
        return "📢"
    }
  }

  const getNotificationTypeText = (type) => {
    switch (type) {
      case "APPOINTMENT_REMINDER":
        return "Nhắc nhở lịch hẹn"
      case "MEDICATION_REMINDER":
        return "Nhắc nhở uống thuốc"
      case "LAB_RESULT":
        return "Kết quả xét nghiệm"
      case "SYSTEM":
        return "Hệ thống"
      case "TREATMENT_UPDATE":
        return "Cập nhật điều trị"
      default:
        return "Thông báo"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead
    if (filter === "read") return notification.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="notification-center">
      <div className="page-header">
        <h1 className="page-title">
          Thông báo {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllAsRead}>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="notification-filters">
        <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          Tất cả ({notifications.length})
        </button>
        <button className={`filter-btn ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
          Chưa đọc ({unreadCount})
        </button>
        <button className={`filter-btn ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>
          Đã đọc ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${!notification.isRead ? "unread" : ""}`}
            onClick={() => !notification.isRead && markAsRead(notification.id)}
          >
            <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
            <div className="notification-content">
              <div className="notification-header">
                <h4 className="notification-title">{notification.title}</h4>
                <div className="notification-meta">
                  <span className="notification-type">{getNotificationTypeText(notification.type)}</span>
                  <span className="notification-time">{new Date(notification.createdAt).toLocaleString("vi-VN")}</span>
                </div>
              </div>
              <p className="notification-message">{notification.message}</p>
              {notification.actionUrl && (
                <a href={notification.actionUrl} className="notification-action">
                  Xem chi tiết →
                </a>
              )}
            </div>
            {!notification.isRead && <div className="unread-indicator"></div>}
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không có thông báo</h3>
          <p>
            {filter === "unread"
              ? "Bạn đã đọc hết tất cả thông báo"
              : filter === "read"
                ? "Chưa có thông báo nào được đọc"
                : "Chưa có thông báo nào"}
          </p>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
