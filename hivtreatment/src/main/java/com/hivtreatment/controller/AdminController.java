package com.hivtreatment.controller;

import com.hivtreatment.dto.DashboardStatsDTO;
import com.hivtreatment.dto.PatientSearchParams;
import com.hivtreatment.dto.PatientStatsDTO;
import com.hivtreatment.dto.MonthlyReportDTO;
import com.hivtreatment.dto.AnnualReportDTO;

import com.hivtreatment.entity.*;
import com.hivtreatment.enums.UserRole;
import com.hivtreatment.enums.ReportStatus;
import com.hivtreatment.enums.SymptomSeverity;
import com.hivtreatment.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private ReportService reportService;

@Autowired
private LabResultService labResultService;

@Autowired
private PrescriptionService prescriptionService;

@Autowired
private HIVPatientProfileService hivPatientProfileService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SymptomReportService symptomReportService;

    @GetMapping("/dashboard")
    public String adminDashboard(Model model) {
        // Get comprehensive dashboard statistics
        DashboardStatsDTO dashboardStats = reportService.getAdminDashboardStats();

        
        // Get recent users (last 10)
        List<User> recentUsers = userService.getRecentUsers(10);
        
        // Get system alerts
        // List<SystemAlert> systemAlerts = systemService.getActiveAlerts();
        
        // Get user distribution for chart
        Map<String, Integer> userDistribution = reportService.getUserDistribution();
        
        // Get chart data for activity
        Map<String, Object> chartData = reportService.getSystemActivityChartData("week");
        
        // Get urgent symptom reports
        List<SymptomReport> urgentReports = symptomReportService.getUrgentReports();
        
        model.addAttribute("dashboardStats", dashboardStats);
        // model.addAttribute("systemStats", systemStats);
        model.addAttribute("recentUsers", recentUsers);
        // model.addAttribute("systemAlerts", systemAlerts);
        model.addAttribute("userDistribution", userDistribution);
        model.addAttribute("chartData", chartData);
        model.addAttribute("urgentReports", urgentReports);
        
        return "admin/dashboard-complete";
    }

    // User Management
    @GetMapping("/users")
    public String listUsers(@RequestParam(defaultValue = "0") int page,
                           @RequestParam(defaultValue = "20") int size,
                           @RequestParam(required = false) String search,
                           @RequestParam(required = false) UserRole role,
                           @RequestParam(required = false) Boolean isActive,
                           Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<User> userPage;
        if (search != null && !search.isEmpty()) {
            userPage = userService.searchUsers(search, pageable);
        } else if (role != null) {
            userPage = userService.getUsersByRole(role, pageable);
        } else if (isActive != null) {
            userPage = userService.getUsersByActiveStatus(isActive, pageable);
        } else {
            userPage = userService.getAllUsers(pageable);
        }
        
        model.addAttribute("users", userPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", userPage.getTotalPages());
        model.addAttribute("totalElements", userPage.getTotalElements());
        model.addAttribute("searchKeyword", search);
        model.addAttribute("selectedRole", role);
        model.addAttribute("selectedStatus", isActive);
        model.addAttribute("roles", UserRole.values());
        
        return "admin/users/list";
    }

    @GetMapping("/users/create")
    public String createUserForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", UserRole.values());
        return "admin/users/create";
    }

    @PostMapping("/users/create")
    public String createUser(@Valid @ModelAttribute User user, 
                           BindingResult result, 
                           RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "admin/users/create";
        }

        if (userService.existsByUsername(user.getUsername())) {
            result.rejectValue("username", "error.user", "Tên đăng nhập đã tồn tại");
            return "admin/users/create";
        }

        if (userService.existsByEmail(user.getEmail())) {
            result.rejectValue("email", "error.user", "Email đã được sử dụng");
            return "admin/users/create";
        }

        try {
            User savedUser = userService.createUser(user);
            
            // Create corresponding profile based on role
            if (user.getRole() == UserRole.PATIENT) {
                patientService.createPatientProfile(savedUser);
            } else if (user.getRole() == UserRole.DOCTOR) {
                doctorService.createDoctorProfile(savedUser);
            }
            
            redirectAttributes.addFlashAttribute("successMessage", "Tạo người dùng thành công!");
            return "redirect:/admin/users";
        } catch (Exception e) {
            result.rejectValue("username", "error.user", "Có lỗi xảy ra khi tạo người dùng");
            return "admin/users/create";
        }
    }

    @GetMapping("/users/{id}")
    public String viewUser(@PathVariable Long id, Model model) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            model.addAttribute("user", user);
            
            // Get additional profile data based on role
            if (user.getRole() == UserRole.PATIENT) {
                Optional<Patient> patient = patientService.getPatientByUserId(id);
                model.addAttribute("patient", patient.orElse(null));
            } else if (user.getRole() == UserRole.DOCTOR) {
                Optional<Doctor> doctor = doctorService.getDoctorByUserId(id);
                model.addAttribute("doctor", doctor.orElse(null));
            }
            
            // Get user activity log
            List<UserActivity> activities = userService.getUserActivities(id, 20);
            model.addAttribute("activities", activities);
            
            return "admin/users/view";
        }
        return "redirect:/admin/users";
    }

    @GetMapping("/users/{id}/edit")
    public String editUserForm(@PathVariable Long id, Model model) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            model.addAttribute("user", userOpt.get());
            model.addAttribute("roles", UserRole.values());
            return "admin/users/edit";
        }
        return "redirect:/admin/users";
    }

    @PostMapping("/users/{id}/edit")
    public String editUser(@PathVariable Long id, 
                          @Valid @ModelAttribute User user, 
                          BindingResult result, 
                          RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "admin/users/edit";
        }

        try {
            user.setId(id);
            userService.updateUser(user);
            redirectAttributes.addFlashAttribute("successMessage", "Cập nhật người dùng thành công!");
            return "redirect:/admin/users/" + id;
        } catch (Exception e) {
            result.rejectValue("username", "error.user", "Có lỗi xảy ra khi cập nhật");
            return "admin/users/edit";
        }
    }

    @PostMapping("/users/{id}/toggle-status")
    @ResponseBody
    public String toggleUserStatus(@PathVariable Long id) {
        try {
            userService.toggleUserStatus(id);
            return "success";
        } catch (Exception e) {
            return "error";
        }
    }

    @PostMapping("/users/{id}/delete")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            userService.deleteUser(id);
            redirectAttributes.addFlashAttribute("successMessage", "Xóa người dùng thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Không thể xóa người dùng!");
        }
        return "redirect:/admin/users";
    }

    // Patient Management
    @GetMapping("/patients")
    public String listPatients(@RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "12") int size,
                              @RequestParam(required = false) String search,
                              @RequestParam(required = false) String treatmentStatus,
                              @RequestParam(required = false) String gender,
                              @RequestParam(required = false) Long doctorId,
                              Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        
        // Build search parameters
        PatientSearchParams searchParams = PatientSearchParams.builder()
            .search(search)
            .treatmentStatus(treatmentStatus)
            .gender(gender)
            .doctorId(doctorId)
            .build();
        
        Page<Patient> patientPage = patientService.searchPatients(searchParams, pageable);
        
        // Get available doctors for filter
        List<Doctor> doctors = doctorService.getAvailableDoctors();
        
        model.addAttribute("patients", patientPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", patientPage.getTotalPages());
        model.addAttribute("totalPatients", patientPage.getTotalElements());
        model.addAttribute("activePatients", patientService.getActivePatientCount());
        model.addAttribute("doctors", doctors);
        model.addAttribute("searchParams", searchParams);
        
        return "admin/patients/list";
    }

    @GetMapping("/patients/{id}")
    public String viewPatient(@PathVariable Long id, Model model) {
        Optional<Patient> patientOpt = patientService.getPatientById(id);
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            
            // Get comprehensive patient data
            List<Appointment> appointments = appointmentService.getAppointmentsByPatient(id);
            List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatient(id);
            List<LabResult> labResults = labResultService.getLabResultsByPatient(id);
           Optional<HIVPatientProfile> hivProfile = hivPatientProfileService.getProfileByPatientId(id);

            
            // Get symptom reports for this patient
            List<SymptomReport> symptomReports = symptomReportService.getReportsByPatient(
                id, PageRequest.of(0, 10, Sort.by("createdAt").descending())).getContent();
            
            // Get treatment statistics
            PatientStatsDTO patientStats = reportService.getPatientStats(id);
            
            model.addAttribute("patient", patient);
            model.addAttribute("appointments", appointments);
            model.addAttribute("prescriptions", prescriptions);
            model.addAttribute("labResults", labResults);
            model.addAttribute("hivProfile", hivProfile.orElse(null));
            model.addAttribute("symptomReports", symptomReports);
            model.addAttribute("patientStats", patientStats);
            
            return "admin/patients/view";
        }
        return "redirect:/admin/patients";
    }

    // Doctor Management
    @GetMapping("/doctors")
    public String listDoctors(@RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "12") int size,
                             @RequestParam(required = false) String search,
                             @RequestParam(required = false) String specialization,
                             @RequestParam(required = false) Boolean isAvailable,
                             Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Doctor> doctorPage;
        if (search != null && !search.isEmpty()) {
            doctorPage = doctorService.searchDoctors(search, pageable);
        } else if (specialization != null && !specialization.isEmpty()) {
            doctorPage = doctorService.getDoctorsBySpecialization(specialization, pageable);
        } else if (isAvailable != null) {
            doctorPage = doctorService.getDoctorsByAvailability(isAvailable, pageable);
        } else {
            doctorPage = doctorService.getAllDoctors(pageable);
        }
        
        // Get specializations for filter
        List<String> specializations = doctorService.getAllSpecializations();
        
        model.addAttribute("doctors", doctorPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", doctorPage.getTotalPages());
        model.addAttribute("totalDoctors", doctorPage.getTotalElements());
        model.addAttribute("availableDoctors", doctorService.getAvailableDoctorCount());
        model.addAttribute("specializations", specializations);
        model.addAttribute("searchKeyword", search);
        model.addAttribute("selectedSpecialization", specialization);
        model.addAttribute("selectedAvailability", isAvailable);
        
        return "admin/doctors/list";
    }

    @GetMapping("/doctors/create")
    public String createDoctorForm(Model model) {
        model.addAttribute("doctor", new Doctor());
        
        // Get users with DOCTOR role who don't have doctor profile yet
        List<User> availableUsers = userService.getUsersWithoutDoctorProfile();
        model.addAttribute("availableUsers", availableUsers);
        
        return "admin/doctors/create";
    }

    @PostMapping("/doctors/create")
    public String createDoctor(@Valid @ModelAttribute Doctor doctor, 
                              BindingResult result, 
                              RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "admin/doctors/create";
        }

        try {
            if (doctor.getDoctorCode() == null || doctor.getDoctorCode().isEmpty()) {
                doctor.setDoctorCode(doctorService.generateDoctorCode());
            }
            
            Doctor savedDoctor = doctorService.createDoctor(doctor);
            redirectAttributes.addFlashAttribute("successMessage", "Tạo bác sĩ thành công!");
            return "redirect:/admin/doctors/" + savedDoctor.getId();
        } catch (Exception e) {
            result.rejectValue("doctorCode", "error.doctor", "Có lỗi xảy ra khi tạo bác sĩ");
            return "admin/doctors/create";
        }
    }

    // Reports
    @GetMapping("/reports")
    public String reports(Model model) {
        // Get report summary data
        Map<String, Object> reportSummary = reportService.getReportSummary();
        model.addAttribute("reportSummary", reportSummary);
        
        return "admin/reports/index";
    }

    @GetMapping("/reports/monthly")
