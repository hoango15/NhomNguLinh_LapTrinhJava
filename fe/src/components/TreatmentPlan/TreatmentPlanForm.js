"use client"

import { useState, useEffect } from "react"
import { treatmentPlanAPI, patientAPI, medicationAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./TreatmentPlanForm.css"

const TreatmentPlanForm = ({ treatmentPlan, onClose }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    planName: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    goals: "",
    notes: "",
    items: [],
  })
  const [patients, setPatients] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchData()

    if (treatmentPlan) {
      setFormData({
        patientId: treatmentPlan.patientId || "",
        planName: treatmentPlan.planName || "",
        description: treatmentPlan.description || "",
        startDate: treatmentPlan.startDate ? treatmentPlan.startDate.split("T")[0] : "",
        endDate: treatmentPlan.endDate ? treatmentPlan.endDate.split("T")[0] : "",
        status: treatmentPlan.status || "ACTIVE",
        goals: treatmentPlan.goals || "",
        notes: treatmentPlan.notes || "",
        items: treatmentPlan.items || [],
      })
    }
  }, [treatmentPlan])

  const fetchData = async () => {
    try {
      const [patientsRes, medicationsRes] = await Promise.all([patientAPI.getAll(), medicationAPI.getAll()])
      setPatients(patientsRes.data)
      setMedications(medicationsRes.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addTreatmentItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemType: "MEDICATION",
          title: "",
          description: "",
          medicationId: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
          isCompleted: false,
        },
      ],
    }))
  }

  const removeTreatmentItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateTreatmentItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        doctorId: user.id,
      }

      if (treatmentPlan) {
        await treatmentPlanAPI.update(treatmentPlan.id, submitData)
        toast.success("Cập nhật kế hoạch điều trị thành công")
      } else {
        await treatmentPlanAPI.create(submitData)
        toast.success("Tạo kế hoạch điều trị thành công")
      }
      onClose()
    } catch (error) {
      toast.error(treatmentPlan ? "Không thể cập nhật kế hoạch" : "Không thể tạo kế hoạch")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const itemTypes = [
    { value: "MEDICATION", label: "Thuốc" },
    { value: "APPOINTMENT", label: "Lịch hẹn" },
    { value: "LAB_TEST", label: "Xét nghiệm" },
    { value: "LIFESTYLE", label: "Lối sống" },
    { value: "EDUCATION", label: "Giáo dục" },
    { value: "OTHER", label: "Khác" },
  ]

  return (
    <div className="modal-overlay">
      <div className="modal-content extra-large">
        <div className="modal-header">
          <h2>{treatmentPlan ? "Sửa kế hoạch điều trị" : "Tạo kế hoạch điều trị mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="treatment-plan-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
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
                <label htmlFor="planName">Tên kế hoạch *</label>
                <input
                  type="text"
                  id="planName"
                  name="planName"
                  value={formData.planName}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: Kế hoạch điều trị ARV"
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Ngày kết thúc</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="ACTIVE">Đang thực hiện</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="PAUSED">Tạm dừng</option>
                  <option value="CANCELLED">Hủy bỏ</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Mô tả kế hoạch</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Mô tả tổng quan về kế hoạch điều trị..."
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="goals">Mục tiêu điều trị</label>
              <textarea
                id="goals"
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows="3"
                placeholder="Các mục tiêu cần đạt được trong quá trình điều trị..."
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Chi tiết kế hoạch</h3>
              <button type="button" className="btn btn-outline" onClick={addTreatmentItem}>
                + Thêm mục
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="treatment-item-form">
                <div className="item-header">
                  <h4>Mục #{index + 1}</h4>
                  <button type="button" className="btn btn-danger-outline" onClick={() => removeTreatmentItem(index)}>
                    Xóa
                  </button>
                </div>

                <div className="item-grid">
                  <div className="form-group">
                    <label>Loại *</label>
                    <select
                      value={item.itemType}
                      onChange={(e) => updateTreatmentItem(index, "itemType", e.target.value)}
                      required
                    >
                      {itemTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tiêu đề *</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateTreatmentItem(index, "title", e.target.value)}
                      required
                      placeholder="Tên của mục điều trị"
                    />
                  </div>

                  {item.itemType === "MEDICATION" && (
                    <>
                      <div className="form-group">
                        <label>Thuốc</label>
                        <select
                          value={item.medicationId}
                          onChange={(e) => updateTreatmentItem(index, "medicationId", e.target.value)}
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
                          value={item.dosage}
                          onChange={(e) => updateTreatmentItem(index, "dosage", e.target.value)}
                          placeholder="Ví dụ: 1 viên"
                        />
                      </div>

                      <div className="form-group">
                        <label>Tần suất</label>
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={(e) => updateTreatmentItem(index, "frequency", e.target.value)}
                          placeholder="Ví dụ: 2 lần/ngày"
                        />
                      </div>

                      <div className="form-group">
                        <label>Thời gian</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => updateTreatmentItem(index, "duration", e.target.value)}
                          placeholder="Ví dụ: 30 ngày"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateTreatmentItem(index, "description", e.target.value)}
                    rows="2"
                    placeholder="Mô tả chi tiết về mục này..."
                  />
                </div>

                <div className="form-group">
                  <label>Hướng dẫn thực hiện</label>
                  <textarea
                    value={item.instructions}
                    onChange={(e) => updateTreatmentItem(index, "instructions", e.target.value)}
                    rows="2"
                    placeholder="Hướng dẫn cụ thể cho bệnh nhân..."
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={(e) => updateTreatmentItem(index, "isCompleted", e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Đã hoàn thành
                  </label>
                </div>
              </div>
            ))}

            {formData.items.length === 0 && (
              <div className="empty-items">
                <p>Chưa có mục nào trong kế hoạch</p>
                <button type="button" className="btn btn-primary" onClick={addTreatmentItem}>
                  Thêm mục đầu tiên
                </button>
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Ghi chú thêm về kế hoạch điều trị..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : treatmentPlan ? "Cập nhật" : "Tạo kế hoạch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TreatmentPlanForm
