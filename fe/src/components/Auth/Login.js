"use client"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"
import "./Login.css"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      toast.success("Đăng nhập thành công!")
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      admin: { email: "admin@hivcare.com", password: "admin123" },
      doctor: { email: "dr.nguyen@hivcare.com", password: "doctor123" },
      patient: { email: "patient1@email.com", password: "patient123" },
    }

    setFormData(demoAccounts[role])
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>HIV Treatment Management</h1>
          <p>Hệ thống quản lý điều trị HIV</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Nhập email của bạn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="demo-accounts">
          <p>Tài khoản demo:</p>
          <div className="demo-buttons">
            <button type="button" className="btn btn-secondary demo-btn" onClick={() => handleDemoLogin("admin")}>
              Admin
            </button>
            <button type="button" className="btn btn-secondary demo-btn" onClick={() => handleDemoLogin("doctor")}>
              Bác sĩ
            </button>
            <button type="button" className="btn btn-secondary demo-btn" onClick={() => handleDemoLogin("patient")}>
              Bệnh nhân
            </button>
          </div>
        </div>

        <p className="mt-3 text-center">
          Chưa có tài khoản? <Link to="../register">Đăng ký</Link>
        </p>
        <p className="mt-2 text-center">
  <Link to="../homepage">← Trở về trang chủ</Link>
</p>

      </div>
    </div>
  )
}

export default Login
