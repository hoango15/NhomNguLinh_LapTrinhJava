"use client"
import { useAuth } from "../../contexts/AuthContext"
import "./Header.css"

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout()
    }
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="header-title">HIV Treatment System</h1>
      </div>

      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{user?.fullName || user?.email}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button className="btn btn-danger logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  )
}

export default Header
