"use client"

import { useState, useEffect } from "react"
import { labResultAPI, patientAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import LabResultForm from "./LabResultForm"
import LabResultChart from "./LabResultChart"
import "./LabResultList.css"

const LabResultList = () => {
  const [labResults, setLabResults] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingResult, setEditingResult] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [viewMode, setViewMode] = useState("list") // list or chart
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [resultsRes, patientsRes] = await Promise.all([labResultAPI.getAll(), patientAPI.getAll()])
      setLabResults(resultsRes.data)
      setPatients(patientsRes.data)
    } catch (error) {
      toast.error("Không thể tải dữ liệu")
      console.error("Fetch data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa kết quả xét nghiệm này?")) {
      try {
        await labResultAPI.delete(id)
        toast.success("Xóa kết quả xét nghiệm thành công")
        fetchData()
      } catch (error) {
        toast.error("Không thể xóa kết quả xét nghiệm")
      }
    }
  }

  const handleEdit = (result) => {
    setEditingResult(result)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingResult(null)
    fetchData()
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

  const filteredResults = selectedPatient
    ? labResults.filter((result) => result.patientId === Number.parseInt(selectedPatient))
    : labResults

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="lab-result-list">
      <div className="page-header">
        <h1 className="page-title">Kết quả Xét nghiệm</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button className={`toggle-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
              📋 Danh sách
            </button>
            <button
              className={`toggle-btn ${viewMode === "chart" ? "active" : ""}`}
              onClick={() => setViewMode("chart")}
            >
              📊 Biểu đồ
            </button>
          </div>
          {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Thêm kết quả
            </button>
          )}
        </div>
      </div>

      <div className="filters">
        <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="filter-select">
          <option value="">Tất cả bệnh nhân</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.fullName}
            </option>
          ))}
        </select>
      </div>

      {viewMode === "list" && (
        <div className="results-grid">
          {filteredResults.map((result) => (
            <div key={result.id} className="result-card">
              <div className="result-header">
                <h3 className="result-title">{getTestTypeText(result.testType)}</h3>
                <span className="result-date">{new Date(result.testDate).toLocaleDateString("vi-VN")}</span>
              </div>

              <div className="result-info">
                <div className="info-item">
                  <span className="info-label">Bệnh nhân:</span>
                  <span className="info-value">{result.patientName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Kết quả:</span>
                  <span className="info-value">{result.result}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Đơn vị:</span>
                  <span className="info-value">{result.unit || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Giá trị tham chiếu:</span>
                  <span className="info-value">{result.referenceRange || "N/A"}</span>
                </div>
                {result.notes && (
                  <div className="info-item">
                    <span className="info-label">Ghi chú:</span>
                    <span className="info-value">{result.notes}</span>
                  </div>
                )}
              </div>

              <div className="result-actions">
                {(user?.role === "ADMIN" || user?.role === "DOCTOR") && (
                  <>
                    <button className="btn btn-secondary" onClick={() => handleEdit(result)}>
                      Sửa
                    </button>
                    {user?.role === "ADMIN" && (
                      <button className="btn btn-danger" onClick={() => handleDelete(result.id)}>
                        Xóa
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "chart" && (
        <LabResultChart results={filteredResults} patients={patients} selectedPatient={selectedPatient} />
      )}

      {filteredResults.length === 0 && (
        <div className="empty-state">
          <p>Không tìm thấy kết quả xét nghiệm nào</p>
        </div>
      )}

      {showForm && <LabResultForm result={editingResult} patients={patients} onClose={handleFormClose} />}
    </div>
  )
}

export default LabResultList
