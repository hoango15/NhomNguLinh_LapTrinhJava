"use client"

import { useState, useEffect } from "react"
import { treatmentPlanAPI, patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import TreatmentPlanForm from "./TreatmentPlanForm"
import "./TreatmentPlanList.css"

const TreatmentPlanList = () => {
  const [treatmentPlans, setTreatmentPlans] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      let plansResponse
      if (user?.role === "PATIENT") {
        plansResponse = await treatmentPlanAPI.getByPatient(user.id)
      } else {
        plansResponse = await treatmentPlanAPI.getAll()
      }

      const patientsResponse = await patientAPI.getAll()

      setTreatmentPlans(plansResponse.data)
      setPatients(patientsResponse.data)
    } catch (error) {
      toast.error("Không thể tải kế hoạch điều trị")
      console.error("Fetch treatment plans error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kế hoạch điều trị này?")) {
      try {
        await treatmentPlanAPI.delete(id)
        toast.success("Xóa kế hoạch điều trị thành công")
        fetchData()
      } catch (error) {
        toast.error("Không thể xóa kế hoạch điều trị")
      }
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPlan(null)
    fetchData()
  }

  const getStatusText = (status) => {
    const statuses = {
      ACTIVE: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      PAUSED: "Tạm dừng",
      CANCELLED: "Đã hủy",
    }
    return statuses[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: "success",
      COMPLETED: "info",
      PAUSED: "warning",
      CANCELLED: "danger",
    }
    return colors[status] || "secondary"
  }

  const filteredPlans = treatmentPlans.filter((plan) => {
    const matchesPatient = selectedPatient === "" || plan.patientId === Number.parseInt(selectedPatient)
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    return matchesPatient && matchesStatus
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="treatment-plan-list">
      <div className="page-header">
        <h1 className="page-title">Kế hoạch Điều trị</h1>
        {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Tạo kế hoạch điều trị
          </button>
        )}
      </div>

      <div className="filters">
        {user?.role !== "PATIENT" && (
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả bệnh nhân</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </select>
        )}

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang thực hiện</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="PAUSED">Tạm dừng</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <div className="treatment-plans-grid">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="treatment-plan-card">
            <div className="plan-header">
              <h3 className="plan-title">{plan.title}</h3>
              <span className={`status-badge ${getStatusColor(plan.status)}`}>{getStatusText(plan.status)}</span>
            </div>

            <div className="plan-info">
              <div className="info-item">
                <span className="info-label">Bệnh nhân:</span>
                <span className="info-value">{plan.patientName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bác sĩ phụ trách:</span>
                <span className="info-value">{plan.doctorName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày bắt đầu:</span>
                <span className="info-value">{new Date(plan.startDate).toLocaleDateString("vi-VN")}</span>
              </div>
              {plan.endDate && (
                <div className="info-item">
                  <span className="info-label">Ngày kết thúc:</span>
                  <span className="info-value">{new Date(plan.endDate).toLocaleDateString("vi-VN")}</span>
                </div>
              )}
              {plan.description && (
                <div className="info-item full-width">
                  <span className="info-label">Mô tả:</span>
                  <span className="info-value">{plan.description}</span>
                </div>
              )}
            </div>

            <div className="plan-items">
              <h4>Các mục trong kế hoạch:</h4>
              <div className="items-list">
                {plan.items?.slice(0, 3).map((item, index) => (
                  <div key={index} className="plan-item">
                    <span className="item-title">{item.title}</span>
                    <span className={`item-status ${item.status?.toLowerCase()}`}>
                      {item.status === "COMPLETED" ? "✅" : item.status === "IN_PROGRESS" ? "🔄" : "⏳"}
                    </span>
                  </div>
                )) || <span className="no-items">Chưa có mục nào</span>}
                {plan.items?.length > 3 && <div className="more-items">+{plan.items.length - 3} mục khác</div>}
              </div>
            </div>

            <div className="plan-progress">
              <div className="progress-label">Tiến độ: {plan.completionPercentage || 0}%</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${plan.completionPercentage || 0}%` }}></div>
              </div>
            </div>

            <div className="plan-actions">
              <button
                className="btn btn-outline"
                onClick={() => (window.location.href = `/treatment-plans/${plan.id}`)}
              >
                Chi tiết
              </button>
              {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
                <>
                  <button className="btn btn-secondary" onClick={() => handleEdit(plan)}>
                    Sửa
                  </button>
                  {user?.role === "ADMIN" && (
                    <button className="btn btn-danger" onClick={() => handleDelete(plan.id)}>
                      Xóa
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Không có kế hoạch điều trị nào</h3>
          <p>
            {user?.role === "PATIENT"
              ? "Bạn chưa có kế hoạch điều trị nào. Hãy liên hệ với bác sĩ để được tư vấn."
              : "Chưa có kế hoạch điều trị nào được tạo."}
          </p>
        </div>
      )}

      {showForm && <TreatmentPlanForm plan={editingPlan} patients={patients} onClose={handleFormClose} />}
    </div>
  )
}

export default TreatmentPlanList
