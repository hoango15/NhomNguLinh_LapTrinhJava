"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./Sidebar.css"

const Sidebar = ({ collapsed }) => {
  const location = useLocation()
  const { user } = useAuth()

  const menuItems = [
    {
      path: "/dashboard",
      icon: "📊",
      label: "Dashboard",
      roles: ["ADMIN", "DOCTOR", "PATIENT"],
    },
    {
      path: "/patients",
      icon: "👥",
      label: "Bệnh nhân",
      roles: ["ADMIN", "DOCTOR"],
    },
    {
      path: "/appointments",
      icon: "📅",
      label: "Lịch hẹn",
      roles: ["ADMIN", "DOCTOR", "PATIENT"],
    },
    {
      path: "/prescriptions",
      icon: "💊",
      label: "Đơn thuốc",
      roles: ["ADMIN", "DOCTOR", "PATIENT"],
    },
    {
      path: "/lab-results",
      icon: "🧪",
      label: "Kết quả xét nghiệm",
      roles: ["ADMIN", "DOCTOR", "PATIENT"],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role))

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
