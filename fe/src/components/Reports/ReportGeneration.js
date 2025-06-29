"use client"

import { useState, useEffect } from "react"
import { reportAPI, patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import "./ReportGeneration.css"

const ReportGeneration = () => {
  const [reportType, setReportType] = useState("PATIENT_SUMMARY")
  const [parameters, setParameters] = useState({
    patientId: "",
    startDate: "",
    endDate: "",
    includeLabResults: true,
    includePrescriptions: true,
    includeAppointments: true,
    includeVitalSigns: true,
    format: "PDF",
  })
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [generatedReports, setGeneratedReports] = useState([])
  const { user } = useAuth()

  const reportTypes = [
    { value: "PATIENT_SUMMARY", label: "Tóm tắt bệnh nhân" },
    { value: "TREATMENT_PROGRESS", label: "Tiến trình điều trị" },
    { value: "MEDICATION_ADHERENCE", label: "Tuân thủ thuốc" },
    { value: "LAB_RESULTS_TREND", label: "Xu hướng xét nghiệm" },
    { value: "APPOINTMENT_HISTORY", label: "Lịch sử lịch hẹn" },
    { value: "SIDE_EFFECTS_REPORT", label: "Báo cáo tác dụng phụ" },
    { value: "VITAL_SIGNS_TREND", label: "Xu hướng dấu hiệu sinh tồn" },
    { value: "COMPREHENSIVE", label: "Báo cáo toàn diện" },
  ]

  useEffect(() => {
    fetchPatients()
    fetchGeneratedReports()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAll()
      setPatients(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách bệnh nhân")
    }
  }

  const fetchGeneratedReports = async () => {
    try {
      const response = await reportAPI.getHistory()
      setGeneratedReports(response.data)
    } catch (error) {
      console.error("Fetch reports error:", error)
    }
  }

  const handleParameterChange = (e) => {
    const { name, value, type, checked } = e.target
    setParameters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleGenerateReport = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const reportData = {
        reportType,
        ...parameters,
        generatedBy: user.id,
      }

      const response = await reportAPI.generate(reportData)

      if (response.data.downloadUrl) {
        // Download the report
        const link = document.createElement("a")
        link.href = response.data.downloadUrl
        link.download = response.data.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Báo cáo đã được tạo và tải xuống thành công")
      }

      fetchGeneratedReports()
    } catch (error) {
      toast.error("Không thể tạo báo cáo")
      console.error("Generate report error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async (reportId) => {
    try {
      const response = await reportAPI.download(reportId)

      const link = document.createElement("a")
      link.href = response.data.downloadUrl
      link.download = response.data.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Tải báo cáo thành công")
    } catch (error) {
      toast.error("Không thể tải báo cáo")
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa báo cáo này?")) {
      try {
        await reportAPI.delete(reportId)
        toast.success("Xóa báo cáo thành công")
        fetchGeneratedReports()
      } catch (error) {
        toast.error("Không thể xóa báo cáo")
      }
    }
  }

  return (
    <div className="report-generation">
      <div className="page-header">
        <h1 className="page-title">Tạo Báo cáo</h1>
      </div>

      <div className="content-grid">
        <div className="report-form-section">
          <div className="form-card">
            <h2>Tạo báo cáo mới</h2>

            <form onSubmit={handleGenerateReport} className="report-form">
              <div className="form-group">
                <label htmlFor="reportType">Loại báo cáo *</label>
                <select id="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} required>
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="patientId">Bệnh nhân</label>
                <select id="patientId" name="patientId" value={parameters.patientId} onChange={handleParameterChange}>
                  <option value="">Tất cả bệnh nhân</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="startDate">Từ ngày</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={parameters.startDate}
                    onChange={handleParameterChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Đến ngày</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={parameters.endDate}
                    onChange={handleParameterChange}
                    min={parameters.startDate}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Nội dung báo cáo</h3>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="includeLabResults"
                      checked={parameters.includeLabResults}
                      onChange={handleParameterChange}
                    />
                    <span className="checkmark"></span>
                    Kết quả xét nghiệm
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="includePrescriptions"
                      checked={parameters.includePrescriptions}
                      onChange={handleParameterChange}
                    />
                    <span className="checkmark"></span>
                    Đơn thuốc
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="includeAppointments"
                      checked={parameters.includeAppointments}
                      onChange={handleParameterChange}
                    />
                    <span className="checkmark"></span>
                    Lịch hẹn
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="includeVitalSigns"
                      checked={parameters.includeVitalSigns}
                      onChange={handleParameterChange}
                    />
                    <span className="checkmark"></span>
                    Dấu hiệu sinh tồn
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="format">Định dạng</label>
                <select id="format" name="format" value={parameters.format} onChange={handleParameterChange}>
                  <option value="PDF">PDF</option>
                  <option value="EXCEL">Excel</option>
                  <option value="WORD">Word</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Đang tạo báo cáo..." : "Tạo báo cáo"}
              </button>
            </form>
          </div>
        </div>

        <div className="reports-history-section">
          <div className="history-card">
            <h2>Lịch sử báo cáo</h2>

            <div className="reports-list">
              {generatedReports.map((report) => (
                <div key={report.id} className="report-item">
                  <div className="report-info">
                    <h4 className="report-title">{report.title}</h4>
                    <div className="report-meta">
                      <span className="report-type">{report.reportType}</span>
                      <span className="report-date">{new Date(report.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span className="report-format">{report.format}</span>
                    </div>
                    {report.patientName && <div className="report-patient">Bệnh nhân: {report.patientName}</div>}
                  </div>

                  <div className="report-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => handleDownloadReport(report.id)}>
                      Tải xuống
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteReport(report.id)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {generatedReports.length === 0 && (
              <div className="empty-reports">
                <p>Chưa có báo cáo nào được tạo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportGeneration
