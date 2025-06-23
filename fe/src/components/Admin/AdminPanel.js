"use client"

import { useState, useEffect } from "react"
import { adminAPI, systemAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import UserManagement from "./UserManagement"
import SystemSettings from "../System/SystemSettings"
import DataManagement from "../DataManagement/DataManagement"
import "./AdminPanel.css"

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [systemStats, setSystemStats] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchSystemStats()
    }
  }, [user])

  const fetchSystemStats = async () => {
    try {
      const response = await adminAPI.getSystemStats()
      setSystemStats(response.data)
    } catch (error) {
      console.error("Fetch system stats error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSystemAction = async (action) => {
    try {
      switch (action) {
        case "backup":
          await systemAPI.createBackup()
          toast.success("Tạo backup thành công")
          break
        case "maintenance":
          await systemAPI.toggleMaintenance()
          toast.success("Chuyển đổi chế độ bảo trì thành công")
          break
        case "clearCache":
          await systemAPI.clearCache()
          toast.success("Xóa cache thành công")
          break
        case "restart":
          if (window.confirm("Bạn có chắc chắn muốn khởi động lại hệ thống?")) {
            await systemAPI.restart()
            toast.success("Hệ thống sẽ khởi động lại trong vài phút")
          }
          break
        default:
          break
      }
      fetchSystemStats()
    } catch (error) {
      toast.error(`Không thể thực hiện ${action}`)
    }
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="access-denied">
        <h2>Truy cập bị từ chối</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
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
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Bảng điều khiển Quản trị</h1>
        <div className="admin-actions">
          <button className="btn btn-outline" onClick={() => handleSystemAction("backup")}>
            Tạo Backup
          </button>
          <button className="btn btn-warning" onClick={() => handleSystemAction("maintenance")}>
            Chế độ bảo trì
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Tổng quan
        </button>
        <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          Người dùng
        </button>
        <button className={`tab-btn ${activeTab === "system" ? "active" : ""}`} onClick={() => setActiveTab("system")}>
          Hệ thống
        </button>
        <button className={`tab-btn ${activeTab === "data" ? "active" : ""}`} onClick={() => setActiveTab("data")}>
          Dữ liệu
        </button>
        <button className={`tab-btn ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
          Logs
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "dashboard" && (
          <div className="admin-dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>Tổng người dùng</h3>
                  <div className="stat-number">{systemStats.totalUsers || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏥</div>
                <div className="stat-info">
                  <h3>Bệnh nhân</h3>
                  <div className="stat-number">{systemStats.totalPatients || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍⚕️</div>
                <div className="stat-info">
                  <h3>Bác sĩ</h3>
                  <div className="stat-number">{systemStats.totalDoctors || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>Lịch hẹn hôm nay</h3>
                  <div className="stat-number">{systemStats.todayAppointments || 0}</div>
                </div>
              </div>
            </div>

            <div className="system-health">
              <h3>Tình trạng hệ thống</h3>
              <div className="health-metrics">
                <div className="metric">
                  <span className="metric-label">CPU Usage:</span>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${systemStats.cpuUsage || 0}%` }}></div>
                  </div>
                  <span className="metric-value">{systemStats.cpuUsage || 0}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Memory Usage:</span>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${systemStats.memoryUsage || 0}%` }}></div>
                  </div>
                  <span className="metric-value">{systemStats.memoryUsage || 0}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Disk Usage:</span>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${systemStats.diskUsage || 0}%` }}></div>
                  </div>
                  <span className="metric-value">{systemStats.diskUsage || 0}%</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Thao tác nhanh</h3>
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => handleSystemAction("clearCache")}>
                  Xóa Cache
                </button>
                <button className="btn btn-secondary" onClick={() => handleSystemAction("backup")}>
                  Backup ngay
                </button>
                <button className="btn btn-warning" onClick={() => handleSystemAction("maintenance")}>
                  Bảo trì
                </button>
                <button className="btn btn-danger" onClick={() => handleSystemAction("restart")}>
                  Khởi động lại
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && <UserManagement />}
        {activeTab === "system" && <SystemSettings />}
        {activeTab === "data" && <DataManagement />}

        {activeTab === "logs" && (
          <div className="logs-section">
            <h3>System Logs</h3>
            <div className="logs-container">
              <div className="log-filters">
                <select className="filter-select">
                  <option value="all">Tất cả logs</option>
                  <option value="error">Lỗi</option>
                  <option value="warning">Cảnh báo</option>
                  <option value="info">Thông tin</option>
                </select>
                <input type="date" className="date-filter" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="logs-list">
                {systemStats.recentLogs?.map((log, index) => (
                  <div key={index} className={`log-entry ${log.level}`}>
                    <span className="log-time">{log.timestamp}</span>
                    <span className="log-level">{log.level}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                )) || <div className="no-logs">Không có logs để hiển thị</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
