"use client"

import { useState, useEffect } from "react"
import { reportAPI, patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import ReportChart from "./ReportChart"
import "./ReportDashboard.css"

const ReportDashboard = () => {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [reportType, setReportType] = useState("patient")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    endDate: new Date().toISOString().split("T")[0], // today
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll()
      setPatients(response.data)
      if (response.data.length > 0) {
        setSelectedPatient(response.data[0].id.toString())
      }
    } catch (error) {
      toast.error("Không thể tải danh sách bệnh nhân")
    }
  }

  const generateReport = async () => {
    if (!selectedPatient && reportType === "patient") {
      toast.error("Vui lòng chọn bệnh nhân")
      return
    }

    setLoading(true)
    try {
      let response
      switch (reportType) {
        case "patient":
          response = await reportAPI.getPatientReport(selectedPatient, dateRange.startDate, dateRange.endDate)
          break
        case "treatment":
          response = await reportAPI.getTreatmentReport(dateRange.startDate, dateRange.endDate)
          break
        case "medication-adherence":
          response = await reportAPI.getMedicationAdherenceReport(
            selectedPatient,
            dateRange.startDate,
            dateRange.endDate,
          )
          break
        case "lab-trends":
          response = await reportAPI.getLabResultTrends(
            selectedPatient,
            "CD4_COUNT",
            dateRange.startDate,
            dateRange.endDate,
          )
          break
        default:
          throw new Error("Invalid report type")
      }
      setReportData(response.data)
      toast.success("Tạo báo cáo thành công")
    } catch (error) {
      toast.error("Không thể tạo báo cáo")
      console.error("Generate report error:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format) => {
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân")
      return
    }

    try {
      const response = await reportAPI.exportPatientReport(selectedPatient, format)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `patient-report-${selectedPatient}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(`Xuất báo cáo ${format.toUpperCase()} thành công`)
    } catch (error) {
      toast.error("Không thể xuất báo cáo")
    }
  }

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="report-dashboard">
      <div className="page-header">
        <h1 className="page-title">Báo cáo & Thống kê</h1>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Loại báo cáo:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="control-select">
            <option value="patient">Báo cáo bệnh nhân</option>
            <option value="treatment">Báo cáo điều trị</option>
            <option value="medication-adherence">Tuân thủ điều trị</option>
            <option value="lab-trends">Xu hướng xét nghiệm</option>
          </select>
        </div>

        {(reportType === "patient" || reportType === "medication-adherence" || reportType === "lab-trends") && (
          <div className="control-group">
            <label>Bệnh nhân:</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="control-select"
            >
              <option value="">Chọn bệnh nhân</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="control-group">
          <label>Từ ngày:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            className="control-input"
          />
        </div>

        <div className="control-group">
          <label>Đến ngày:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            className="control-input"
          />
        </div>

        <button className="btn btn-primary" onClick={generateReport} disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo báo cáo"}
        </button>
      </div>

      {reportData && (
        <div className="report-content">
          <div className="report-header">
            <h2>Kết quả báo cáo</h2>
            <div className="export-buttons">
              <button className="btn btn-outline" onClick={() => exportReport("pdf")}>
                Xuất PDF
              </button>
              <button className="btn btn-outline" onClick={() => exportReport("excel")}>
                Xuất Excel
              </button>
            </div>
          </div>

          <div className="report-summary">
            <div className="summary-cards">
              {reportData.summary && (
                <>
                  <div className="summary-card">
                    <div className="card-value">{reportData.summary.totalAppointments || 0}</div>
                    <div className="card-label">Tổng lịch hẹn</div>
                  </div>
                  <div className="summary-card">
                    <div className="card-value">{reportData.summary.totalPrescriptions || 0}</div>
                    <div className="card-label">Tổng đơn thuốc</div>
                  </div>
                  <div className="summary-card">
                    <div className="card-value">{reportData.summary.totalLabResults || 0}</div>
                    <div className="card-label">Tổng xét nghiệm</div>
                  </div>
                  <div className="summary-card">
                    <div className="card-value">{reportData.summary.adherenceRate || 0}%</div>
                    <div className="card-label">Tỷ lệ tuân thủ</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {reportData.chartData && <ReportChart data={reportData.chartData} type={reportType} />}

          <div className="report-details">
            {reportData.appointments && (
              <div className="detail-section">
                <h3>Lịch hẹn gần đây</h3>
                <div className="detail-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Tiêu đề</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{new Date(appointment.appointmentDate).toLocaleDateString("vi-VN")}</td>
                          <td>{appointment.title}</td>
                          <td>
                            <span className={`status-badge ${appointment.status?.toLowerCase()}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td>{appointment.notes || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportData.labResults && (
              <div className="detail-section">
                <h3>Kết quả xét nghiệm</h3>
                <div className="detail-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Loại XN</th>
                        <th>Kết quả</th>
                        <th>Đơn vị</th>
                        <th>Tham chiếu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.labResults.map((result) => (
                        <tr key={result.id}>
                          <td>{new Date(result.testDate).toLocaleDateString("vi-VN")}</td>
                          <td>{result.testType}</td>
                          <td>{result.result}</td>
                          <td>{result.unit}</td>
                          <td>{result.referenceRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportDashboard
