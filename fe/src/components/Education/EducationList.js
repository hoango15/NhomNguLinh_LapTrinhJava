"use client"

import { useState, useEffect } from "react"
import { educationalContentAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import EducationForm from "./EducationForm"
import "./EducationList.css"

const EducationList = () => {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    fetchContents()
  }, [])

  const fetchContents = async () => {
    try {
      const response =
        user?.role === "ADMIN" ? await educationalContentAPI.getAll() : await educationalContentAPI.getPublished()
      setContents(response.data)
    } catch (error) {
      toast.error("Không thể tải nội dung giáo dục")
      console.error("Fetch contents error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nội dung này?")) {
      try {
        await educationalContentAPI.delete(id)
        toast.success("Xóa nội dung thành công")
        fetchContents()
      } catch (error) {
        toast.error("Không thể xóa nội dung")
      }
    }
  }

  const handleEdit = (content) => {
    setEditingContent(content)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingContent(null)
    fetchContents()
  }

  const getCategoryText = (category) => {
    const categories = {
      GENERAL: "Thông tin chung",
      TREATMENT: "Điều trị",
      PREVENTION: "Phòng ngừa",
      NUTRITION: "Dinh dưỡng",
      MENTAL_HEALTH: "Sức khỏe tâm thần",
      LIFESTYLE: "Lối sống",
      FAQ: "Câu hỏi thường gặp",
      NEWS: "Tin tức",
    }
    return categories[category] || category
  }

  const filteredContents = contents.filter((content) => {
    const matchesSearch =
      content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.summary?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || content.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="education-list">
      <div className="page-header">
        <h1 className="page-title">Tài liệu Giáo dục</h1>
        {user?.role === "ADMIN" && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Thêm nội dung
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả danh mục</option>
          <option value="GENERAL">Thông tin chung</option>
          <option value="TREATMENT">Điều trị</option>
          <option value="PREVENTION">Phòng ngừa</option>
          <option value="NUTRITION">Dinh dưỡng</option>
          <option value="MENTAL_HEALTH">Sức khỏe tâm thần</option>
          <option value="LIFESTYLE">Lối sống</option>
          <option value="FAQ">Câu hỏi thường gặp</option>
          <option value="NEWS">Tin tức</option>
        </select>
      </div>

      <div className="contents-grid">
        {filteredContents.map((content) => (
          <div key={content.id} className="content-card">
            <div className="content-header">
              <span className={`category-badge ${content.category?.toLowerCase()}`}>
                {getCategoryText(content.category)}
              </span>
              {user?.role === "ADMIN" && (
                <span className={`status-badge ${content.isPublished ? "published" : "draft"}`}>
                  {content.isPublished ? "Đã xuất bản" : "Bản nháp"}
                </span>
              )}
            </div>

            <h3 className="content-title">{content.title}</h3>
            <p className="content-summary">{content.summary}</p>

            <div className="content-meta">
              <div className="meta-info">
                <span className="content-author">Tác giả: {content.authorName || "Admin"}</span>
                <span className="content-date">
                  {content.publishedAt
                    ? new Date(content.publishedAt).toLocaleDateString("vi-VN")
                    : new Date(content.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="content-actions">
                <button className="btn btn-outline" onClick={() => (window.location.href = `/education/${content.id}`)}>
                  Đọc thêm
                </button>
                {user?.role === "ADMIN" && (
                  <>
                    <button className="btn btn-secondary" onClick={() => handleEdit(content)}>
                      Sửa
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(content.id)}>
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Không tìm thấy nội dung nào</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}

      {showForm && <EducationForm content={editingContent} onClose={handleFormClose} />}
    </div>
  )
}

export default EducationList