public String monthlyReport(@RequestParam(defaultValue = "2024") int year,
                            @RequestParam(defaultValue = "1") int month,
                            Model model) {

    Map<String, Object> data = reportService.getMonthlyReport(year, month);

    MonthlyReportDTO report = new MonthlyReportDTO();
    report.setTotalAppointments((int) data.getOrDefault("totalAppointments", 0));
    report.setConfirmedAppointments((int) data.getOrDefault("confirmedAppointments", 0));
    report.setCancelledAppointments((int) data.getOrDefault("cancelledAppointments", 0));
    report.setCompletedAppointments((int) data.getOrDefault("completedAppointments", 0));

    // An toàn khi ép kiểu từ Object sang List<String>
    List<String> medications = new ArrayList<>();
    Object medsObj = data.get("mostPrescribedMedications");
    if (medsObj instanceof List<?>) {
        for (Object med : (List<?>) medsObj) {
            if (med instanceof String) {
                medications.add((String) med);
            }
        }
    }
    report.setMostPrescribedMedications(medications);

    model.addAttribute("report", report);
    model.addAttribute("year", year);
    model.addAttribute("month", month);

    return "admin/reports/monthly";
}



    @GetMapping("/reports/annual")
public String annualReport(@RequestParam(defaultValue = "2024") int year, Model model) {
    Map<String, Object> data = reportService.getAnnualReport(year);

    AnnualReportDTO report = new AnnualReportDTO();
    report.setTotalAppointments((int) data.getOrDefault("totalAppointments", 0));
    report.setTotalPatients((int) data.getOrDefault("totalPatients", 0));
    report.setTotalPrescriptions((int) data.getOrDefault("totalPrescriptions", 0));

    // Safe cast from Object to Map<Integer, Integer>
    Map<Integer, Integer> appointmentsPerMonth = new HashMap<>();
    Object mapObj = data.get("appointmentsPerMonth");
    if (mapObj instanceof Map<?, ?> rawMap) {
        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
            if (entry.getKey() instanceof Integer && entry.getValue() instanceof Integer) {
                appointmentsPerMonth.put((Integer) entry.getKey(), (Integer) entry.getValue());
            }
        }
    }
    report.setAppointmentsPerMonth(appointmentsPerMonth);

    model.addAttribute("report", report);
    model.addAttribute("year", year);

    return "admin/reports/annual";
}



    

    // Symptom Reports Management for Admin
    @GetMapping("/symptom-reports")
    public String adminSymptomReports(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "15") int size,
                                     @RequestParam(required = false) String status,
                                     @RequestParam(required = false) String severity,
                                     @RequestParam(required = false) String search,
                                     @RequestParam(required = false) Long patientId,
                                     @RequestParam(required = false) Long doctorId,
                                     Model model) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<SymptomReport> reportPage;
        
        if (search != null && !search.isEmpty()) {
            reportPage = symptomReportService.searchReports(search, pageable);
        } else if (patientId != null) {
            reportPage = symptomReportService.getReportsByPatient(patientId, pageable);
        } else if (doctorId != null) {
            reportPage = symptomReportService.getReportsByDoctor(doctorId, pageable);
        } else if (status != null && !status.isEmpty()) {
            reportPage = symptomReportService.getReportsByStatus(ReportStatus.valueOf(status), pageable);
        } else if (severity != null && !severity.isEmpty()) {
            reportPage = symptomReportService.getReportsBySeverity(SymptomSeverity.valueOf(severity), pageable);
        } else {
            reportPage = symptomReportService.getAllReports(pageable);
        }
        
        // Get statistics
        long totalReports = symptomReportService.getTotalReportsCount();
        long pendingReports = symptomReportService.getPendingReportsCount();
        long urgentReports = symptomReportService.getUrgentReportsCount();
        long reviewedReports = symptomReportService.getReviewedReportsCount();
        
        // Get doctors for filter
        List<Doctor> doctors = doctorService.getAvailableDoctors();
        
        model.addAttribute("reports", reportPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", reportPage.getTotalPages());
        model.addAttribute("totalElements", reportPage.getTotalElements());
        model.addAttribute("selectedStatus", status);
        model.addAttribute("selectedSeverity", severity);
        model.addAttribute("searchKeyword", search);
        model.addAttribute("selectedPatientId", patientId);
        model.addAttribute("selectedDoctorId", doctorId);
        model.addAttribute("totalReports", totalReports);
        model.addAttribute("pendingReports", pendingReports);
        model.addAttribute("urgentReports", urgentReports);
        model.addAttribute("reviewedReports", reviewedReports);
        model.addAttribute("doctors", doctors);
        
        return "admin/symptom-reports/list";
    }

    @GetMapping("/symptom-reports/{id}")
    public String adminViewSymptomReport(@PathVariable Long id, Model model) {
        Optional<SymptomReport> reportOpt = symptomReportService.getReportById(id);
        if (reportOpt.isPresent()) {
            SymptomReport report = reportOpt.get();
            
            // Get patient's recent medical history
            List<Appointment> recentAppointments = appointmentService
                .getRecentAppointmentsByPatient(report.getPatient().getId(), 5);
            List<Prescription> activePrescriptions = prescriptionService
                .getActivePrescriptionsByPatient(report.getPatient().getId());
            List<LabResult> recentLabResults = labResultService
                .getRecentLabResultsByPatient(report.getPatient().getId(), 5);
            
            model.addAttribute("report", report);
            model.addAttribute("recentAppointments", recentAppointments);
            model.addAttribute("activePrescriptions", activePrescriptions);
            model.addAttribute("recentLabResults", recentLabResults);
            
            return "admin/symptom-reports/view";
        }
        return "redirect:/admin/symptom-reports";
    }

    @PostMapping("/symptom-reports/{id}/assign-doctor")
    public String assignDoctorToReport(@PathVariable Long id,
                                      @RequestParam Long doctorId,
                                      RedirectAttributes redirectAttributes) {
        try {
            Optional<SymptomReport> reportOpt = symptomReportService.getReportById(id);
            Optional<Doctor> doctorOpt = doctorService.getDoctorById(doctorId);
            
            if (reportOpt.isPresent() && doctorOpt.isPresent()) {
                SymptomReport report = reportOpt.get();
                Doctor doctor = doctorOpt.get();
                
                // Assign doctor and update status
                report.setReviewedByDoctor(doctor);
                report.setStatus(ReportStatus.IN_PROGRESS);
                symptomReportService.updateReportStatus(id, ReportStatus.IN_PROGRESS);
                
                // Notify doctor
                notificationService.notifyDoctorOfAssignedSymptomReport(report, doctor);
                
                redirectAttributes.addFlashAttribute("successMessage", "Đã phân công bác sĩ thành công!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi phân công bác sĩ!");
        }
        
        return "redirect:/admin/symptom-reports/" + id;
    }

    // AJAX endpoints
    @GetMapping("/dashboard/chart-data")
    @ResponseBody
    public Map<String, Object> getChartData(@RequestParam String period) {
        return reportService.getSystemActivityChartData(period);
    }

   
}
