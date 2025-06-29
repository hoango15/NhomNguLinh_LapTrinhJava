"use client"

import { useState, useEffect } from "react"
import { sideEffectAPI, medicationAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import SideEffectForm from "./SideEffectForm"
import "./SideEffectTracker.css"

const SideEffectTracker = () => {
  const [sideEffects, setSideEffects] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSideEffect, setEditingSideEffect] = useState(null)
  const [severityFilter, setSeverityFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sideEffectsRes, medicationsRes] = await Promise.all([
        sideEffectAPI.getByPatient(user.id),
        medicationAPI.getAll(),
      ])
      setSideEffects(sideEffectsRes.data)
      setMedications(medicationsRes.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu tác dụng phụ")
      console.error("Fetch side effects error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) {
      try {
        await sideEffectAPI.delete(id)
        toast.success("Xóa ghi chú thành công")
        fetchData()
      } catch (error) {
        toast.error("Không thể xóa ghi chú")
      }
    }
  }

  const handleEdit = (sideEffect) => {
    setEditingSideEffect(sideEffect)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingSideEffect(null)
    fetchData()
  }

  const getSeverityText = (severity) => {
    const severities = {
      MILD: "Nhẹ",
      MODERATE: "Vừa",
      SEVERE: "Nặng",
      CRITICAL: "Nghiêm trọng",
    }
    return severities[severity] || severity
  }

  const getSeverityColor = (severity) => {
    const colors = {
      MILD: "success",
      MODERATE: "warning",
      SEVERE: "danger",
      CRITICAL: "critical",
    }
    return colors[severity] || "secondary"
  }

  const filteredSideEffects = sideEffects.filter((sideEffect) => {
    if (severityFilter === "all") return true
    return sideEffect.severity === severityFilter
  })

  const getRecentSideEffects = () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return sideEffects.filter((se) => new Date(se.occurredAt) >= sevenDaysAgo)
  }

  const getMostCommonSideEffects = () => {
    const effectCounts = {}
    sideEffects.forEach((se) => {
      effectCounts[se.effectName] = (effectCounts[se.effectName] || 0) + 1
    })

    return Object.entries(effectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }

  const recentSideEffects = getRecentSideEffects()
  const commonSideEffects = getMostCommonSideEffects()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="side-effect-tracker">
      <div className="page-header">
        <h1 className="page-title">Theo dõi Tác dụng Phụ</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Ghi nhận tác dụng phụ
        </button>
      </div>

      <div className="summary-section">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-number">{sideEffects.length}</div>
              <div className="card-label">Tổng ghi chú</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <div className="card-number">{recentSideEffects.length}</div>
              <div className="card-label">7 ngày qua</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">⚠️</div>
            <div className="card-content">
              <div className="card-number">
                {sideEffects.filter((se) => se.severity === "SEVERE" || se.severity === "CRITICAL").length}
              </div>
              <div className="card-label">Nghiêm trọng</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">💊</div>
            <div className="card-content">
              <div className="card-number">{new Set(sideEffects.map((se) => se.medicationId)).size}</div>
              <div className="card-label">Thuốc liên quan</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-content">
          <div className="section-header">
            <h2>Danh sách Tác dụng Phụ</h2>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="MILD">Nhẹ</option>
              <option value="MODERATE">Vừa</option>
              <option value="SEVERE">Nặng</option>
              <option value="CRITICAL">Nghiêm trọng</option>
            </select>
          </div>

          <div className="side-effects-list">
            {filteredSideEffects.map((sideEffect) => (
              <div key={sideEffect.id} className="side-effect-card">
                <div className="side-effect-header">
                  <h3 className="effect-name">{sideEffect.effectName}</h3>
                  <div className="effect-badges">
                    <span className={`severity-badge ${getSeverityColor(sideEffect.severity)}`}>
                      {getSeverityText(sideEffect.severity)}
                    </span>
                    <span className="date-badge">{new Date(sideEffect.occurredAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>

                <div className="side-effect-info">
                  <div className="info-item">
                    <span className="info-label">Thuốc liên quan:</span>
                    <span className="info-value">{sideEffect.medicationName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Thời gian xảy ra:</span>
                    <span className="info-value">{new Date(sideEffect.occurredAt).toLocaleString("vi-VN")}</span>
                  </div>
                  {sideEffect.duration && (
                    <div className="info-item">
                      <span className="info-label">Thời gian kéo dài:</span>
                      <span className="info-value">{sideEffect.duration}</span>
                    </div>
                  )}
                  {sideEffect.description && (
                    <div className="info-item full-width">
                      <span className="info-label">Mô tả:</span>
                      <span className="info-value">{sideEffect.description}</span>
                    </div>
                  )}
                  {sideEffect.actionTaken && (
                    <div className="info-item full-width">
                      <span className="info-label">Biện pháp đã thực hiện:</span>
                      <span className="info-value">{sideEffect.actionTaken}</span>
                    </div>
                  )}
                </div>

                <div className="side-effect-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(sideEffect)}>
                    Sửa
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(sideEffect.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSideEffects.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">😊</div>
              <h3>Không có tác dụng phụ nào</h3>
              <p>Điều này là tín hiệu tốt! Hãy tiếp tục theo dõi sức khỏe của bạn.</p>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Tác dụng phụ thường gặp</h3>
            <div className="common-effects">
              {commonSideEffects.map((effect) => (
                <div key={effect.name} className="common-effect-item">
                  <span className="effect-name">{effect.name}</span>
                  <span className="effect-count">{effect.count} lần</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Lời khuyên</h3>
            <div className="tips">
              <div className="tip-item">
                <div className="tip-icon">📝</div>
                <p>Ghi chú chi tiết về tác dụng phụ để bác sĩ có thể tư vấn tốt hơn</p>
              </div>
              <div className="tip-item">
                <div className="tip-icon">⏰</div>
                <p>Ghi nhận ngay khi có tác dụng phụ để không quên chi tiết</p>
              </div>
              <div className="tip-item">
                <div className="tip-icon">🚨</div>
                <p>Liên hệ bác sĩ ngay nếu có tác dụng phụ nghiêm trọng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <SideEffectForm sideEffect={editingSideEffect} medications={medications} onClose={handleFormClose} />
      )}
    </div>
  )
}

export default SideEffectTracker
