"use client"

import { useState, useEffect } from "react"
import { medicationAdherenceAPI, prescriptionAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import AdherenceForm from "./AdherenceForm"
import "./AdherenceTracker.css"

const AdherenceTracker = () => {
  const [adherenceRecords, setAdherenceRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [adherenceStats, setAdherenceStats] = useState({
    totalDoses: 0,
    takenDoses: 0,
    adherenceRate: 0,
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      const [adherenceRes, prescriptionsRes] = await Promise.all([
        medicationAdherenceAPI.getByPatient(user.id),
        prescriptionAPI.getByPatient(user.id),
      ])

      setAdherenceRecords(adherenceRes.data)
      setPrescriptions(prescriptionsRes.data)

      // Calculate adherence stats
      calculateAdherenceStats(adherenceRes.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu tuân thủ thuốc")
      console.error("Fetch adherence data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAdherenceStats = (records) => {
    const last30Days = records.filter((record) => {
      const recordDate = new Date(record.recordedDate)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return recordDate >= thirtyDaysAgo
    })

    const totalDoses = last30Days.length
    const takenDoses = last30Days.filter((record) => record.taken).length
    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0

    setAdherenceStats({
      totalDoses,
      takenDoses,
      adherenceRate,
    })
  }

  const handleRecordAdherence = async (prescriptionId, medicationName, taken, notes = "") => {
    try {
      const adherenceData = {
        patientId: user.id,
        prescriptionId,
        medicationName,
        recordedDate: selectedDate,
        taken,
        notes,
      }

      await medicationAdherenceAPI.recordAdherence(adherenceData)
      toast.success(taken ? "Đã ghi nhận uống thuốc" : "Đã ghi nhận bỏ sót")
      fetchData()
    } catch (error) {
      toast.error("Không thể ghi nhận tuân thủ")
      console.error("Record adherence error:", error)
    }
  }

  const getTodayAdherence = () => {
    return adherenceRecords.filter((record) => record.recordedDate === selectedDate)
  }

  const getAdherenceForPrescription = (prescriptionId, medicationName) => {
    return adherenceRecords.find(
      (record) =>
        record.prescriptionId === prescriptionId &&
        record.medicationName === medicationName &&
        record.recordedDate === selectedDate,
    )
  }

  const getAdherenceRateColor = (rate) => {
    if (rate >= 95) return "excellent"
    if (rate >= 85) return "good"
    if (rate >= 70) return "fair"
    return "poor"
  }

  const todayAdherence = getTodayAdherence()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="adherence-tracker">
      <div className="page-header">
        <h1 className="page-title">Theo dõi Tuân thủ Thuốc</h1>
        <div className="date-selector">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="date-input"
          />
        </div>
      </div>

      <div className="adherence-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{adherenceStats.adherenceRate}%</div>
              <div className="stat-label">Tỷ lệ tuân thủ (30 ngày)</div>
              <div className={`stat-status ${getAdherenceRateColor(adherenceStats.adherenceRate)}`}>
                {adherenceStats.adherenceRate >= 95
                  ? "Xuất sắc"
                  : adherenceStats.adherenceRate >= 85
                    ? "Tốt"
                    : adherenceStats.adherenceRate >= 70
                      ? "Khá"
                      : "Cần cải thiện"}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💊</div>
            <div className="stat-content">
              <div className="stat-number">{adherenceStats.takenDoses}</div>
              <div className="stat-label">Liều đã uống</div>
              <div className="stat-detail">/{adherenceStats.totalDoses} liều</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-number">{todayAdherence.length}</div>
              <div className="stat-label">Hôm nay</div>
              <div className="stat-detail">{todayAdherence.filter((r) => r.taken).length} đã uống</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-number">
                {
                  adherenceRecords.filter(
                    (r) => !r.taken && new Date(r.recordedDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </div>
              <div className="stat-label">Bỏ sót (7 ngày)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="daily-medications">
        <h2>Thuốc cần uống ngày {new Date(selectedDate).toLocaleDateString("vi-VN")}</h2>

        {prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3>Chưa có đơn thuốc nào</h3>
            <p>Bạn chưa có đơn thuốc nào được kê. Hãy liên hệ bác sĩ để được tư vấn.</p>
          </div>
        ) : (
          <div className="medications-list">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="prescription-section">
                <h3>Đơn thuốc #{prescription.id}</h3>
                <div className="medications-grid">
                  {prescription.medications?.map((medication, index) => {
                    const adherenceRecord = getAdherenceForPrescription(prescription.id, medication.medicationName)

                    return (
                      <div key={index} className="medication-card">
                        <div className="medication-info">
                          <h4>{medication.medicationName}</h4>
                          <div className="medication-details">
                            <span className="dosage">{medication.dosage}</span>
                            <span className="frequency">{medication.frequency}</span>
                          </div>
                          {medication.instructions && <p className="instructions">{medication.instructions}</p>}
                        </div>

                        <div className="adherence-actions">
                          {adherenceRecord ? (
                            <div className={`adherence-status ${adherenceRecord.taken ? "taken" : "missed"}`}>
                              {adherenceRecord.taken ? (
                                <>
                                  <span className="status-icon">✅</span>
                                  <span>Đã uống</span>
                                </>
                              ) : (
                                <>
                                  <span className="status-icon">❌</span>
                                  <span>Đã bỏ sót</span>
                                </>
                              )}
                              {adherenceRecord.notes && <p className="adherence-notes">{adherenceRecord.notes}</p>}
                            </div>
                          ) : (
                            <div className="adherence-buttons">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleRecordAdherence(prescription.id, medication.medicationName, true)}
                              >
                                ✅ Đã uống
                              </button>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleRecordAdherence(prescription.id, medication.medicationName, false)}
                              >
                                ❌ Bỏ sót
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="adherence-tips">
        <h3>Mẹo để cải thiện tuân thủ thuốc</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">⏰</div>
            <h4>Đặt nhắc nhở</h4>
            <p>Sử dụng báo thức hoặc app nhắc nhở để không quên giờ uống thuốc</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📦</div>
            <h4>Hộp thuốc theo ngày</h4>
            <p>Chuẩn bị thuốc theo từng ngày trong tuần để dễ theo dõi</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">👨‍⚕️</div>
            <h4>Trao đổi với bác sĩ</h4>
            <p>Thông báo với bác sĩ nếu gặp khó khăn trong việc uống thuốc</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📝</div>
            <h4>Ghi chép thường xuyên</h4>
            <p>Ghi chép việc uống thuốc hàng ngày để theo dõi tiến độ</p>
          </div>
        </div>
      </div>

      {showForm && (
        <AdherenceForm
          prescriptions={prescriptions}
          selectedDate={selectedDate}
          onClose={() => setShowForm(false)}
          onSubmit={handleRecordAdherence}
        />
      )}
    </div>
  )
}

export default AdherenceTracker
