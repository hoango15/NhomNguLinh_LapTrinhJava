"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./Login.css" // dùng lại CSS của Login

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "PATIENT", // mặc định là người dùng
  })

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", formData)

      if (response.data.success) {
        toast.success("Đăng ký thành công!")
        navigate("/login")
      } else {
        toast.error(response.data.message || "Đăng ký thất bại!")
      }
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi đăng ký!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Đăng ký tài khoản</h1>
          <p>Tạo tài khoản để truy cập hệ thống điều trị HIV</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Tên người dùng</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Nhập tên người dùng"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Nhập email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
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

          {/* Trường role bị ẩn, mặc định là PATIENT */}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-3 text-center">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
