"use client"

import { useState, useEffect } from "react"
import { educationalContentAPI } from "../../services/api"
import { toast } from "react-toastify"
import "./EducationForm.css"

const EducationForm = ({ content, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "GENERAL",
    tags: "",
    isPublished: false,
    featuredImage: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || "",
        summary: content.summary || "",
        content: content.content || "",
        category: content.category || "GENERAL",
        tags: content.tags || "",
        isPublished: content.isPublished || false,
        featuredImage: content.featuredImage || "",
      })
    }
  }, [content])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (content) {
        await educationalContentAPI.update(content.id, formData)
        toast.success("Cập nhật nội dung thành công")
      } else {
        await educationalContentAPI.create(formData)
        toast.success("Thêm nội dung thành công")
      }
      onClose()
    } catch (error) {
      toast.error(content ? "Không thể cập nhật nội dung" : "Không thể thêm nội dung")
      console.error("Form submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content extra-large">
        <div className="modal-header">
          <h2>{content ? "Sửa nội dung giáo dục" : "Thêm nội dung giáo dục"}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="education-form">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tiêu đề bài viết"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Danh mục *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
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

              <div className="form-group">
                <label htmlFor="tags">Từ khóa</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Nhập từ khóa, cách nhau bằng dấu phẩy"
                />
              </div>

              <div className="form-group">
                <label htmlFor="featuredImage">Hình ảnh đại diện (URL)</label>
                <input
                  type="url"
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="summary">Tóm tắt *</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Nhập tóm tắt ngắn gọn về nội dung"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Nội dung chi tiết</h3>
            <div className="form-group full-width">
              <label htmlFor="content">Nội dung *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="15"
                placeholder="Nhập nội dung chi tiết..."
                className="content-editor"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Cài đặt xuất bản</h3>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} />
                <span className="checkmark"></span>
                Xuất bản ngay lập tức
              </label>
              <small className="form-help">Nếu không chọn, nội dung sẽ được lưu dưới dạng bản nháp</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang xử lý..." : content ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EducationForm
