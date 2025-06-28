"use client"

import { useState, useEffect } from "react"
import { dashboardAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./Dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu dashboard")
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
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
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="welcome-message">Chào mừng, {user?.fullName || user?.email}!</div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalPatients || 0}</div>
            <div className="stat-label">Tổng bệnh nhân</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalAppointments || 0}</div>
            <div className="stat-label">Lịch hẹn</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalPrescriptions || 0}</div>
            <div className="stat-label">Đơn thuốc</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalLabResults || 0}</div>
            <div className="stat-label">Kết quả XN</div>
          </div>
        </div>
      )}

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3>Hoạt động gần đây</h3>
          </div>
          <div className="card-body">
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">📅</span>
                <div className="activity-content">
                  <div className="activity-title">Lịch hẹn mới được tạo</div>
                  <div className="activity-time">2 giờ trước</div>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">💊</span>
                <div className="activity-content">
                  <div className="activity-title">Đơn thuốc được cập nhật</div>
                  <div className="activity-time">4 giờ trước</div>
                </div>
              </div>
              <div className="activity-item">
                <span className="activity-icon">🧪</span>
                <div className="activity-content">
                  <div className="activity-title">Kết quả xét nghiệm mới</div>
                  <div className="activity-time">1 ngày trước</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Thông báo</h3>
          </div>
          <div className="card-body">
            <div className="notification-list">
              <div className="notification-item">
                <div className="notification-content">
                  <div className="notification-title">Nhắc nhở uống thuốc</div>
                  <div className="notification-message">Đã đến giờ uống thuốc ARV</div>
                </div>
              </div>
              <div className="notification-item">
                <div className="notification-content">
                  <div className="notification-title">Lịch hẹn sắp tới</div>
                  <div className="notification-message">Bạn có lịch hẹn vào ngày mai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
