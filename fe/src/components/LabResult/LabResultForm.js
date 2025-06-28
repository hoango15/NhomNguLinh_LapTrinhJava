"use client"

import { useState, useEffect } from "react"
import { labResultAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./LabResultForm.css"

const LabResultForm = ({ result, patients, onClose }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    testType: "CD4_COUNT",
    testDate: "",
    result: "",
    unit: "",
    referenceRange: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const testTypes = [
    { value: "CD4_COUNT", label: "CD4 Count", unit: "cells/μL", reference: "500-1600" },
    { value: "VIRAL_LOAD", label: "Viral Load", unit: "copies/mL", reference: "<50" },
    { value: "COMPLETE_BLOOD_COUNT", label: "Công thức máu", unit: "", reference: "" },
    { value: "LIVER_FUNCTION", label: "Chức năng gan", unit: "U/L", reference: "" },
    { value: "KIDNEY_FUNCTION", label: "Chức năng thận", unit: "mg/dL", reference: "" },
    { value: "LIPID_PROFILE", label: "Lipid máu", unit: "mg/dL", reference: "" },
    { value: "GLUCOSE", label: "Đường huyết", unit: "mg/dL", reference: "70-100" },
    { value: "OTHER", label: "Khác", unit: "", reference: "" },
  ]

  useEffect(() => {
    if (result) {
      setFormData({
        patientId: result.patientId || "",
        testType: result.testType || "CD4_COUNT",
        testDate: result.testDate ? result.testDate.split("T")[0] : "",
        result: result.result || "",
        unit: result.unit || "",
        referenceRange: result.referenceRange || "",
        notes: result.notes || "",
      })
    }
  }, [result])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTestTypeChange = (e) => {
    const selectedType = testTypes.find((type) => type.value === e.target.value)
    setFormData((prev) => ({
      ...prev,
      testType: e.target.value,
      unit: selectedType?.unit || "",
      referenceRange: selectedType?.reference || "",
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (result) {
        await labResultAPI.update(result.id, formData)
        toast.success("Cập nhật kết quả xét nghiệm thành công")
      } else {
        await labResultAPI.create(formData)
        toast.success("Thêm kết quả xét nghiệm thành công")
      }
      onClose()
    } catch (error) {
      toast.error(result ? "Không thể cập nhật kết quả" : "Không thể thêm kết quả")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{result ? "Sửa kết quả xét nghiệm" : "Thêm kết quả xét nghiệm"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lab-result-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="patientId">Bệnh nhân *</label>
              <select id="patientId" name="patientId" value={formData.patientId} onChange={handleChange} required>
                <option value="">Chọn bệnh nhân</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName} - {patient.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="testType">Loại xét nghiệm *</label>
              <select id="testType" name="testType" value={formData.testType} onChange={handleTestTypeChange} required>
                {testTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="testDate">Ngày xét nghiệm *</label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={formData.testDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="result">Kết quả *</label>
              <input
                type="text"
                id="result"
                name="result"
                value={formData.result}
                onChange={handleChange}
                required
                placeholder="Nhập kết quả xét nghiệm"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Đơn vị</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Ví dụ: mg/dL, cells/μL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="referenceRange">Giá trị tham chiếu</label>
              <input
                type="text"
                id="referenceRange"
                name="referenceRange"
                value={formData.referenceRange}
                onChange={handleChange}
                placeholder="Ví dụ: 70-100, <50"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Ghi chú thêm về kết quả xét nghiệm..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : result ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LabResultForm
