package com.hivtreatment.controller;

import com.hivtreatment.entity.*;
import com.hivtreatment.service.*;
import com.hivtreatment.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

// import java.time.LocalDate;
// import java.time.LocalDateTime;
import java.util.*;

@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private UserService userService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private LabResultService labResultService;

    @Autowired
    private HIVPatientProfileService hivPatientProfileService;

    // @Autowired
    // private NotificationService notificationService;

    // @Autowired
    // private ReportService reportService;

    @GetMapping
    public String dashboard(Authentication auth, Model model) {
        Optional<User> optionalUser = userService.getUserByUsername(auth.getName());

        if (optionalUser.isEmpty()) {
            // Có thể chuyển hướng đến trang lỗi hoặc login nếu user không tồn tại
            return "redirect:/login?error=user_not_found";
        }

        User user = optionalUser.get();

        switch (user.getRole()) {
            case PATIENT:
                return "redirect:/dashboard/patient";
            case DOCTOR:
                return "redirect:/dashboard/doctor";
            case ADMIN:
                return "redirect:/dashboard/admin";
            case STAFF:
                return "redirect:/dashboard/staff";
            case MANAGER:
                return "redirect:/dashboard/manager";
            default:
                return "redirect:/";
        }
    }

    @GetMapping("/patient")
    public String patientDashboard(Authentication auth, Model model) {
        Optional<User> optionalUser = userService.getUserByUsername(auth.getName());
        if (optionalUser.isEmpty()) {
            return "redirect:/login?error=user_not_found";
        }

        User user = optionalUser.get();

        Optional<Patient> optionalPatient = patientService.getPatientByUserId(user.getId());
        if (optionalPatient.isEmpty()) {
            return "redirect:/patient/profile/create";
        }

        Patient patient = optionalPatient.get();
        model.addAttribute("patient", patient);

        // HIV Profile
        Optional<HIVPatientProfile> optionalHivProfile = hivPatientProfileService
                .getProfileByPatientId(patient.getId());
        HIVPatientProfile hivProfile = optionalHivProfile.orElse(null);
        model.addAttribute("hivProfile", hivProfile);

        // Active prescriptions
        List<Prescription> activePrescriptions = prescriptionService.getActivePrescriptionsByPatient(patient.getId());
        model.addAttribute("activePrescriptions", activePrescriptions);

        // Upcoming appointments
        List<Appointment> upcomingAppointments = appointmentService.findUpcomingByPatientId(patient.getId());
        model.addAttribute("upcomingAppointments", upcomingAppointments);

        // Recent lab results
        List<LabResult> recentLabResults = labResultService.getRecentLabResultsByPatient(patient.getId(), 5);
        model.addAttribute("recentLabResults", recentLabResults);

        // Treatment progress
        int treatmentProgress = calculateTreatmentProgress(patient, hivProfile);
        model.addAttribute("treatmentProgress", treatmentProgress);

        // Adherence rate
        double adherenceRate = calculateAdherenceRate(patient);
        model.addAttribute("adherenceRate", adherenceRate);

        // Treatment timeline
        List<Map<String, Object>> treatmentTimeline = buildTreatmentTimeline(patient);
        model.addAttribute("treatmentTimeline", treatmentTimeline);

        // ✅ Fixed: Next appointment
        Appointment nextAppointment = appointmentService.findNextByPatientId(patient.getId()).orElse(null);
        model.addAttribute("nextAppointment", nextAppointment);

        return "dashboard/patient-dashboard";
    }

    @GetMapping("/doctor")
    public String doctorDashboard(Authentication auth, Model model) {
        Optional<User> userOpt = userService.getUserByUsername(auth.getName());

        if (userOpt.isEmpty()) {
            return "redirect:/login?error=user-not-found";
        }

        User user = userOpt.get();

        Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
        if (doctorOpt.isEmpty()) {
            return "redirect:/doctor/profile/create";
        }

        Doctor doctor = doctorOpt.get(); // ✅ Fix: Lấy doctor từ Optional
        model.addAttribute("doctor", doctor);

        // Statistics
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalPatients(patientService.countByDoctorId(doctor.getId()));
        stats.setTodayAppointments(appointmentService.countTodayByDoctorId(doctor.getId()));
        stats.setActivePrescriptions(prescriptionService.countActiveByDoctorId(doctor.getId()));
        stats.setOnlineConsultations(7); // From consultation service
        stats.setNewPatientsThisMonth(patientService.countNewThisMonthByDoctorId(doctor.getId()));
        stats.setUpcomingAppointments(appointmentService.countUpcomingByDoctorId(doctor.getId()));
        stats.setNewPrescriptionsThisWeek(prescriptionService.countNewThisWeekByDoctorId(doctor.getId()));
        stats.setPendingConsultations(2); // From consultation service
        model.addAttribute("stats", stats);

        // Today's appointments
        List<Appointment> todayAppointments = appointmentService.findTodayByDoctorId(doctor.getId());
        model.addAttribute("todayAppointments", todayAppointments);

        // Recent patients
        List<Patient> recentPatients = patientService.findRecentByDoctorId(doctor.getId(), 5);
        model.addAttribute("recentPatients", recentPatients);

        // Monthly statistics
        Map<String, Object> monthlyStats = new HashMap<>();
        monthlyStats.put("appointmentsCompleted", appointmentService.countCompletedThisMonthByDoctorId(doctor.getId()));
        monthlyStats.put("prescriptionsIssued", prescriptionService.countThisMonthByDoctorId(doctor.getId()));
        monthlyStats.put("consultationsCompleted", 12); // From consultation service
        monthlyStats.put("labResultsReviewed", labResultService.countReviewedThisMonthByDoctorId(doctor.getId()));
        monthlyStats.put("completionPercentage", 85);
        model.addAttribute("monthlyStats", monthlyStats);

        return "doctor/dashboard";
    }

    @GetMapping("/admin")
    public String adminDashboard(Authentication auth, Model model) {
        // System statistics
        Map<String, Object> systemStats = new HashMap<>();
        systemStats.put("totalUsers", userService.countAll());
        systemStats.put("activePatients", patientService.getActivePatientCount());

        systemStats.put("activeDoctors", doctorService.getAvailableDoctorCount());

        systemStats.put("todayAppointments", appointmentService.countToday());
        systemStats.put("activePrescriptions", prescriptionService.countActive());
        systemStats.put("systemUptime", "99.9%");
        model.addAttribute("systemStats", systemStats);

        // Main statistics
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalUsers(userService.countAll());
        stats.setTotalPatients(patientService.getTotalPatientCount());
        stats.setTotalDoctors(doctorService.getTotalDoctorCount());
        stats.setTotalAppointments(appointmentService.countAll());
        stats.setTotalPrescriptions(prescriptionService.countAll());
        stats.setNewUsersThisMonth(userService.countNewThisMonth());
        stats.setActivePatients(patientService.getActivePatientCount());
        stats.setAvailableDoctors(doctorService.getAvailableDoctorCount());

        stats.setTodayAppointments(appointmentService.countToday());
        stats.setActivePrescriptions(prescriptionService.countActive());
        stats.setMonthlyRevenue("2.5M");
        stats.setRevenueGrowth("12%");
        model.addAttribute("stats", stats);

        // User distribution
        Map<String, String> userDistribution = new HashMap<>();
        userDistribution.put("patients", "69%");
        userDistribution.put("doctors", "15%");
        userDistribution.put("staff", "12%");
        userDistribution.put("managers", "4%");
        model.addAttribute("userDistribution", userDistribution);

        // Recent users
        List<User> recentUsers = userService.getRecentUsers(10);
        model.addAttribute("recentUsers", recentUsers);

        // System alerts
        List<Map<String, Object>> systemAlerts = new ArrayList<>();
        // Add system alerts logic here
        model.addAttribute("systemAlerts", systemAlerts);

        // Chart data
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("activityLabels", Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"));
        chartData.put("appointmentData", Arrays.asList(65, 59, 80, 81, 56, 55, 40));
        chartData.put("prescriptionData", Arrays.asList(28, 48, 40, 19, 86, 27, 90));
        chartData.put("consultationData", Arrays.asList(18, 28, 30, 29, 46, 37, 60));
        chartData.put("userDistributionData", Arrays.asList(69, 15, 12, 4));
        model.addAttribute("chartData", chartData);

        return "admin/dashboard";
    }

    @GetMapping("/staff")
    public String staffDashboard(Authentication auth, Model model) {
        Optional<User> userOpt = userService.getUserByUsername(auth.getName());

        if (userOpt.isEmpty()) {
            return "redirect:/login?error=user-not-found";
        }

        User user = userOpt.get();
        model.addAttribute("user", user);

        // Staff basic info
        Map<String, Object> staff = new HashMap<>();
        staff.put("fullName", user.getUsername());
        staff.put("staffCode", "NV001234");
        staff.put("department", "Phòng tiếp nhận");
        model.addAttribute("staff", staff);

        // Today's statistics
        Map<String, Object> todayStats = new HashMap<>();
        todayStats.put("totalTasks", 12);
        todayStats.put("completedTasks", 8);
        todayStats.put("patientsServed", 25);
        todayStats.put("pendingTasks", 4);
        model.addAttribute("todayStats", todayStats);

        // Task statistics
        Map<String, Object> taskStats = new HashMap<>();
        taskStats.put("pendingTasks", 4);
        taskStats.put("inProgressTasks", 3);
        taskStats.put("completedTasks", 8);
        taskStats.put("overdueTasks", 1);
        taskStats.put("urgentTasks", 2);
        model.addAttribute("taskStats", taskStats);

        // Patient queue
        List<Map<String, Object>> patientQueue = new ArrayList<>();
        // TODO: Add patient queue logic here
        model.addAttribute("patientQueue", patientQueue);

        // Today's time slots
        List<Map<String, Object>> todayTimeSlots = buildTodayTimeSlots(); // Assuming this method exists
        model.addAttribute("todayTimeSlots", todayTimeSlots);

        // Today's tasks
        List<Map<String, Object>> todayTasks = new ArrayList<>();
        // TODO: Add today's tasks logic here
        model.addAttribute("todayTasks", todayTasks);

        // Notifications
        List<Map<String, Object>> notifications = new ArrayList<>();
        // TODO: Add notifications logic here
        model.addAttribute("notifications", notifications);

        return "staff/dashboard"; // 👈 View name
    }

    @GetMapping("/manager")
    public String managerDashboard(Authentication auth, Model model) {
        // KPIs
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("monthlyRevenue", "2.5M");
        kpis.put("totalPatients", "1,234");
        kpis.put("operationalEfficiency", "87%");
        kpis.put("patientSatisfaction", "4.8");
        kpis.put("totalStaff", "89");
        kpis.put("overallGrowth", "+15%");
        kpis.put("revenueGrowth", "+12%");
        kpis.put("patientGrowth", "+8%");
        kpis.put("efficiencyChange", "+3%");
        kpis.put("satisfactionChange", "0%");
        kpis.put("staffGrowth", "+5%");
        model.addAttribute("kpis", kpis);

        // Overall performance
        model.addAttribute("overallPerformance", 87);

        // Performance metrics
        Map<String, String> performanceMetrics = new HashMap<>();
        performanceMetrics.put("quality", "92%");
        performanceMetrics.put("efficiency", "85%");
        performanceMetrics.put("satisfaction", "89%");
        performanceMetrics.put("growth", "78%");
        model.addAttribute("performanceMetrics", performanceMetrics);

        // Department performance
        List<Map<String, Object>> departmentPerformance = new ArrayList<>();
        // Add department performance logic here
        model.addAttribute("departmentPerformance", departmentPerformance);

        // Critical issues
        List<Map<String, Object>> criticalIssues = new ArrayList<>();
        // Add critical issues logic here
        model.addAttribute("criticalIssues", criticalIssues);

        // Financial overview
        Map<String, String> financialOverview = new HashMap<>();
        financialOverview.put("totalRevenue", "15.2M");
        financialOverview.put("totalExpenses", "8.7M");
        financialOverview.put("netProfit", "6.5M");
        financialOverview.put("profitMargin", "42.8%");
        model.addAttribute("financialOverview", financialOverview);

        // Chart data
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("trendsLabels", Arrays.asList("Jan", "Feb", "Mar", "Apr", "May", "Jun"));
        chartData.put("revenueData", Arrays.asList(2.1, 2.3, 2.5, 2.2, 2.7, 2.5));
        chartData.put("patientsData", Arrays.asList(45, 52, 48, 61, 55, 67));
        chartData.put("efficiencyData", Arrays.asList(82, 85, 87, 84, 89, 87));
        chartData.put("financialLabels", Arrays.asList("Q1", "Q2", "Q3", "Q4"));
        chartData.put("quarterlyRevenue", Arrays.asList(3.8, 4.2, 3.9, 4.3));
        chartData.put("quarterlyExpenses", Arrays.asList(2.1, 2.3, 2.2, 2.4));
        chartData.put("quarterlyProfit", Arrays.asList(1.7, 1.9, 1.7, 1.9));
        model.addAttribute("chartData", chartData);

        return "manager/dashboard";
    }

    // AJAX endpoints for real-time updates
    @GetMapping("/doctor/refresh")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> refreshDoctorDashboard(Authentication auth) {
        Map<String, Object> response = new HashMap<>();
        response.put("hasUpdates", false); // Check for actual updates
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/refresh")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> refreshAdminDashboard() {
        Map<String, Object> response = new HashMap<>();
        response.put("hasUpdates", false); // Check for actual updates
        return ResponseEntity.ok(response);
    }

    @GetMapping("/staff/refresh")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> refreshStaffDashboard() {
        Map<String, Object> response = new HashMap<>();
        response.put("hasUpdates", false); // Check for actual updates
        return ResponseEntity.ok(response);
    }

    @GetMapping("/manager/refresh")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> refreshManagerDashboard() {
        Map<String, Object> response = new HashMap<>();
        response.put("hasUpdates", false); // Check for actual updates
        return ResponseEntity.ok(response);
    }

    // Helper methods
    private int calculateTreatmentProgress(Patient patient, HIVPatientProfile hivProfile) {
        int progress = 0;

        if (hivProfile != null) {
            Integer cd4 = hivProfile.getCurrentCD4Count();
            if (cd4 != null) {
                if (cd4 >= 500) {
                    progress += 30;
                } else if (cd4 >= 200) {
                    progress += 20;
                }
            }

            Boolean isUndetectable = hivProfile.getViralLoadUndetectable();
            if (isUndetectable != null && isUndetectable) {
                progress += 40;
            }
        }

        // Add other factors
        progress += 35; // Base progress for being in treatment

        return Math.min(progress, 100);
    }

    private double calculateAdherenceRate(Patient patient) {
        // Calculate medication adherence rate
        // This would involve checking prescription compliance
        return 95.0; // Placeholder
    }

    private List<Map<String, Object>> buildTreatmentTimeline(Patient patient) {
        List<Map<String, Object>> timeline = new ArrayList<>();

        // Add recent appointments, prescriptions, lab results
        List<Appointment> recentAppointments = appointmentService.findRecentByPatientId(patient.getId(), 3);
        for (Appointment appointment : recentAppointments) {
            Map<String, Object> event = new HashMap<>();
            event.put("type", "appointment");
            event.put("title", "Khám định kỳ");
            event.put("description", "Khám với " + appointment.getDoctor().getFullName());
            event.put("date", appointment.getAppointmentDate());
            timeline.add(event);
        }

        return timeline;
    }

    private List<Map<String, Object>> buildTodayTimeSlots() {
        List<Map<String, Object>> timeSlots = new ArrayList<>();

        // Generate time slots from 8:00 to 17:00
        for (int hour = 8; hour < 17; hour++) {
            Map<String, Object> slot = new HashMap<>();
            slot.put("id", hour);
            slot.put("time", String.format("%02d:00", hour));
            slot.put("isBooked", Math.random() > 0.5); // Random for demo
            if ((Boolean) slot.get("isBooked")) {
                slot.put("patientName", "Nguyễn Văn A");
                slot.put("doctorName", "BS. Nguyễn Thị B");
            }
            timeSlots.add(slot);
        }

        return timeSlots;
    }
}
