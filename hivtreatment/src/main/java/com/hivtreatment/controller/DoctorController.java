package com.hivtreatment.controller;

import com.hivtreatment.dto.DashboardStatsDTO;
import com.hivtreatment.entity.*;
import com.hivtreatment.enums.AppointmentStatus;
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
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/doctor")
@PreAuthorize("hasAnyRole('DOCTOR', 'MANAGER', 'ADMIN')")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;
    @Autowired
private TaskService taskService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private LabResultService labResultService;

    @Autowired
    private ConsultationService consultationService;
      @Autowired
    private MedicationService medicationService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private HIVPatientProfileService hivPatientProfileService;

    @Autowired
    private SymptomReportService symptomReportService;

   @GetMapping("/dashboard")
public String doctorDashboard(Authentication authentication, Model model) {
    User user = (User) authentication.getPrincipal();
    Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());

    if (doctorOpt.isPresent()) {
        Doctor doctor = doctorOpt.get();

        // Get dashboard statistics
        DashboardStatsDTO stats = reportService.getDoctorDashboardStats(doctor.getId());

        // Get today's appointments
        List<Appointment> todayAppointments = appointmentService
            .getAppointmentsByDoctorAndDate(doctor.getId(), LocalDate.now());

        // ✅ Get recent patients (patients with recent appointments)
        List<Patient> recentPatients = patientService.findRecentByDoctorId(doctor.getId(), 10);

        // Get urgent symptom reports
        List<SymptomReport> urgentReports = symptomReportService.getUrgentReports();

        // Get pending symptom reports for this doctor
        Page<SymptomReport> pendingReports = symptomReportService.getReportsByDoctor(
            doctor.getId(), PageRequest.of(0, 5, Sort.by("createdAt").descending()));

        model.addAttribute("doctor", doctor);
        model.addAttribute("stats", stats);
        model.addAttribute("todayAppointments", todayAppointments);
        model.addAttribute("recentPatients", recentPatients);
        model.addAttribute("urgentReports", urgentReports);
        model.addAttribute("pendingReports", pendingReports.getContent());

        return "doctor/dashboard-complete";
    }

    return "redirect:/dashboard";
}

    @GetMapping("/profile")
    public String profile(Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
        
        if (doctorOpt.isPresent()) {
            model.addAttribute("doctor", doctorOpt.get());
            return "doctor/profile";
        }
        
        return "redirect:/dashboard";
    }

    @PostMapping("/profile")
    public String updateProfile(@Valid @ModelAttribute Doctor doctor, 
                               BindingResult result, 
                               Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "doctor/profile";
        }

        try {
            User user = (User) authentication.getPrincipal();
            Optional<Doctor> existingDoctorOpt = doctorService.getDoctorByUserId(user.getId());
            
            if (existingDoctorOpt.isPresent()) {
                Doctor existingDoctor = existingDoctorOpt.get();
                existingDoctor.setFirstName(doctor.getFirstName());
                existingDoctor.setLastName(doctor.getLastName());
                existingDoctor.setPhone(doctor.getPhone());
                existingDoctor.setSpecialization(doctor.getSpecialization());
                existingDoctor.setQualification(doctor.getQualification());
                existingDoctor.setExperienceYears(doctor.getExperienceYears());
                existingDoctor.setConsultationFee(doctor.getConsultationFee());
                
                doctorService.updateDoctor(existingDoctor);
                redirectAttributes.addFlashAttribute("successMessage", "Cập nhật hồ sơ thành công!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi cập nhật!");
        }
        
        return "redirect:/doctor/profile";
    }

   @GetMapping("/appointments")
