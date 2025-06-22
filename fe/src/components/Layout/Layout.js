"use client"

import { useState } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"
import "./Layout.css"

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="layout">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar collapsed={sidebarCollapsed} />
      <main className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>{children}</main>
    </div>
  )
}

export default Layout
