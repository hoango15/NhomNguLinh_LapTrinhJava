"use client"

import { useState, useEffect } from "react"
import { arvRegimenAPI, medicationAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./ARVRegimenManagement.css"

const ARVRegimenManagement = () => {
  const [regimens, setRegimens] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRegimen, setEditingRegimen] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [lineFilter, setLineFilter] = useState("all")
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    line: "FIRST_LINE",
    isActive: true,
    sideEffects: "",
    contraindications: "",
    monitoringRequirements: "",
    medications: [],
  })

  useEffect(() => {
    fetchRegimens()
    fetchMedications()
  }, [])

  const fetchRegimens = async () => {
    try {
      const response = await arvRegimenAPI.getAll()
      setRegimens(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách phác đồ ARV")
      console.error("Fetch regimens error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMedications = async () => {
    try {
      const response = await medicationAPI.getAll()
      setMedications(response.data.filter((med) => med.type === "ARV"))
    } catch (error) {
      console.error("Fetch medications error:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRegimen) {
        await arvRegimenAPI.update(editingRegimen.id, formData)
        toast.success("Cập nhật phác đồ ARV thành công")
      } else {
        await arvRegimenAPI.create(formData)
        toast.success("Tạo phác đồ ARV thành công")
      }
      handleFormClose()
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu phác đồ ARV")
      console.error("Save regimen error:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phác đồ ARV này?")) {
      try {
        await arvRegimenAPI.delete(id)
        toast.success("Xóa phác đồ ARV thành công")
        fetchRegimens()
      } catch (error) {
        toast.error("Không thể xóa phác đồ ARV")
      }
    }
  }

  const handleEdit = (regimen) => {
    setEditingRegimen(regimen)
    setFormData({
      name: regimen.name,
      description: regimen.description,
      line: regimen.line,
      isActive: regimen.isActive,
      sideEffects: regimen.sideEffects || "",
      contraindications: regimen.contraindications || "",
      monitoringRequirements: regimen.monitoringRequirements || "",
      medications: regimen.medications || [],
    })
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingRegimen(null)
    setFormData({
      name: "",
      description: "",
      line: "FIRST_LINE",
      isActive: true,
      sideEffects: "",
      contraindications: "",
      monitoringRequirements: "",
      medications: [],
    })
    fetchRegimens()
  }

  const addMedicationToRegimen = (medicationId) => {
    const medication = medications.find((m) => m.id === Number.parseInt(medicationId))
    if (medication && !formData.medications.find((m) => m.medicationId === medication.id)) {
      setFormData((prev) => ({
        ...prev,
        medications: [
          ...prev.medications,
          {
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: "",
            frequency: "",
            instructions: "",
          },
        ],
      }))
    }
  }

  const removeMedicationFromRegimen = (medicationId) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.medicationId !== medicationId),
    }))
  }

  const updateMedicationInRegimen = (medicationId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((m) => (m.medicationId === medicationId ? { ...m, [field]: value } : m)),
    }))
  }

  const getLineText = (line) => {
    const lines = {
      FIRST_LINE: "Hàng đầu",
      SECOND_LINE: "Hàng hai",
      THIRD_LINE: "Hàng ba",
      SALVAGE: "Cứu vãn",
    }
    return lines[line] || line
  }

  const getLineBadgeClass = (line) => {
    const classes = {
      FIRST_LINE: "line-first",
      SECOND_LINE: "line-second",
      THIRD_LINE: "line-third",
      SALVAGE: "line-salvage",
    }
    return classes[line] || "line-default"
  }

  const filteredRegimens = regimens.filter((regimen) => {
    const matchesSearch =
      regimen.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regimen.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLine = lineFilter === "all" || regimen.line === lineFilter
    return matchesSearch && matchesLine
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="arv-regimen-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý Phác đồ ARV</h1>
        {user?.role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm phác đồ ARV
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
        <select value={lineFilter} onChange={(e) => setLineFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả hàng điều trị</option>
          <option value="FIRST_LINE">Hàng đầu</option>
          <option value="SECOND_LINE">Hàng hai</option>
          <option value="THIRD_LINE">Hàng ba</option>
          <option value="SALVAGE">Cứu vãn</option>
        </select>
      </div>

      <div className="regimens-grid">
        {filteredRegimens.map((regimen) => (
          <div key={regimen.id} className="regimen-card">
            <div className="regimen-header">
              <h3 className="regimen-name">{regimen.name}</h3>
              <div className="regimen-badges">
                <span className={`line-badge ${getLineBadgeClass(regimen.line)}`}>{getLineText(regimen.line)}</span>
                <span className={`status-badge ${regimen.isActive ? "active" : "inactive"}`}>
                  {regimen.isActive ? "Đang sử dụng" : "Ngừng sử dụng"}
                </span>
              </div>
            </div>

            <p className="regimen-description">{regimen.description}</p>

            <div className="regimen-medications">
              <h4>Thuốc trong phác đồ:</h4>
              <ul>
                {regimen.medications?.map((med) => (
                  <li key={med.id}>
                    <strong>{med.medicationName}</strong> - {med.dosage} - {med.frequency}
                    {med.instructions && <div className="med-instructions">{med.instructions}</div>}
                  </li>
                ))}
              </ul>
            </div>

            {regimen.sideEffects && (
              <div className="regimen-side-effects">
                <h4>Tác dụng phụ:</h4>
                <p>{regimen.sideEffects}</p>
              </div>
            )}

            {regimen.contraindications && (
              <div className="regimen-contraindications">
                <h4>Chống chỉ định:</h4>
                <p>{regimen.contraindications}</p>
              </div>
            )}

            {user?.role === "ADMIN" && (
              <div className="regimen-actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(regimen)}>
                  Sửa
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(regimen.id)}>
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRegimens.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💊</div>
          <h3>Không tìm thấy phác đồ ARV nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRegimen ? "Sửa phác đồ ARV" : "Thêm phác đồ ARV"}</h2>
              <button className="close-btn" onClick={handleFormClose}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="regimen-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên phác đồ *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hàng điều trị *</label>
                  <select
                    value={formData.line}
                    onChange={(e) => setFormData((prev) => ({ ...prev, line: e.target.value }))}
                    required
                  >
                    <option value="FIRST_LINE">Hàng đầu</option>
                    <option value="SECOND_LINE">Hàng hai</option>
                    <option value="THIRD_LINE">Hàng ba</option>
                    <option value="SALVAGE">Cứu vãn</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Thuốc trong phác đồ</label>
                <div className="medication-selector">
                  <select onChange={(e) => addMedicationToRegimen(e.target.value)} value="">
                    <option value="">Chọn thuốc để thêm</option>
                    {medications.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selected-medications">
                  {formData.medications.map((med) => (
                    <div key={med.medicationId} className="medication-item">
                      <div className="medication-header">
                        <strong>{med.medicationName}</strong>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeMedicationFromRegimen(med.medicationId)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="medication-details">
                        <input
                          type="text"
                          placeholder="Liều dùng"
                          value={med.dosage}
                          onChange={(e) => updateMedicationInRegimen(med.medicationId, "dosage", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Tần suất"
                          value={med.frequency}
                          onChange={(e) => updateMedicationInRegimen(med.medicationId, "frequency", e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Hướng dẫn sử dụng"
                          value={med.instructions}
                          onChange={(e) => updateMedicationInRegimen(med.medicationId, "instructions", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tác dụng phụ</label>
                <textarea
                  value={formData.sideEffects}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sideEffects: e.target.value }))}
                  rows="3"
                  placeholder="Mô tả các tác dụng phụ có thể xảy ra..."
                />
              </div>

              <div className="form-group">
                <label>Chống chỉ định</label>
                <textarea
                  value={formData.contraindications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contraindications: e.target.value }))}
                  rows="3"
                  placeholder="Các trường hợp không nên sử dụng phác đồ này..."
                />
              </div>

              <div className="form-group">
                <label>Yêu cầu giám sát</label>
                <textarea
                  value={formData.monitoringRequirements}
                  onChange={(e) => setFormData((prev) => ({ ...prev, monitoringRequirements: e.target.value }))}
                  rows="3"
                  placeholder="Các xét nghiệm và theo dõi cần thiết..."
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Đang sử dụng
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleFormClose}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRegimen ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ARVRegimenManagement
