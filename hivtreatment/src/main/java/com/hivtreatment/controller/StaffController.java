package com.hivtreatment.controller;

import com.hivtreatment.entity.*;
import com.hivtreatment.enums.AppointmentStatus;
import com.hivtreatment.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/staff")
@PreAuthorize("hasRole('STAFF')")
public class StaffController {

    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private PatientService patientService;
    
    @Autowired
    private DoctorService doctorService;
    
    @Autowired
    private NotificationService notificationService;

    @GetMapping("/dashboard")
    public String dashboard(Model model, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Get today's appointments
        List<Appointment> todayAppointments = appointmentService.getTodayAppointments();
        
        // Get appointment statistics
        Map<String, Object> stats = new HashMap<>();
        stats.put("todayTotal", todayAppointments.size());
        stats.put("pending", todayAppointments.stream().mapToInt(a -> 
            a.getStatus() == AppointmentStatus.SCHEDULED ? 1 : 0).sum());
        stats.put("confirmed", todayAppointments.stream().mapToInt(a -> 
            a.getStatus() == AppointmentStatus.CONFIRMED ? 1 : 0).sum());
        stats.put("completed", todayAppointments.stream().mapToInt(a -> 
            a.getStatus() == AppointmentStatus.COMPLETED ? 1 : 0).sum());
        
        model.addAttribute("appointmentStats", stats);
        model.addAttribute("todayAppointments", todayAppointments);
        model.addAttribute("pageTitle", "Staff Dashboard");
        
        return "staff/dashboard";
    }

    @GetMapping("/appointments")
    public String appointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status,
            Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate", "appointmentTime"));
        
        LocalDate filterDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        
        Page<Appointment> appointments;
        if (status != null && !status.isEmpty()) {
            AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
            appointments = appointmentService.getAppointmentsByDateAndStatus(filterDate, appointmentStatus, pageable);
        } else {
            appointments = appointmentService.getAppointmentsByDate(filterDate, pageable);
        }
        
        // Get statistics
        Map<String, Object> stats = getAppointmentStatistics(filterDate);
        
        model.addAttribute("appointments", appointments.getContent());
        model.addAttribute("todayAppointments", appointments.getContent());
        model.addAttribute("appointmentStats", stats);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", appointments.getTotalPages());
        model.addAttribute("selectedDate", filterDate);
        model.addAttribute("selectedStatus", status);
        model.addAttribute("pageTitle", "Quản lý Lịch hẹn");
        
        return "staff/appointments/list";
    }

    @GetMapping("/appointments/{id}")
    public String viewAppointment(@PathVariable Long id, Model model) {
       Appointment appointment = appointmentService.getAppointmentById(id)
    .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        model.addAttribute("appointment", appointment);
        model.addAttribute("pageTitle", "Chi tiết Lịch hẹn");
        return "staff/appointments/view";
    }

    @GetMapping("/appointments/create")
    public String createAppointmentForm(Model model) {
        model.addAttribute("appointment", new Appointment());
        model.addAttribute("patients", patientService.getAllPatients());
        model.addAttribute("doctors", doctorService.getAllDoctors());
        model.addAttribute("pageTitle", "Tạo Lịch hẹn");
        return "staff/appointments/create";
    }

   @PostMapping("/appointments/create")
