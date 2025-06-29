"use client"

import { useState, useEffect } from "react"
import { medicationAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./MedicationForm.css"

const MedicationForm = ({ medication, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    strength: "",
    dosageForm: "",
    category: "ARV",
    manufacturer: "",
    description: "",
    sideEffects: "",
    contraindications: "",
    storageInstructions: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || "",
        genericName: medication.genericName || "",
        strength: medication.strength || "",
        dosageForm: medication.dosageForm || "",
        category: medication.category || "ARV",
        manufacturer: medication.manufacturer || "",
        description: medication.description || "",
        sideEffects: medication.sideEffects || "",
        contraindications: medication.contraindications || "",
        storageInstructions: medication.storageInstructions || "",
        isActive: medication.isActive !== undefined ? medication.isActive : true,
      })
    }
  }, [medication])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (medication) {
        await medicationAPI.update(medication.id, formData)
        toast.success("Cập nhật thuốc thành công")
      } else {
        await medicationAPI.create(formData)
        toast.success("Thêm thuốc thành công")
      }
      onClose()
    } catch (error) {
      toast.error(medication ? "Không thể cập nhật thuốc" : "Không thể thêm thuốc")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{medication ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="medication-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Tên thuốc *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="genericName">Tên chung</label>
                <input
                  type="text"
                  id="genericName"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="strength">Nồng độ</label>
                <input
                  type="text"
                  id="strength"
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  placeholder="Ví dụ: 200mg, 5ml"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dosageForm">Dạng bào chế</label>
                <input
                  type="text"
                  id="dosageForm"
                  name="dosageForm"
                  value={formData.dosageForm}
                  onChange={handleChange}
                  placeholder="Ví dụ: Viên nén, Viên nang"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Danh mục *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                  <option value="ARV">Thuốc ARV</option>
                  <option value="ANTIBIOTIC">Kháng sinh</option>
                  <option value="ANTIFUNGAL">Kháng nấm</option>
                  <option value="ANTIVIRAL">Kháng virus</option>
                  <option value="SUPPLEMENT">Thực phẩm bổ sung</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="manufacturer">Nhà sản xuất</label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Mô tả về thuốc..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin an toàn</h3>
            <div className="form-group">
              <label htmlFor="sideEffects">Tác dụng phụ</label>
              <textarea
                id="sideEffects"
                name="sideEffects"
                value={formData.sideEffects}
                onChange={handleChange}
                rows="3"
                placeholder="Các tác dụng phụ có thể xảy ra..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="contraindications">Chống chỉ định</label>
              <textarea
                id="contraindications"
                name="contraindications"
                value={formData.contraindications}
                onChange={handleChange}
                rows="3"
                placeholder="Các trường hợp chống chỉ định..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="storageInstructions">Hướng dẫn bảo quản</label>
              <textarea
                id="storageInstructions"
                name="storageInstructions"
                value={formData.storageInstructions}
                onChange={handleChange}
                rows="2"
                placeholder="Cách bảo quản thuốc..."
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                <span className="checkmark"></span>
                Thuốc đang được sử dụng
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : medication ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MedicationForm
