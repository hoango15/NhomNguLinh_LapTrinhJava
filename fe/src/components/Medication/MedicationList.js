"use client"

import { useState, useEffect } from "react"
import { medicationAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import MedicationForm from "./MedicationForm"
import "./MedicationList.css"

const MedicationList = () => {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      const response = await medicationAPI.getAll()
      setMedications(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách thuốc")
      console.error("Fetch medications error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thuốc này?")) {
      try {
        await medicationAPI.delete(id)
        toast.success("Xóa thuốc thành công")
        fetchMedications()
      } catch (error) {
        toast.error("Không thể xóa thuốc")
      }
    }
  }

  const handleEdit = (medication) => {
    setEditingMedication(medication)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMedication(null)
    fetchMedications()
  }

  const getCategoryText = (category) => {
    const categories = {
      ARV: "Thuốc ARV",
      ANTIBIOTIC: "Kháng sinh",
      ANTIFUNGAL: "Kháng nấm",
      ANTIVIRAL: "Kháng virus",
      SUPPLEMENT: "Thực phẩm bổ sung",
      OTHER: "Khác",
    }
    return categories[category] || category
  }

  const filteredMedications = medications.filter((medication) => {
    const matchesSearch =
      medication.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || medication.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="medication-list">
      <div className="page-header">
        <h1 className="page-title">Quản lý Thuốc</h1>
        {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm thuốc
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm thuốc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả danh mục</option>
          <option value="ARV">Thuốc ARV</option>
          <option value="ANTIBIOTIC">Kháng sinh</option>
          <option value="ANTIFUNGAL">Kháng nấm</option>
          <option value="ANTIVIRAL">Kháng virus</option>
          <option value="SUPPLEMENT">Thực phẩm bổ sung</option>
          <option value="OTHER">Khác</option>
        </select>
      </div>

      <div className="medications-grid">
        {filteredMedications.map((medication) => (
          <div key={medication.id} className="medication-card">
            <div className="medication-header">
              <h3 className="medication-name">{medication.name}</h3>
              <span className={`category-badge ${medication.category?.toLowerCase()}`}>
                {getCategoryText(medication.category)}
              </span>
            </div>

            <div className="medication-info">
              <div className="info-item">
                <span className="info-label">Tên chung:</span>
                <span className="info-value">{medication.genericName || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Nồng độ:</span>
                <span className="info-value">{medication.strength || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Dạng bào chế:</span>
                <span className="info-value">{medication.dosageForm || "N/A"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Nhà sản xuất:</span>
                <span className="info-value">{medication.manufacturer || "N/A"}</span>
              </div>
              {medication.sideEffects && (
                <div className="info-item full-width">
                  <span className="info-label">Tác dụng phụ:</span>
                  <span className="info-value">{medication.sideEffects}</span>
                </div>
              )}
              {medication.contraindications && (
                <div className="info-item full-width">
                  <span className="info-label">Chống chỉ định:</span>
                  <span className="info-value">{medication.contraindications}</span>
                </div>
              )}
            </div>

            <div className="medication-actions">
              {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
                <>
                  <button className="btn btn-secondary" onClick={() => handleEdit(medication)}>
                    Sửa
                  </button>
                  {user?.role === "ADMIN" && (
                    <button className="btn btn-danger" onClick={() => handleDelete(medication.id)}>
                      Xóa
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <div className="empty-state">
          <p>Không tìm thấy thuốc nào</p>
        </div>
      )}

      {showForm && <MedicationForm medication={editingMedication} onClose={handleFormClose} />}
    </div>
  )
}

export default MedicationList
