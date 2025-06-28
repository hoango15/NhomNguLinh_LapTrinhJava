"use client"

import { useState, useEffect } from "react"
import { medicationAPI, arvRegimenAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import ARVRegimenForm from "./ARVRegimenForm"
import "./ARVRegimenList.css"

const ARVRegimenList = () => {
  const [regimens, setRegimens] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRegimen, setEditingRegimen] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [targetGroupFilter, setTargetGroupFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const regimensRes = await arvRegimenAPI.getAll()
      setRegimens(regimensRes.data)

      const medicationsRes = await medicationAPI.getAll()
      setMedications(medicationsRes.data.filter((med) => med.category === "ARV"))
    } catch (error) {
      toast.error("Không thể tải dữ liệu phác đồ ARV")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phác đồ này?")) {
      try {
        await arvRegimenAPI.delete(id)
        setRegimens((prev) => prev.filter((r) => r.id !== id))
        toast.success("Xóa phác đồ thành công")
      } catch (error) {
        toast.error("Không thể xóa phác đồ")
      }
    }
  }

  const handleEdit = (regimen) => {
    setEditingRegimen(regimen)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingRegimen(null)
    fetchData()
  }

  const getTargetGroupText = (group) => {
    const groups = {
      ADULT: "Người lớn",
      PEDIATRIC: "Trẻ em",
      PREGNANT: "Phụ nữ có thai",
      ELDERLY: "Người cao tuổi",
      RENAL_IMPAIRMENT: "Suy thận",
      HEPATIC_IMPAIRMENT: "Suy gan",
    }
    return groups[group] || group
  }

  const filteredRegimens = regimens.filter((regimen) => {
    const matchesSearch =
      regimen.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regimen.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTargetGroup = targetGroupFilter === "all" || regimen.target_group === targetGroupFilter

    return matchesSearch && matchesTargetGroup
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="arv-regimen-list">
      <div className="page-header">
        <h1 className="page-title">Phác đồ ARV</h1>
        {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm phác đồ
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm phác đồ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={targetGroupFilter}
          onChange={(e) => setTargetGroupFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả đối tượng</option>
          <option value="ADULT">Người lớn</option>
          <option value="PEDIATRIC">Trẻ em</option>
          <option value="PREGNANT">Phụ nữ có thai</option>
          <option value="ELDERLY">Người cao tuổi</option>
          <option value="RENAL_IMPAIRMENT">Suy thận</option>
          <option value="HEPATIC_IMPAIRMENT">Suy gan</option>
        </select>
      </div>

      <div className="regimens-grid">
        {filteredRegimens.map((regimen) => (
          <div key={regimen.id} className="regimen-card">
            <div className="regimen-header">
              <h3 className="regimen-name">{regimen.name}</h3>
              <div className="regimen-badges">
                <span className={`target-badge ${regimen.target_group?.toLowerCase()}`}>
                  {getTargetGroupText(regimen.target_group)}
                </span>
                <span className={`status-badge ${regimen.is_active ? "active" : "inactive"}`}>
                  {regimen.is_active ? "Đang sử dụng" : "Ngừng sử dụng"}
                </span>
              </div>
            </div>

            <p className="regimen-description">{regimen.description}</p>

            <div className="medications-section">
              <h4>Thành phần thuốc:</h4>
              <div className="medications-list">
                {regimen.medications?.map((med, index) => (
                  <div key={index} className="medication-item">
                    <div className="medication-name">{med.name}</div>
                    <div className="medication-details">
                      <span className="dosage">{med.dosage}</span>
                      <span className="frequency">{med.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {regimen.notes && (
              <div className="regimen-notes">
                <strong>Ghi chú:</strong> {regimen.notes}
              </div>
            )}

            <div className="regimen-actions">
              <button
                className="btn btn-outline"
                onClick={() => (window.location.href = `/arv-regimens/${regimen.id}`)}
              >
                Chi tiết
              </button>
              {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
                <>
                  <button className="btn btn-secondary" onClick={() => handleEdit(regimen)}>
                    Sửa
                  </button>
                  {user?.role === "ADMIN" && (
                    <button className="btn btn-danger" onClick={() => handleDelete(regimen.id)}>
                      Xóa
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRegimens.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>Không tìm thấy phác đồ nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}

      {showForm && <ARVRegimenForm regimen={editingRegimen} medications={medications} onClose={handleFormClose} />}
    </div>
  )
}

export default ARVRegimenList
