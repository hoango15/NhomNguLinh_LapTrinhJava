"use client"

import { useState, useEffect } from "react"
import { adminAPI, dashboardAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import UserManagement from "./UserManagement"
import SystemStats from "./SystemStats"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [systemStats, setSystemStats] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      const [systemRes, userRes, dashboardRes] = await Promise.all([
        adminAPI.getSystemStats(),
        adminAPI.getUserStats(),
        dashboardAPI.getStats(),
      ])
      setSystemStats({ ...systemRes.data, ...dashboardRes.data })
      setUserStats(userRes.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu admin")
      console.error("Fetch admin data error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="access-denied">
        <h2>Không có quyền truy cập</h2>
        <p>Bạn cần quyền Admin để truy cập trang này.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1 className="page-title">Quản trị hệ thống</h1>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Tổng quan
        </button>
        <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          👥 Quản lý người dùng
        </button>
        <button className={`tab-btn ${activeTab === "system" ? "active" : ""}`} onClick={() => setActiveTab("system")}>
          ⚙️ Hệ thống
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">{systemStats?.totalUsers || 0}</div>
                  <div className="stat-label">Tổng người dùng</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-content">
                  <div className="stat-number">{systemStats?.totalPatients || 0}</div>
                  <div className="stat-label">Tổng bệnh nhân</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍⚕️</div>
                <div className="stat-content">
                  <div className="stat-number">{systemStats?.totalDoctors || 0}</div>
                  <div className="stat-label">Tổng bác sĩ</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <div className="stat-number">{systemStats?.totalAppointments || 0}</div>
                  <div className="stat-label">Tổng lịch hẹn</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💊</div>
                <div className="stat-content">
                  <div className="stat-number">{systemStats?.totalPrescriptions || 0}</div>
                  <div className="stat-label">Tổng đơn thuốc</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧪</div>
                <div className="stat-content">
                  <div className="stat-number">{systemStats?.totalLabResults || 0}</div>
                  <div className="stat-label">Tổng xét nghiệm</div>
                </div>
              </div>
            </div>

            <div className="activity-section">
              <h3>Hoạt động hệ thống</h3>
              <div className="activity-cards">
                <div className="activity-card">
                  <h4>Người dùng hoạt động</h4>
                  <div className="activity-number">{userStats?.activeUsers || 0}</div>
                  <div className="activity-period">Trong 24h qua</div>
                </div>
                <div className="activity-card">
                  <h4>Lịch hẹn hôm nay</h4>
                  <div className="activity-number">{systemStats?.todayAppointments || 0}</div>
                  <div className="activity-period">Hôm nay</div>
                </div>
                <div className="activity-card">
                  <h4>Đơn thuốc mới</h4>
                  <div className="activity-number">{systemStats?.newPrescriptions || 0}</div>
                  <div className="activity-period">Tuần này</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && <UserManagement />}

        {activeTab === "system" && <SystemStats systemStats={systemStats} />}
      </div>
    </div>
  )
}

export default AdminDashboard