public String createAppointment(@Valid @ModelAttribute Appointment appointment,
                              BindingResult result,
                              RedirectAttributes redirectAttributes) {
    if (result.hasErrors()) {
        redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi trong thông tin lịch hẹn!");
        return "redirect:/staff/appointments/create";
    }

    try {
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setCreatedAt(LocalDateTime.now());
        appointmentService.saveAppointment(appointment);

        // ✅ GỌI HÀM ĐÚNG
        notificationService.sendAppointmentConfirmation(appointment);

        redirectAttributes.addFlashAttribute("successMessage", "Tạo lịch hẹn thành công!");
        return "redirect:/staff/appointments";
    } catch (Exception e) {
        redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi tạo lịch hẹn!");
        return "redirect:/staff/appointments/create";
    }
}


    @PostMapping("/appointments/{id}/confirm")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirmAppointment(@PathVariable Long id) {
        try {
           Appointment appointment = appointmentService.getAppointmentById(id)
    .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

            appointment.setStatus(AppointmentStatus.CONFIRMED);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentService.saveAppointment(appointment);
            
            // Send confirmation notification
            notificationService.sendAppointmentConfirmation(appointment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xác nhận lịch hẹn thành công!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi xác nhận lịch hẹn!");
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/appointments/{id}/start")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> startAppointment(@PathVariable Long id) {
        try {
            Appointment appointment = appointmentService.getAppointmentById(id)
    .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

            appointment.setStatus(AppointmentStatus.IN_PROGRESS);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentService.saveAppointment(appointment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bắt đầu cuộc hẹn thành công!");
            response.put("redirectUrl", "/staff/appointments/" + id + "/consultation");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi bắt đầu cuộc hẹn!");
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/appointments/{id}/cancel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelAppointment(@PathVariable Long id,
                                                               @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            
          Appointment appointment = appointmentService.getAppointmentById(id)
    .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointment.setCancellationReason(reason);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentService.saveAppointment(appointment);
            
            // Send cancellation notification
            notificationService.sendAppointmentCancellation(appointment, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hủy lịch hẹn thành công!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi hủy lịch hẹn!");
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/appointments/{id}/reschedule")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> rescheduleAppointment(@PathVariable Long id,
                                                                   @RequestBody Map<String, String> request) {
        try {
            String newDate = request.get("newDate");
            String newTime = request.get("newTime");
            String reason = request.get("reason");
            
          Appointment appointment = appointmentService.getAppointmentById(id)
    .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

            appointment.setAppointmentDate(LocalDate.parse(newDate));
            appointment.setAppointmentTime(LocalTime.parse(newTime));
            appointment.setRescheduleReason(reason);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentService.saveAppointment(appointment);
            
            // Send reschedule notification
            notificationService.sendAppointmentReschedule(appointment, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đổi lịch hẹn thành công!");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi đổi lịch hẹn!");
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/appointments/check-day")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkAppointmentsForDay(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam int day) {
        
        LocalDate date = LocalDate.of(year, month, day);
        List<Appointment> appointments = appointmentService.getAppointmentsByDate(date);
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasAppointments", !appointments.isEmpty());
        response.put("count", appointments.size());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/appointments/category/{category}")
    public String getAppointmentsByCategory(@PathVariable String category, Model model) {
        List<Appointment> appointments;
        
        switch (category) {
            case "today-appointments":
                appointments = appointmentService.getTodayAppointments();
                break;
            case "pending-appointments":
                appointments = appointmentService.getAppointmentsByStatus(AppointmentStatus.SCHEDULED);
                break;
            case "confirmed-appointments":
                appointments = appointmentService.getAppointmentsByStatus(AppointmentStatus.CONFIRMED);
                break;
            case "urgent-appointments":
                appointments = appointmentService.getUrgentAppointments();
                break;
            case "upcoming-appointments":
                appointments = appointmentService.getUpcomingAppointments();
                break;
            default:
                appointments = appointmentService.getTodayAppointments();
        }
        
        model.addAttribute("appointments", appointments);
        return "staff/appointments/fragments/appointment-list";
    }

    private Map<String, Object> getAppointmentStatistics(LocalDate date) {
        List<Appointment> appointments = appointmentService.getAppointmentsByDate(date);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("todayTotal", appointments.size());
        stats.put("pending", appointments.stream().mapToInt(a -> 
            a.getStatus() == AppointmentStatus.SCHEDULED ? 1 : 0).sum());
        stats.put("confirmed", appointments.stream().mapToInt(a -> 
            a.getStatus() == AppointmentStatus.CONFIRMED ? 1 : 0).sum());
        stats.put("completed", appointments.stream().mapToInt(a -> 
            a.getStatus() == AppointmentStatus.COMPLETED ? 1 : 0).sum());
        stats.put("urgent", appointments.stream().mapToInt(a -> 
            "HIGH".equals(a.getPriority()) ? 1 : 0).sum());
        stats.put("upcoming", appointmentService.getUpcomingAppointments().size());
        
        return stats;
    }
}
