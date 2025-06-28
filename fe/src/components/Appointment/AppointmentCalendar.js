"use client"

import { useState } from "react"
import "./AppointmentCalendar.css"

const AppointmentCalendar = ({ appointments, onAppointmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getAppointmentsForDate = (date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate)
      return appointmentDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayAppointments = getAppointmentsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
          <div className="day-number">{day}</div>
          <div className="day-appointments">
            {dayAppointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment.id}
                className={`appointment-item ${appointment.status?.toLowerCase()}`}
                onClick={() => onAppointmentClick(appointment)}
                title={`${appointment.title} - ${appointment.patientName}`}
              >
                <span className="appointment-time">
                  {new Date(appointment.appointmentDate).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="appointment-title">{appointment.title}</span>
              </div>
            ))}
            {dayAppointments.length > 3 && <div className="more-appointments">+{dayAppointments.length - 3} khác</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="appointment-calendar">
      <div className="calendar-header">
        <button className="nav-btn" onClick={() => navigateMonth(-1)}>
          ‹
        </button>
        <h2 className="calendar-title">
          {currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
        </h2>
        <button className="nav-btn" onClick={() => navigateMonth(1)}>
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">{renderCalendarDays()}</div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color scheduled"></span>
          <span>Đã lên lịch</span>
        </div>
        <div className="legend-item">
          <span className="legend-color confirmed"></span>
          <span>Đã xác nhận</span>
        </div>
        <div className="legend-item">
          <span className="legend-color completed"></span>
          <span>Hoàn thành</span>
        </div>
        <div className="legend-item">
          <span className="legend-color cancelled"></span>
          <span>Đã hủy</span>
        </div>
      </div>
    </div>
  )
}

export default AppointmentCalendar
