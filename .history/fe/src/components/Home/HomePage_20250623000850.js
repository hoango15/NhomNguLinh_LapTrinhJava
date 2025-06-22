"use client"

import { useState, useEffect } from "react"
import { educationalContentAPI, dashboardAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import "./Homepage.css"

const Homepage = () => {
  const [featuredContent, setFeaturedContent] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const fetchHomepageData = async () => {
    try {
      const [contentRes, statsRes] = await Promise.all([educationalContentAPI.getPublished(), dashboardAPI.getStats()])
      setFeaturedContent(contentRes.data.slice(0, 6))
      setStats(statsRes.data)
    } catch (error) {
      console.error("Fetch homepage data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = () => {
    if (user) {
      window.location.href = "/appointments"
    } else {
      window.location.href = "/login"
    }
  }

  const handleAnonymousBooking = () => {
    window.location.href = "/anonymous-booking"
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Hệ thống Quản lý Điều trị HIV</h1>
            <p className="hero-subtitle">
              Chăm sóc sức khỏe toàn diện, hỗ trợ điều trị HIV hiệu quả và bảo mật thông tin tuyệt đối
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={handleBookAppointment}>
                Đặt lịch khám
              </button>
              <button className="btn btn-outline btn-large" onClick={handleAnonymousBooking}>
                Đặt lịch ẩn danh
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="card-icon">🏥</div>
              <h3>Chăm sóc chuyên nghiệp</h3>
              <p>Đội ngũ bác sĩ giàu kinh nghiệm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{stats.totalPatients || 0}</div>
                <div className="stat-label">Bệnh nhân đang điều trị</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalDoctors || 0}</div>
                <div className="stat-label">Bác sĩ chuyên khoa</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{stats.totalAppointments || 0}</div>
                <div className="stat-label">Lượt khám thành công</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Hỗ trợ trực tuyến</div>
              </div>
            </div>
          </div>
        </section>
      )}


      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Dịch vụ của chúng tôi</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🩺</div>
              <h3>Khám & Điều trị</h3>
              <p>Khám bệnh định kỳ, theo dõi sức khỏe và điều trị chuyên sâu</p>
              <button className="btn btn-outline" onClick={() => (window.location.href = "/appointments")}>
                Đặt lịch khám
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">💊</div>
              <h3>Quản lý Thuốc</h3>
              <p>Theo dõi đơn thuốc, nhắc nhở uống thuốc và kiểm tra tuân thủ</p>
              <button className="btn btn-outline" onClick={() => (window.location.href = "/prescriptions")}>
                Xem đơn thuốc
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">🧪</div>
              <h3>Xét nghiệm</h3>
              <p>Theo dõi CD4, Viral Load và các chỉ số sức khỏe quan trọng</p>
              <button className="btn btn-outline" onClick={() => (window.location.href = "/lab-results")}>
                Xem kết quả
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">💬</div>
              <h3>Tư vấn trực tuyến</h3>
              <p>Chat với bác sĩ, tư vấn sức khỏe và hỗ trợ tâm lý</p>
              <button className="btn btn-outline" onClick={() => (window.location.href = "/consultations")}>
                Tư vấn ngay
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">📚</div>
              <h3>Giáo dục sức khỏe</h3>
              <p>Tài liệu, video hướng dẫn và thông tin y tế cập nhật</p>
              <button className="btn btn-outline" onClick={() => (window.location.href = "/education")}>
                Tìm hiểu thêm
              </button>
            </div>

            <div className="service-card">
              <div className="service-icon">🔔</div>
              <h3>Nhắc nhở thông minh</h3>
              <p>Nhắc nhở uống thuốc, lịch tái khám và theo dõi sức khỏe</p>
              <button className="btn btn-outline" onClick={() => (window.location.href = "/reminders")}>
                Cài đặt nhắc nhở
              </button>
            </div>
          </div>
        </div>
      </section>


      <section className="education-section">
        <div className="container">
          <h2 className="section-title">Tài liệu giáo dục</h2>
          <p className="section-subtitle">Thông tin y tế đáng tin cậy để giúp bạn hiểu rõ hơn về HIV</p>

          {featuredContent.length > 0 ? (
            <div className="content-grid">
              {featuredContent.map((content) => (
                <div key={content.id} className="content-card">
                  <div className="content-category">{content.category}</div>
                  <h3 className="content-title">{content.title}</h3>
                  <p className="content-summary">{content.summary}</p>
                  <div className="content-meta">
                    <span className="content-date">{new Date(content.publishedAt).toLocaleDateString("vi-VN")}</span>
                    <button
                      className="btn btn-link"
                      onClick={() => (window.location.href = `/education/${content.id}`)}
                    >
                      Đọc thêm →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-content">
              <p>Nội dung giáo dục đang được cập nhật...</p>
            </div>
          )}

          <div className="section-footer">
            <button className="btn btn-primary" onClick={() => (window.location.href = "/education")}>
              Xem tất cả tài liệu
            </button>
          </div>
        </div>
      </section>

 
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Tại sao chọn chúng tôi?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Bảo mật tuyệt đối</h3>
              <p>Thông tin bệnh nhân được mã hóa và bảo vệ nghiêm ngặt</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">👨‍⚕️</div>
              <h3>Đội ngũ chuyên nghiệp</h3>
              <p>Bác sĩ giàu kinh nghiệm trong điều trị HIV/AIDS</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3>Công nghệ hiện đại</h3>
              <p>Hệ thống quản lý điện tử tiên tiến và dễ sử dụng</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🤝</div>
              <h3>Hỗ trợ tận tình</h3>
              <p>Đồng hành cùng bệnh nhân trong suốt quá trình điều trị</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🌍</div>
              <h3>Tiếp cận dễ dàng</h3>
              <p>Đặt lịch online, tư vấn từ xa và hỗ trợ 24/7</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💝</div>
              <h3>Không kỳ thị</h3>
              <p>Môi trường thân thiện, tôn trọng và không phán xét</p>
            </div>
          </div>
        </div>
      </section>


      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Bắt đầu hành trình chăm sóc sức khỏe của bạn</h2>
            <p>Đăng ký tài khoản để trải nghiệm đầy đủ các dịch vụ của chúng tôi</p>
            <div className="cta-actions">
              {!user ? (
                <>
                  <button className="btn btn-primary btn-large" onClick={() => (window.location.href = "/register")}>
                    Đăng ký ngay
                  </button>
                  <button className="btn btn-outline btn-large" onClick={() => (window.location.href = "/login")}>
                    Đăng nhập
                  </button>
                </>
              ) : (
                <button className="btn btn-primary btn-large" onClick={() => (window.location.href = "/dashboard")}>
                  Vào trang chính
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Homepage
