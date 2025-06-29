"use client"

import { useState, useEffect } from "react"
import { prescriptionAPI, patientAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./PrescriptionForm.css"

const PrescriptionForm = ({ prescription, medications, onClose }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    startDate: "",
    endDate: "",
    notes: "",
    medications: [],
  })
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPatients()
    if (prescription) {
      setFormData({
        patientId: prescription.patientId || "",
        startDate: prescription.startDate ? prescription.startDate.split("T")[0] : "",
        endDate: prescription.endDate ? prescription.endDate.split("T")[0] : "",
        notes: prescription.notes || "",
        medications: prescription.medications || [],
      })
    }
  }, [prescription])

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách bệnh nhân")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medicationId: "",
          dosage: "",
          frequency: "",
          duration: "",
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
      medications: prev.medications.map((med, i) => (i === index ? { ...med, [field]: value } : med)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (prescription) {
        await prescriptionAPI.update(prescription.id, formData)
        toast.success("Cập nhật đơn thuốc thành công")
      } else {
        await prescriptionAPI.create(formData)
        toast.success("Thêm đơn thuốc thành công")
      }
      onClose()
    } catch (error) {
      toast.error(prescription ? "Không thể cập nhật đơn thuốc" : "Không thể thêm đơn thuốc")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{prescription ? "Sửa đơn thuốc" : "Thêm đơn thuốc mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="prescription-form">
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
              <label htmlFor="startDate">Ngày bắt đầu</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Ngày kết thúc</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Hướng dẫn sử dụng</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Hướng dẫn chung về cách sử dụng thuốc..."
            />
          </div>

          <div className="medications-section">
            <div className="section-header">
              <h3>Danh sách thuốc</h3>
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
                    <label>Tên thuốc *</label>
                    <select
                      value={medication.medicationId}
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
                    <label>Liều dùng</label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      placeholder="Ví dụ: 1 viên"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tần suất</label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      placeholder="Ví dụ: 2 lần/ngày"
                    />
                  </div>

                  <div className="form-group">
                    <label>Thời gian</label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, "duration", e.target.value)}
                      placeholder="Ví dụ: 30 ngày"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hướng dẫn riêng</label>
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

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : prescription ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PrescriptionForm
