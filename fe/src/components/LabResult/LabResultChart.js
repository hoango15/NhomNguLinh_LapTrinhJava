"use client"

import { useState, useMemo } from "react"
import "./LabResultChart.css"

const LabResultChart = ({ results, patients, selectedPatient }) => {
  const [selectedTestType, setSelectedTestType] = useState("CD4_COUNT")

  const testTypes = [
    { value: "CD4_COUNT", label: "CD4 Count" },
    { value: "VIRAL_LOAD", label: "Viral Load" },
    { value: "COMPLETE_BLOOD_COUNT", label: "Công thức máu" },
    { value: "LIVER_FUNCTION", label: "Chức năng gan" },
    { value: "KIDNEY_FUNCTION", label: "Chức năng thận" },
    { value: "LIPID_PROFILE", label: "Lipid máu" },
    { value: "GLUCOSE", label: "Đường huyết" },
  ]

  const chartData = useMemo(() => {
    let filteredResults = results.filter((result) => result.testType === selectedTestType)

    if (selectedPatient) {
      filteredResults = filteredResults.filter((result) => result.patientId === Number.parseInt(selectedPatient))
    }

    return filteredResults
      .sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
      .map((result) => ({
        ...result,
        numericResult: Number.parseFloat(result.result) || 0,
        formattedDate: new Date(result.testDate).toLocaleDateString("vi-VN"),
      }))
  }, [results, selectedTestType, selectedPatient])

  const getChartDimensions = () => {
    const width = 800
    const height = 400
    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    return { width, height, margin }
  }

  const renderLineChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="chart-empty">
          <p>Không có dữ liệu để hiển thị biểu đồ</p>
        </div>
      )
    }

    const { width, height, margin } = getChartDimensions()
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const maxValue = Math.max(...chartData.map((d) => d.numericResult))
    const minValue = Math.min(...chartData.map((d) => d.numericResult))
    const valueRange = maxValue - minValue || 1

    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1 || 1)) * chartWidth
      const y = chartHeight - ((d.numericResult - minValue) / valueRange) * chartHeight
      return { x, y, data: d }
    })

    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

    return (
      <div className="chart-container">
        <svg width={width} height={height} className="line-chart">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e9ecef" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x={margin.left} y={margin.top} width={chartWidth} height={chartHeight} fill="url(#grid)" />

          {/* Chart area */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="#007bff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="#007bff"
                  stroke="white"
                  strokeWidth="2"
                  className="chart-point"
                />
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#495057"
                  className="point-label"
                >
                  {point.data.result}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, i) => (
              <text
                key={i}
                x={point.x}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6c757d"
                transform={`rotate(-45, ${point.x}, ${chartHeight + 20})`}
              >
                {point.data.formattedDate}
              </text>
            ))}

            {/* Y-axis */}
            <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#495057" strokeWidth="2" />

            {/* X-axis */}
            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#495057" strokeWidth="2" />
          </g>

          {/* Y-axis label */}
          <text
            x="20"
            y={height / 2}
            textAnchor="middle"
            fontSize="14"
            fill="#495057"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            Giá trị
          </text>

          {/* X-axis label */}
          <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="14" fill="#495057">
            Thời gian
          </text>
        </svg>
      </div>
    )
  }

  return (
    <div className="lab-result-chart">
      <div className="chart-controls">
        <div className="control-group">
          <label htmlFor="testType">Loại xét nghiệm:</label>
          <select
            id="testType"
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value)}
            className="chart-select"
          >
            {testTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-title">
        <h3>Biểu đồ theo dõi {testTypes.find((t) => t.value === selectedTestType)?.label}</h3>
        {selectedPatient && (
          <p className="chart-subtitle">
            Bệnh nhân: {patients.find((p) => p.id === Number.parseInt(selectedPatient))?.fullName}
          </p>
        )}
      </div>

      {renderLineChart()}

      {chartData.length > 0 && (
        <div className="chart-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Số lần xét nghiệm:</span>
              <span className="stat-value">{chartData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Giá trị cao nhất:</span>
              <span className="stat-value">{Math.max(...chartData.map((d) => d.numericResult)).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Giá trị thấp nhất:</span>
              <span className="stat-value">{Math.min(...chartData.map((d) => d.numericResult)).toFixed(2)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Giá trị trung bình:</span>
              <span className="stat-value">
                {(chartData.reduce((sum, d) => sum + d.numericResult, 0) / chartData.length).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LabResultChart
