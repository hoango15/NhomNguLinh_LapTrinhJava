"use client"

import { useState, useEffect } from "react"
import { prescriptionAPI, medicationAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import PrescriptionForm from "./PrescriptionForm"
import "./PrescriptionList.css"

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prescriptionsRes, medicationsRes] = await Promise.all([prescriptionAPI.getAll(), medicationAPI.getAll()])
      setPrescriptions(prescriptionsRes.data)
      setMedications(medicationsRes.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu")
      console.error("Fetch data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn thuốc này?")) {
      try {
        await prescriptionAPI.delete(id)
        toast.success("Xóa đơn thuốc thành công")
        fetchData()
      } catch (error) {
        toast.error("Không thể xóa đơn thuốc")
      }
    }
  }

  const handleEdit = (prescription) => {
    setEditingPrescription(prescription)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPrescription(null)
    fetchData()
  }

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="prescription-list">
      <div className="page-header">
        <h1 className="page-title">Quản lý Đơn thuốc</h1>
        {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm đơn thuốc
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo bệnh nhân hoặc bác sĩ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="prescriptions-grid">
        {filteredPrescriptions.map((prescription) => (
          <div key={prescription.id} className="prescription-card">
            <div className="prescription-header">
              <h3 className="prescription-title">Đơn thuốc #{prescription.id}</h3>
              <span className="prescription-date">
                {new Date(prescription.prescriptionDate).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="prescription-info">
              <div className="info-item">
                <span className="info-label">Bệnh nhân:</span>
                <span className="info-value">{prescription.patientName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bác sĩ kê đơn:</span>
                <span className="info-value">{prescription.doctorName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày bắt đầu:</span>
                <span className="info-value">
                  {prescription.startDate ? new Date(prescription.startDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Ngày kết thúc:</span>
                <span className="info-value">
                  {prescription.endDate ? new Date(prescription.endDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              {prescription.notes && (
                <div className="info-item">
                  <span className="info-label">Hướng dẫn:</span>
                  <span className="info-value">{prescription.notes}</span>
                </div>
              )}
            </div>

            <div className="prescription-medications">
              <h4>Thuốc được kê:</h4>
              <div className="medications-list">
                {prescription.medications?.map((med, index) => (
                  <div key={index} className="medication-item">
                    <span className="medication-name">{med.medicationName}</span>
                    <span className="medication-dosage">
                      {med.dosage} - {med.frequency}
                    </span>
                  </div>
                )) || <span className="no-medications">Chưa có thuốc</span>}
              </div>
            </div>

            <div className="prescription-actions">
              {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
                <>
                  <button className="btn btn-secondary" onClick={() => handleEdit(prescription)}>
                    Sửa
                  </button>
                  {user?.role === "ADMIN" && (
                    <button className="btn btn-danger" onClick={() => handleDelete(prescription.id)}>
                      Xóa
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="empty-state">
          <p>Không tìm thấy đơn thuốc nào</p>
        </div>
      )}

      {showForm && (
        <PrescriptionForm prescription={editingPrescription} medications={medications} onClose={handleFormClose} />
      )}
    </div>
  )
}

export default PrescriptionList