public String appointments(Authentication authentication,
                          @RequestParam(defaultValue = "0") int page,
                          @RequestParam(defaultValue = "10") int size,
                          @RequestParam(required = false) String status,
                          @RequestParam(required = false) String date,
                          Model model) {

    User user = (User) authentication.getPrincipal();
    Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());

    if (doctorOpt.isPresent()) {
        Doctor doctor = doctorOpt.get();
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate").descending());

        Page<Appointment> appointmentPage;

        try {
            if (status != null && !status.isEmpty()) {
                AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
                appointmentPage = appointmentService.getAppointmentsByDoctorAndStatus(
                    doctor.getId(), appointmentStatus, pageable
                );
            } else if (date != null && !date.isEmpty()) {
                LocalDate filterDate = LocalDate.parse(date);
                appointmentPage = appointmentService.getAppointmentsByDoctorAndDate(
                    doctor.getId(), filterDate, pageable
                );
            } else {
                appointmentPage = appointmentService.getAppointmentsByDoctor(
                    doctor.getId(), pageable
                );
            }
        } catch (IllegalArgumentException | DateTimeException e) {
            // Xử lý nếu status hoặc date sai định dạng
            appointmentPage = appointmentService.getAppointmentsByDoctor(doctor.getId(), pageable);
            model.addAttribute("error", "Bộ lọc không hợp lệ. Đang hiển thị toàn bộ lịch hẹn.");
        }

        model.addAttribute("appointments", appointmentPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", appointmentPage.getTotalPages());
        model.addAttribute("totalElements", appointmentPage.getTotalElements());
        model.addAttribute("selectedStatus", status);
        model.addAttribute("selectedDate", date);

        return "doctor/appointments/list";
    }

    return "redirect:/dashboard";
}

   @GetMapping("/appointments/{id}")
