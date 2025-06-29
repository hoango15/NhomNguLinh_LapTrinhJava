"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { patientAPI, appointmentAPI, prescriptionAPI, labResultAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./PatientDetail.css"

const PatientDetail = () => {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [labResults, setLabResults] = useState([])
  const [activeTab, setActiveTab] = useState("info")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (id) {
      fetchPatientData()
    }
  }, [id])

  const fetchPatientData = async () => {
    try {
      const [patientRes, appointmentsRes, prescriptionsRes, labResultsRes] = await Promise.all([
        patientAPI.getById(id),
        appointmentAPI.getByPatient(id),
        prescriptionAPI.getByPatient(id),
        labResultAPI.getByPatient(id),
      ])

      setPatient(patientRes.data)
      setAppointments(appointmentsRes.data)
      setPrescriptions(prescriptionsRes.data)
      setLabResults(labResultsRes.data)
    } catch (error) {
      toast.error("Không thể tải thông tin bệnh nhân")
      console.error("Fetch patient data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Đang điều trị"
      case "INACTIVE":
        return "Ngừng điều trị"
      case "TRANSFERRED":
        return "Chuyển viện"
      default:
        return status
    }
  }

  const getAppointmentStatusText = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "Đã lên lịch"
      case "CONFIRMED":
        return "Đã xác nhận"
      case "COMPLETED":
        return "Hoàn thành"
      case "CANCELLED":
        return "Đã hủy"
      case "NO_SHOW":
        return "Không đến"
      default:
        return status
    }
  }

  const getTestTypeText = (type) => {
    const types = {
      CD4_COUNT: "CD4 Count",
      VIRAL_LOAD: "Viral Load",
      COMPLETE_BLOOD_COUNT: "Công thức máu",
      LIVER_FUNCTION: "Chức năng gan",
      KIDNEY_FUNCTION: "Chức năng thận",
      LIPID_PROFILE: "Lipid máu",
      GLUCOSE: "Đường huyết",
      OTHER: "Khác",
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="error-state">
        <h2>Không tìm thấy bệnh nhân</h2>
        <button className="btn btn-primary" onClick={() => window.history.back()}>
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="patient-detail">
      <div className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Quay lại
          </button>
          <h1 className="page-title">{patient.fullName}</h1>
          <span className={`status-badge ${patient.status?.toLowerCase()}`}>{getStatusText(patient.status)}</span>
        </div>
      </div>

      <div className="patient-tabs">
        <button className={`tab-btn ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>
          📋 Thông tin
        </button>
        <button
          className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          📅 Lịch hẹn ({appointments.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "prescriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("prescriptions")}
        >
          💊 Đơn thuốc ({prescriptions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "lab-results" ? "active" : ""}`}
          onClick={() => setActiveTab("lab-results")}
        >
          🧪 Xét nghiệm ({labResults.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "info" && (
          <div className="info-tab">
            <div className="info-cards">
              <div className="info-card">
                <h3>Thông tin cá nhân</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{patient.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Điện thoại:</span>
                    <span className="info-value">{patient.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ngày sinh:</span>
                    <span className="info-value">
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Giới tính:</span>
                    <span className="info-value">
                      {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}
                    </span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label">Địa chỉ:</span>
                    <span className="info-value">{patient.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Liên hệ khẩn cấp</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Tên:</span>
                    <span className="info-value">{patient.emergencyContact || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Điện thoại:</span>
                    <span className="info-value">{patient.emergencyPhone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Thông tin y tế</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Ngày chẩn đoán:</span>
                    <span className="info-value">
                      {patient.diagnosisDate ? new Date(patient.diagnosisDate).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Trạng thái:</span>
                    <span className="info-value">{getStatusText(patient.status)}</span>
                  </div>
                  {patient.notes && (
                    <div className="info-item full-width">
                      <span className="info-label">Ghi chú:</span>
                      <span className="info-value">{patient.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="appointments-tab">
            {appointments.length > 0 ? (
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-header">
                      <h4>{appointment.title || "Khám định kỳ"}</h4>
                      <span className={`status-badge ${appointment.status?.toLowerCase()}`}>
                        {getAppointmentStatusText(appointment.status)}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <div className="detail-item">
                        <span className="detail-label">Ngày giờ:</span>
                        <span className="detail-value">
                          {new Date(appointment.appointmentDate).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Bác sĩ:</span>
                        <span className="detail-value">{appointment.doctorName || "N/A"}</span>
                      </div>
                      {appointment.notes && (
                        <div className="detail-item">
                          <span className="detail-label">Ghi chú:</span>
                          <span className="detail-value">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Chưa có lịch hẹn nào</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "prescriptions" && (
          <div className="prescriptions-tab">
            {prescriptions.length > 0 ? (
              <div className="prescriptions-list">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="prescription-item">
                    <div className="prescription-header">
                      <h4>Đơn thuốc #{prescription.id}</h4>
                      <span className="prescription-date">
                        {new Date(prescription.prescriptionDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="prescription-details">
                      <div className="detail-item">
                        <span className="detail-label">Bác sĩ kê đơn:</span>
                        <span className="detail-value">{prescription.doctorName || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Thời gian:</span>
                        <span className="detail-value">
                          {prescription.startDate && prescription.endDate
                            ? `${new Date(prescription.startDate).toLocaleDateString("vi-VN")} - ${new Date(prescription.endDate).toLocaleDateString("vi-VN")}`
                            : "N/A"}
                        </span>
                      </div>
                      {prescription.notes && (
                        <div className="detail-item">
                          <span className="detail-label">Hướng dẫn:</span>
                          <span className="detail-value">{prescription.notes}</span>
                        </div>
                      )}
                    </div>
                    {prescription.medications && prescription.medications.length > 0 && (
                      <div className="medications-list">
                        <h5>Thuốc được kê:</h5>
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="medication-item">
                            <span className="medication-name">{med.medicationName}</span>
                            <span className="medication-dosage">
                              {med.dosage} - {med.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Chưa có đơn thuốc nào</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "lab-results" && (
          <div className="lab-results-tab">
            {labResults.length > 0 ? (
              <div className="lab-results-list">
                {labResults.map((result) => (
                  <div key={result.id} className="lab-result-item">
                    <div className="result-header">
                      <h4>{getTestTypeText(result.testType)}</h4>
                      <span className="result-date">{new Date(result.testDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="result-details">
                      <div className="detail-item">
                        <span className="detail-label">Kết quả:</span>
                        <span className="detail-value">{result.result}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Đơn vị:</span>
                        <span className="detail-value">{result.unit || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tham chiếu:</span>
                        <span className="detail-value">{result.referenceRange || "N/A"}</span>
                      </div>
                      {result.notes && (
                        <div className="detail-item">
                          <span className="detail-label">Ghi chú:</span>
                          <span className="detail-value">{result.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Chưa có kết quả xét nghiệm nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientDetail
