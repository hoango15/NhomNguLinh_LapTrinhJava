"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import "./ARVRegimenForm.css"

const ARVRegimenForm = ({ regimen, medications, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetGroup: "ADULT",
    medications: [],
    notes: "",
    isActive: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (regimen) {
      setFormData({
        name: regimen.name || "",
        description: regimen.description || "",
        targetGroup: regimen.targetGroup || "ADULT",
        medications: regimen.medications || [],
        notes: regimen.notes || "",
        isActive: regimen.isActive !== undefined ? regimen.isActive : true,
      })
    }
  }, [regimen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medicationId: "",
          name: "",
          dosage: "",
          frequency: "",
          instructions: "",
        },
      ],
    }))
  }

  const removeMedication = (index) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }))
  }

  const updateMedication = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) => {
        if (i === index) {
          const updatedMed = { ...med, [field]: value }
          // Auto-fill medication name when selecting from dropdown
          if (field === "medicationId" && value) {
            const selectedMed = medications.find((m) => m.id === Number.parseInt(value))
            if (selectedMed) {
              updatedMed.name = selectedMed.name
            }
          }
          return updatedMed
        }
        return med
      }),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In real app:
      // if (regimen) {
      //   await arvRegimenAPI.update(regimen.id, formData)
      // } else {
      //   await arvRegimenAPI.create(formData)
      // }

      toast.success(regimen ? "Cập nhật phác đồ thành công" : "Thêm phác đồ thành công")
      onClose()
    } catch (error) {
      toast.error(regimen ? "Không thể cập nhật phác đồ" : "Không thể thêm phác đồ")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content extra-large">
        <div className="modal-header">
          <h2>{regimen ? "Sửa phác đồ ARV" : "Thêm phác đồ ARV mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="arv-regimen-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Tên phác đồ *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: TDF + 3TC + DTG"
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetGroup">Đối tượng sử dụng *</label>
                <select
                  id="targetGroup"
                  name="targetGroup"
                  value={formData.targetGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="ADULT">Người lớn</option>
                  <option value="PEDIATRIC">Trẻ em</option>
                  <option value="PREGNANT">Phụ nữ có thai</option>
                  <option value="ELDERLY">Người cao tuổi</option>
                  <option value="RENAL_IMPAIRMENT">Suy thận</option>
                  <option value="HEPATIC_IMPAIRMENT">Suy gan</option>
                </select>
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
                placeholder="Mô tả về phác đồ điều trị..."
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Thành phần thuốc</h3>
              <button type="button" className="btn btn-outline" onClick={addMedication}>
                + Thêm thuốc
              </button>
            </div>

            {formData.medications.map((medication, index) => (
              <div key={index} className="medication-form">
                <div className="medication-header">
                  <h4>Thuốc #{index + 1}</h4>
                  <button type="button" className="btn btn-danger-outline" onClick={() => removeMedication(index)}>
                    Xóa
                  </button>
                </div>

                <div className="medication-grid">
                  <div className="form-group">
                    <label>Chọn thuốc *</label>
                    <select
                      value={medication.medicationId || ""}
                      onChange={(e) => updateMedication(index, "medicationId", e.target.value)}
                      required
                    >
                      <option value="">Chọn thuốc</option>
                      {medications.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.name} - {med.strength}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tên thuốc</label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                      placeholder="Tên thuốc sẽ tự động điền"
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Liều dùng *</label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      placeholder="Ví dụ: 300mg, 50mg"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tần suất *</label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      placeholder="Ví dụ: 1 lần/ngày, 2 lần/ngày"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hướng dẫn sử dụng</label>
                  <textarea
                    value={medication.instructions}
                    onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                    rows="2"
                    placeholder="Hướng dẫn cụ thể cho thuốc này..."
                  />
                </div>
              </div>
            ))}

            {formData.medications.length === 0 && (
              <div className="empty-medications">
                <p>Chưa có thuốc nào được thêm</p>
                <button type="button" className="btn btn-primary" onClick={addMedication}>
                  Thêm thuốc đầu tiên
                </button>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Ghi chú và cài đặt</h3>
            <div className="form-group">
              <label htmlFor="notes">Ghi chú quan trọng</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Ghi chú về chống chỉ định, tác dụng phụ, lưu ý đặc biệt..."
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                <span className="checkmark"></span>
                Phác đồ đang được sử dụng
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : regimen ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ARVRegimenForm