public String viewAppointment(@PathVariable Long id, Model model) {
    Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(id);
    if (appointmentOpt.isPresent()) {
        Appointment appointment = appointmentOpt.get();

        Long patientId = appointment.getPatient().getId();

        // Get patient's HIV profile
        Optional<HIVPatientProfile> hivProfile = hivPatientProfileService
            .getProfileByPatientId(patientId);

        // Get recent lab results
        List<LabResult> recentLabResults = labResultService
            .getRecentLabResultsByPatient(patientId, 5);

        // Get active prescriptions
        List<Prescription> activePrescriptions = prescriptionService
            .getActivePrescriptionsByPatient(patientId);

        model.addAttribute("appointment", appointment);
        model.addAttribute("hivProfile", hivProfile.orElse(null));
        model.addAttribute("recentLabResults", recentLabResults);
        model.addAttribute("activePrescriptions", activePrescriptions);

        return "doctor/appointments/view";
    }
    return "redirect:/doctor/appointments";
}

    @PostMapping("/appointments/{id}/confirm")
    @ResponseBody
    public String confirmAppointment(@PathVariable Long id) {
        try {
            appointmentService.confirmAppointment(id);
            return "success";
        } catch (Exception e) {
            return "error";
        }
    }

    @PostMapping("/appointments/{id}/complete")
    @ResponseBody
    public String completeAppointment(@PathVariable Long id) {
        try {
            appointmentService.completeAppointment(id);
            return "success";
        } catch (Exception e) {
            return "error";
        }
    }

    // Patient Management
    @GetMapping("/patients")
    public String myPatients(Authentication authentication, 
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "12") int size,
                            @RequestParam(required = false) String search,
                            Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
        
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
            
            Page<Patient> patientPage;
            if (search != null && !search.isEmpty()) {
                patientPage = patientService.searchPatientsByDoctorAndKeyword(
                    doctor.getId(), search, pageable);
            } else {
                patientPage = patientService.getPatientsByDoctor(doctor.getId(), pageable);
            }
            
            model.addAttribute("patients", patientPage.getContent());
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", patientPage.getTotalPages());
            model.addAttribute("totalElements", patientPage.getTotalElements());
            model.addAttribute("searchKeyword", search);
            
            return "doctor/patients/list";
        }
        
        return "redirect:/dashboard";
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

        // ✅ Sửa tên hàm: getProfileByPatientId
        Optional<HIVPatientProfile> hivProfile = hivPatientProfileService.getProfileByPatientId(id);

        // Get symptom reports for this patient
        List<SymptomReport> symptomReports = symptomReportService.getReportsByPatient(
            id, PageRequest.of(0, 10, Sort.by("createdAt").descending())).getContent();

        model.addAttribute("patient", patient);
        model.addAttribute("appointments", appointments);
        model.addAttribute("prescriptions", prescriptions);
        model.addAttribute("labResults", labResults);
        model.addAttribute("hivProfile", hivProfile.orElse(null));
        model.addAttribute("symptomReports", symptomReports);

        return "doctor/patients/view";
    }
    return "redirect:/doctor/patients";
}


    // Prescription Management
    @GetMapping("/prescriptions")
    public String prescriptions(Authentication authentication, 
                               @RequestParam(defaultValue = "0") int page,
                               @RequestParam(defaultValue = "10") int size,
                               @RequestParam(required = false) String status,
                               Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
        
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            Pageable pageable = PageRequest.of(page, size, Sort.by("prescriptionDate").descending());
            
            Page<Prescription> prescriptionPage;
            if (status != null && !status.isEmpty()) {
                prescriptionPage = prescriptionService.getPrescriptionsByDoctorAndStatus(
                    doctor.getId(), status, pageable);
            } else {
                prescriptionPage = prescriptionService.getPrescriptionsByDoctor(doctor.getId(), pageable);
            }
            
            model.addAttribute("prescriptions", prescriptionPage.getContent());
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", prescriptionPage.getTotalPages());
            model.addAttribute("selectedStatus", status);
            
            return "doctor/prescriptions/list";
        }
        
        return "redirect:/dashboard";
    }

    @GetMapping("/prescriptions/create")
    public String createPrescriptionForm(@RequestParam(required = false) Long patientId, Model model) {
        model.addAttribute("prescription", new Prescription());
        
        if (patientId != null) {
            Optional<Patient> patientOpt = patientService.getPatientById(patientId);
            patientOpt.ifPresent(patient -> model.addAttribute("selectedPatient", patient));
        }
        
        // Get available medications
        List<Medication> medications = medicationService.getActiveMedications();
        model.addAttribute("medications", medications);
        
        return "doctor/prescriptions/create";
    }

    @PostMapping("/prescriptions/create")
    public String createPrescription(@Valid @ModelAttribute Prescription prescription, 
                                   BindingResult result, 
                                   Authentication authentication,
                                   RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "doctor/prescriptions/create";
        }

        try {
            User user = (User) authentication.getPrincipal();
            Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
            
            if (doctorOpt.isPresent()) {
                prescription.setDoctor(doctorOpt.get());
                prescription.setPrescriptionDate(LocalDate.now());
                
                Prescription savedPrescription = prescriptionService.createPrescription(prescription);
                
                redirectAttributes.addFlashAttribute("successMessage", "Tạo đơn thuốc thành công!");
                return "redirect:/doctor/prescriptions/" + savedPrescription.getId();
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi tạo đơn thuốc!");
        }
        
        return "doctor/prescriptions/create";
    }

    // Lab Results Management
    @GetMapping("/lab-results")
    public String labResults(@RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size,
                            @RequestParam(required = false) String testType,
                            @RequestParam(required = false) Long patientId,
                            Model model) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("testDate").descending());
        
        Page<LabResult> labResultPage;
        if (patientId != null) {
            labResultPage = labResultService.getLabResultsByPatient(patientId, pageable);
        } else if (testType != null && !testType.isEmpty()) {
            labResultPage = labResultService.getLabResultsByTestType(testType, pageable);
        } else {
            labResultPage = labResultService.getAllLabResults(pageable);
        }
        
        model.addAttribute("labResults", labResultPage.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", labResultPage.getTotalPages());
        model.addAttribute("selectedTestType", testType);
        model.addAttribute("selectedPatientId", patientId);
        
        return "doctor/lab-results/list";
    }

    @GetMapping("/lab-results/create")
    public String createLabResultForm(@RequestParam(required = false) Long patientId, Model model) {
        model.addAttribute("labResult", new LabResult());
        
        if (patientId != null) {
            Optional<Patient> patientOpt = patientService.getPatientById(patientId);
            patientOpt.ifPresent(patient -> model.addAttribute("selectedPatient", patient));
        }
        
        return "doctor/lab-results/create";
    }

    @PostMapping("/lab-results/create")
    public String createLabResult(@Valid @ModelAttribute LabResult labResult, 
                                 BindingResult result, 
                                 Authentication authentication,
                                 RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "doctor/lab-results/create";
        }

        try {
            User user = (User) authentication.getPrincipal();
            Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
            
            if (doctorOpt.isPresent()) {
                labResult.setDoctor(doctorOpt.get());
                labResult.setTestDate(LocalDate.now());
                
                LabResult savedLabResult = labResultService.createLabResult(labResult);
                
                // Update HIV profile if this is CD4 or Viral Load result
                if ("CD4".equals(labResult.getTestType()) || "VIRAL_LOAD".equals(labResult.getTestType())) {
                    hivPatientProfileService.updateFromLabResult(savedLabResult);
                }
                
                redirectAttributes.addFlashAttribute("successMessage", "Tạo kết quả xét nghiệm thành công!");
                return "redirect:/doctor/lab-results";
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra!");
        }
        
        return "doctor/lab-results/create";
    }

    // Symptom Reports Management
    @GetMapping("/symptom-reports")
    public String symptomReports(Authentication authentication,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size,
                                @RequestParam(required = false) String status,
                                @RequestParam(required = false) String severity,
                                @RequestParam(required = false) String search,
                                @RequestParam(required = false) Long patientId,
                                Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
        
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            
            Page<SymptomReport> reportPage;
            
            if (search != null && !search.isEmpty()) {
                reportPage = symptomReportService.searchReports(search, pageable);
            } else if (patientId != null) {
                reportPage = symptomReportService.getReportsByPatient(patientId, pageable);
            } else if (status != null && !status.isEmpty()) {
                reportPage = symptomReportService.getReportsByStatus(ReportStatus.valueOf(status), pageable);
            } else if (severity != null && !severity.isEmpty()) {
                reportPage = symptomReportService.getReportsBySeverity(SymptomSeverity.valueOf(severity), pageable);
            } else {
                reportPage = symptomReportService.getReportsByDoctor(doctor.getId(), pageable);
            }
            
            // Get statistics
            long totalReports = symptomReportService.getTotalReportsCount();
            long pendingReports = symptomReportService.getPendingReportsCount();
            long urgentReports = symptomReportService.getUrgentReportsCount();
            
            model.addAttribute("reports", reportPage.getContent());
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", reportPage.getTotalPages());
            model.addAttribute("totalElements", reportPage.getTotalElements());
            model.addAttribute("selectedStatus", status);
            model.addAttribute("selectedSeverity", severity);
            model.addAttribute("searchKeyword", search);
            model.addAttribute("selectedPatientId", patientId);
            model.addAttribute("totalReports", totalReports);
            model.addAttribute("pendingReports", pendingReports);
            model.addAttribute("urgentReports", urgentReports);
            
            return "doctor/symptom-reports/list";
        }
        
        return "redirect:/dashboard";
    }

    @GetMapping("/symptom-reports/{id}")
    public String viewSymptomReport(@PathVariable Long id, Model model) {
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
            
            return "doctor/symptom-reports/view";
        }
        return "redirect:/doctor/symptom-reports";
    }

    @PostMapping("/symptom-reports/{id}/review")
    public String reviewSymptomReport(@PathVariable Long id,
                                     @RequestParam String doctorNotes,
                                     @RequestParam String doctorResponse,
                                     @RequestParam(required = false) String followUpDate,
                                     Authentication authentication,
                                     RedirectAttributes redirectAttributes) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
            
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                SymptomReport reviewedReport = symptomReportService.reviewReport(
                    id, doctor, doctorNotes, doctorResponse);
                
                // Set follow-up if specified
                if (followUpDate != null && !followUpDate.isEmpty()) {
                    LocalDateTime followUp = LocalDateTime.parse(followUpDate);
                    symptomReportService.setFollowUp(id, followUp, "Cần tái khám theo lịch hẹn");
                }
                
                redirectAttributes.addFlashAttribute("successMessage", "Đã xem xét báo cáo triệu chứng thành công!");
                return "redirect:/doctor/symptom-reports/" + id;
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi xem xét báo cáo!");
        }
        
        return "redirect:/doctor/symptom-reports";
    }

    @PostMapping("/symptom-reports/{id}/status")
    @ResponseBody
    public String updateReportStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            symptomReportService.updateReportStatus(id, ReportStatus.valueOf(status));
            return "success";
        } catch (Exception e) {
            return "error";
        }
    }

    // Dashboard refresh endpoint for AJAX
    @GetMapping("/dashboard/refresh")
    @ResponseBody
    public Map<String, Object> refreshDashboard(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Optional<Doctor> doctorOpt = doctorService.getDoctorByUserId(user.getId());
        
        Map<String, Object> response = new java.util.HashMap<>();
        
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            
            // Check for new appointments or urgent tasks
           long newAppointments = appointmentService
    .getNewAppointmentsSince(doctor.getId(), LocalDateTime.now().minusMinutes(5))
    .size();
            long urgentTasks = taskService.getUrgentTaskCount(doctor.getId());
            
            response.put("hasUpdates", newAppointments > 0 || urgentTasks > 0);
            response.put("newAppointments", newAppointments);
            response.put("urgentTasks", urgentTasks);
        }
        
        return response;
    }
}
