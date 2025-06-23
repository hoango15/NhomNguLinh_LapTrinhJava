"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "../../services/api"
import { toast } from "react-toastify"
import UserForm from "./UserForm"
import "./UserManagement.css"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data)
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng")
      console.error("Fetch users error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await adminAPI.deleteUser(id)
        toast.success("Xóa người dùng thành công")
        fetchUsers()
      } catch (error) {
        toast.error("Không thể xóa người dùng")
      }
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleResetPassword = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn reset mật khẩu cho người dùng này?")) {
      try {
        await adminAPI.resetPassword(userId)
        toast.success("Reset mật khẩu thành công")
      } catch (error) {
        toast.error("Không thể reset mật khẩu")
      }
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingUser(null)
    fetchUsers()
  }

  const getRoleText = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên"
      case "DOCTOR":
        return "Bác sĩ"
      case "PATIENT":
        return "Bệnh nhân"
      default:
        return role
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "ADMIN":
        return "role-admin"
      case "DOCTOR":
        return "role-doctor"
      case "PATIENT":
        return "role-patient"
      default:
        return "role-default"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>Quản lý Người dùng</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Thêm người dùng
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
          <option value="all">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên</option>
          <option value="DOCTOR">Bác sĩ</option>
          <option value="PATIENT">Bệnh nhân</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>{getRoleText(user.role)}</span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? "active" : "inactive"}`}>
                    {user.isActive ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(user)}>
                      Sửa
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => handleResetPassword(user.id)}>
                      Reset MK
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <p>Không tìm thấy người dùng nào</p>
        </div>
      )}

      {showForm && <UserForm user={editingUser} onClose={handleFormClose} />}
    </div>
  )
}

export default UserManagement
