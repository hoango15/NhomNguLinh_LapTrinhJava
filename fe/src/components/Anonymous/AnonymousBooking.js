"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import "./AnonymousBooking.css"

const AnonymousBooking = () => {
  const [formData, setFormData] = useState({
    // Anonymous identifier
    anonymousId: "",
    contactMethod: "PHONE", // PHONE, EMAIL
    contactValue: "",

    // Appointment details
    appointmentDate: "",
    appointmentTime: "",
    consultationType: "CHAT", // CHAT, VIDEO, IN_PERSON

    // Health information (optional)
    ageRange: "",
    gender: "",
    symptoms: "",
    urgencyLevel: "NORMAL", // LOW, NORMAL, HIGH, URGENT

    // Privacy preferences
    preferredName: "",
    notes: "",

    // Consent
    consentToTreatment: false,
    consentToDataProcessing: false,
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const generateAnonymousId = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `ANON_${timestamp}_${random}`.toUpperCase()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const anonymousId = generateAnonymousId()
      const appointmentData = {
        ...formData,
        anonymousId,
        title: "Tư vấn ẩn danh",
        isAnonymous: true,
        patientId: null, // No patient ID for anonymous booking
        appointmentDate: new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).toISOString(),
      }

      // In real app: await appointmentAPI.createAnonymous(appointmentData)
      console.log("Anonymous booking data:", appointmentData)

      toast.success("Đặt lịch ẩn danh thành công!")
      setBookingSuccess(true)

      // Store anonymous ID for future reference
      localStorage.setItem("anonymousBookingId", anonymousId)
    } catch (error) {
      toast.error("Không thể đặt lịch. Vui lòng thử lại.")
      console.error("Anonymous booking error:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (bookingSuccess) {
    return (
      <div className="anonymous-booking">
        <div className="booking-container">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Đặt lịch thành công!</h2>
            <p>Mã đặt lịch của bạn là:</p>
            <div className="booking-code">{localStorage.getItem("anonymousBookingId")}</div>
            <p className="success-note">
              Vui lòng lưu mã này để theo dõi lịch hẹn. Chúng tôi sẽ liên hệ với bạn qua thông tin đã cung cấp.
            </p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => (window.location.href = "/")}>
                Về trang chủ
              </button>
              <button className="btn btn-outline" onClick={() => (window.location.href = "/anonymous-tracking")}>
                Theo dõi lịch hẹn
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="anonymous-booking">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Đặt lịch Tư vấn Ẩn danh</h1>
          <p>Chúng tôi cam kết bảo mật tuyệt đối thông tin của bạn</p>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
            <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {step === 1 && (
            <div className="form-step">
              <h2>Thông tin Liên hệ</h2>
              <p className="step-description">Chúng tôi chỉ cần thông tin tối thiểu để liên hệ với bạn</p>

              <div className="form-group">
                <label htmlFor="preferredName">Tên gọi mong muốn</label>
                <input
                  type="text"
                  id="preferredName"
                  name="preferredName"
                  value={formData.preferredName}
                  onChange={handleChange}
                  placeholder="Tên bạn muốn được gọi"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactMethod">Phương thức liên hệ *</label>
                <select
                  id="contactMethod"
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="PHONE">Điện thoại</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contactValue">
                  {formData.contactMethod === "PHONE" ? "Số điện thoại" : "Địa chỉ email"} *
                </label>
                <input
                  type={formData.contactMethod === "PHONE" ? "tel" : "email"}
                  id="contactValue"
                  name="contactValue"
                  value={formData.contactValue}
                  onChange={handleChange}
                  required
                  placeholder={formData.contactMethod === "PHONE" ? "0123456789" : "email@example.com"}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Thông tin Cuộc hẹn</h2>
              <p className="step-description">Chọn thời gian và hình thức tư vấn phù hợp</p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="appointmentDate">Ngày hẹn *</label>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentTime">Giờ hẹn *</label>
                  <input
                    type="time"
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="consultationType">Hình thức tư vấn *</label>
                <select
                  id="consultationType"
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                  required
                >
                  <option value="CHAT">Chat trực tuyến</option>
                  <option value="VIDEO">Video call</option>
                  <option value="IN_PERSON">Gặp trực tiếp</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="urgencyLevel">Mức độ khẩn cấp</label>
                <select id="urgencyLevel" name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange}>
                  <option value="LOW">Thấp - Tư vấn thông thường</option>
                  <option value="NORMAL">Bình thường - Cần tư vấn sớm</option>
                  <option value="HIGH">Cao - Cần tư vấn gấp</option>
                  <option value="URGENT">Khẩn cấp - Cần hỗ trợ ngay</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  Quay lại
                </button>
                <button type="button" className="btn btn-primary" onClick={nextStep}>
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2>Thông tin Sức khỏe (Tùy chọn)</h2>
              <p className="step-description">Thông tin này giúp bác sĩ chuẩn bị tốt hơn cho cuộc tư vấn</p>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="ageRange">Độ tuổi</label>
                  <select id="ageRange" name="ageRange" value={formData.ageRange} onChange={handleChange}>
                    <option value="">Không muốn chia sẻ</option>
                    <option value="18-25">18-25 tuổi</option>
                    <option value="26-35">26-35 tuổi</option>
                    <option value="36-45">36-45 tuổi</option>
                    <option value="46-55">46-55 tuổi</option>
                    <option value="56+">Trên 56 tuổi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Giới tính</label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Không muốn chia sẻ</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="symptoms">Triệu chứng hoặc vấn đề cần tư vấn</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Mô tả ngắn gọn về vấn đề bạn muốn tư vấn..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú thêm</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Bất kỳ thông tin nào khác bạn muốn chia sẻ..."
                />
              </div>

              <div className="consent-section">
                <h3>Đồng ý và Cam kết</h3>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="consentToTreatment"
                      checked={formData.consentToTreatment}
                      onChange={handleChange}
                      required
                    />
                    <span className="checkmark"></span>
                    Tôi đồng ý nhận tư vấn y tế và hiểu rằng đây chỉ là tư vấn, không thay thế việc khám bệnh trực tiếp
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="consentToDataProcessing"
                      checked={formData.consentToDataProcessing}
                      onChange={handleChange}
                      required
                    />
                    <span className="checkmark"></span>
                    Tôi đồng ý cho phép xử lý thông tin cá nhân để phục vụ mục đích tư vấn y tế
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={prevStep}>
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.consentToTreatment || !formData.consentToDataProcessing}
                >
                  {loading ? "Đang xử lý..." : "Đặt lịch"}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="privacy-notice">
          <div className="privacy-icon">🔒</div>
          <div className="privacy-text">
            <strong>Cam kết bảo mật:</strong> Tất cả thông tin của bạn được mã hóa và bảo mật tuyệt đối. Chúng tôi không
            lưu trữ thông tin cá nhân và chỉ sử dụng để phục vụ mục đích tư vấn y tế.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnonymousBooking
