"use client"

import { useState, useEffect } from "react"
import { medicationReminderAPI, prescriptionAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./ReminderForm.css"

const ReminderForm = ({ reminder, onClose }) => {
  const [formData, setFormData] = useState({
    prescriptionId: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    reminderTimes: [""],
    startDate: "",
    endDate: "",
    isActive: true,
    notes: "",
  })
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchPrescriptions()

    if (reminder) {
      setFormData({
        prescriptionId: reminder.prescriptionId || "",
        medicationName: reminder.medicationName || "",
        dosage: reminder.dosage || "",
        frequency: reminder.frequency || "",
        reminderTimes: reminder.reminderTimes || [""],
        startDate: reminder.startDate ? reminder.startDate.split("T")[0] : "",
        endDate: reminder.endDate ? reminder.endDate.split("T")[0] : "",
        isActive: reminder.isActive !== undefined ? reminder.isActive : true,
        notes: reminder.notes || "",
      })
    }
  }, [reminder])

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionAPI.getByPatient(user.id)
      setPrescriptions(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách đơn thuốc")
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handlePrescriptionChange = (e) => {
    const prescriptionId = e.target.value
    const selectedPrescription = prescriptions.find((p) => p.id === Number.parseInt(prescriptionId))

    setFormData((prev) => ({
      ...prev,
      prescriptionId,
      medicationName: "",
      dosage: "",
      frequency: "",
    }))
  }

  const handleMedicationChange = (e) => {
    const medicationName = e.target.value
    const selectedPrescription = prescriptions.find((p) => p.id === Number.parseInt(formData.prescriptionId))
    const selectedMedication = selectedPrescription?.medications?.find((m) => m.medicationName === medicationName)

    setFormData((prev) => ({
      ...prev,
      medicationName,
      dosage: selectedMedication?.dosage || "",
      frequency: selectedMedication?.frequency || "",
    }))
  }

  const addReminderTime = () => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, ""],
    }))
  }

  const removeReminderTime = (index) => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter((_, i) => i !== index),
    }))
  }

  const updateReminderTime = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      reminderTimes: prev.reminderTimes.map((time, i) => (i === index ? value : time)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        patientId: user.id,
        reminderTimes: formData.reminderTimes.filter((time) => time !== ""),
      }

      if (reminder) {
        await medicationReminderAPI.update(reminder.id, submitData)
        toast.success("Cập nhật nhắc nhở thành công")
      } else {
        await medicationReminderAPI.create(submitData)
        toast.success("Thêm nhắc nhở thành công")
      }
      onClose()
    } catch (error) {
      toast.error(reminder ? "Không thể cập nhật nhắc nhở" : "Không thể thêm nhắc nhở")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedPrescription = prescriptions.find((p) => p.id === Number.parseInt(formData.prescriptionId))

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{reminder ? "Sửa nhắc nhở" : "Thêm nhắc nhở mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reminder-form">
          <div className="form-section">
            <h3>Chọn thuốc</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="prescriptionId">Đơn thuốc *</label>
                <select
                  id="prescriptionId"
                  name="prescriptionId"
                  value={formData.prescriptionId}
                  onChange={handlePrescriptionChange}
                  required
                >
                  <option value="">Chọn đơn thuốc</option>
                  {prescriptions.map((prescription) => (
                    <option key={prescription.id} value={prescription.id}>
                      Đơn thuốc #{prescription.id} -{" "}
                      {new Date(prescription.prescriptionDate).toLocaleDateString("vi-VN")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPrescription && (
                <div className="form-group">
                  <label htmlFor="medicationName">Thuốc *</label>
                  <select
                    id="medicationName"
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleMedicationChange}
                    required
                  >
                    <option value="">Chọn thuốc</option>
                    {selectedPrescription.medications?.map((medication, index) => (
                      <option key={index} value={medication.medicationName}>
                        {medication.medicationName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="dosage">Liều dùng</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  placeholder="Ví dụ: 1 viên"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Tần suất</label>
                <input
                  type="text"
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  placeholder="Ví dụ: 2 lần/ngày"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Thời gian nhắc nhở</h3>
              <button type="button" className="btn btn-outline btn-sm" onClick={addReminderTime}>
                + Thêm giờ
              </button>
            </div>

            <div className="reminder-times">
              {formData.reminderTimes.map((time, index) => (
                <div key={index} className="time-input-group">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateReminderTime(index, e.target.value)}
                    className="time-input"
                    required
                  />
                  {formData.reminderTimes.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeReminderTime(index)}>
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Thời gian hiệu lực</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="startDate">Ngày bắt đầu *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
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
              placeholder="Ghi chú thêm về nhắc nhở..."
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              <span className="checkmark"></span>
              Kích hoạt nhắc nhở
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : reminder ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReminderForm
