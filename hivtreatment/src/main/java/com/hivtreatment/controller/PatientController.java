package com.hivtreatment.controller;

import com.hivtreatment.entity.*;
import com.hivtreatment.enums.AppointmentStatus;
import com.hivtreatment.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.hivtreatment.dto.DoctorAvailabilityDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/patient")
@PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'MANAGER', 'ADMIN')")
public class PatientController {

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
    private ConsultationService consultationService;

     @Autowired
    private SymptomReportService symptomReportService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private HIVPatientProfileService hivPatientProfileService;

    @GetMapping("/profile")
public String profile(Authentication authentication, Model model) {
    User user = (User) authentication.getPrincipal();
    Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());

    if (patientOpt.isPresent()) {
        Patient patient = patientOpt.get();
        Optional<HIVPatientProfile> hivProfile = hivPatientProfileService.getProfileByPatientId(patient.getId());

        model.addAttribute("patient", patient);
        model.addAttribute("hivProfile", hivProfile.orElse(null));

        return "patient/profile";
    } else {
        return "redirect:/dashboard";
    }
}

    @GetMapping("/doctors")
    public String selectDoctor(@RequestParam(required = false) String specialization,
                              @RequestParam(required = false) String experience,
                              @RequestParam(required = false) String rating,
                              @RequestParam(required = false) Boolean available,
                              Model model) {
        
        List<Doctor> availableDoctors;
        
        if (specialization != null || experience != null || rating != null || available != null) {
            // Apply filters
            availableDoctors = doctorService.searchDoctorsWithFilters(specialization, experience, rating, available);
        } else {
            availableDoctors = doctorService.getAvailableDoctors();
        }
        
        model.addAttribute("availableDoctors", availableDoctors);
        model.addAttribute("hasMoreDoctors", availableDoctors.size() >= 12);
        
        return "patient/doctors";
    }

    @GetMapping("/doctors/{id}/profile")
    public String viewDoctorProfile(@PathVariable Long id, Model model) {
        Optional<Doctor> doctorOpt = doctorService.getDoctorById(id);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            
            // Get doctor's statistics
            long totalPatients = patientService.countByDoctorId(id); // ✅ sửa lại đúng method name
            double averageRating = doctorService.getAverageRating(id); 
            List<String> specializations = doctorService.getDoctorSpecializations(id); 

            model.addAttribute("doctor", doctor);
            model.addAttribute("totalPatients", totalPatients);
            model.addAttribute("averageRating", averageRating);
            model.addAttribute("specializations", specializations);
            
            return "patient/doctor-profile";
        }
        return "redirect:/patient/doctors";
    }

    @GetMapping("/appointments")
    public String appointments(Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            
            List<Appointment> upcomingAppointments = appointmentService.getUpcomingAppointmentsByPatient(patient.getId());
            List<Appointment> pastAppointments = appointmentService.getPastAppointmentsByPatient(patient.getId());
            
            model.addAttribute("patient", patient);
            model.addAttribute("upcomingAppointments", upcomingAppointments);
            model.addAttribute("pastAppointments", pastAppointments);
            
            return "patient/appointments";
        } else {
            return "redirect:/dashboard";
        }
    }

    @GetMapping("/appointments/book")
    public String bookAppointment(@RequestParam(required = false) Long doctorId,
                                 Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            model.addAttribute("patient", patientOpt.get());
            model.addAttribute("appointment", new Appointment());
            
            if (doctorId != null) {
                Optional<Doctor> doctorOpt = doctorService.getDoctorById(doctorId);
                doctorOpt.ifPresent(doctor -> model.addAttribute("selectedDoctor", doctor));
            }
            
            List<Doctor> availableDoctors = doctorService.getAvailableDoctors();
            model.addAttribute("availableDoctors", availableDoctors);
            
            return "patient/book-appointment";
        }
        return "redirect:/dashboard";
    }

    @PostMapping("/appointments/book")
    public String createAppointment(@Valid @ModelAttribute Appointment appointment,
                                   BindingResult result,
                                   Authentication authentication,
                                   RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "patient/book-appointment";
        }

        try {
            User user = (User) authentication.getPrincipal();
            Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
            
            if (patientOpt.isPresent()) {
                appointment.setPatient(patientOpt.get());
                appointment.setStatus(AppointmentStatus.SCHEDULED);
                appointment.setCreatedAt(LocalDateTime.now());
                
                Appointment savedAppointment = appointmentService.createAppointment(appointment);
                
                // Send notification to doctor
                notificationService.sendAppointmentNotification(
                    appointment.getDoctor().getUser(),
                    "Lịch hẹn mới",
                    "Bệnh nhân " + appointment.getPatient().getFullName() + " đã đặt lịch hẹn"
                );
                
                redirectAttributes.addFlashAttribute("successMessage", "Đặt lịch hẹn thành công!");
                return "redirect:/patient/appointments/" + savedAppointment.getId();
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi đặt lịch hẹn!");
        }
        
        return "patient/book-appointment";
    }

    @GetMapping("/prescriptions")
    public String prescriptions(Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            
            List<Prescription> activePrescriptions = prescriptionService.getActivePrescriptionsByPatient(patient.getId());
            List<Prescription> pastPrescriptions = prescriptionService.getPastPrescriptionsByPatient(patient.getId());
            
            model.addAttribute("patient", patient);
            model.addAttribute("activePrescriptions", activePrescriptions);
            model.addAttribute("pastPrescriptions", pastPrescriptions);
            
            return "patient/prescriptions";
        } else {
            return "redirect:/dashboard";
        }
    }

    @GetMapping("/lab-results")
    public String labResults(Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            
            List<LabResult> recentLabResults = labResultService.getRecentLabResultsByPatient(patient.getId(), 10);
            labResultService.getLabResultsByPatientAndTestType(patient.getId(), "CD4");

            labResultService.getLabResultsByPatientAndTestType(patient.getId(), "VIRAL_LOAD");
            
            model.addAttribute("patient", patient);
            model.addAttribute("recentLabResults", recentLabResults);
            // model.addAttribute("cd4Results", cd4Results);
            // model.addAttribute("viralLoadResults", viralLoadResults);
            
            return "patient/lab-results";
        } else {
            return "redirect:/dashboard";
        }
    }

    @GetMapping("/consultations")
    public String consultations(Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            
            List<Consultation> activeConsultations = consultationService.getActiveConsultationsByPatient(patient.getId());
            List<Consultation> pastConsultations = consultationService.getPastConsultationsByPatient(patient.getId());
            
            model.addAttribute("patient", patient);
            model.addAttribute("activeConsultations", activeConsultations);
            model.addAttribute("pastConsultations", pastConsultations);
            
            return "patient/consultations";
        } else {
            return "redirect:/dashboard";
        }
    }

    @GetMapping("/consultations/request")
    public String requestConsultation(@RequestParam(required = false) Long doctorId,
                                     Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            model.addAttribute("patient", patientOpt.get());
            model.addAttribute("consultation", new Consultation());
            
            if (doctorId != null) {
                Optional<Doctor> doctorOpt = doctorService.getDoctorById(doctorId);
                doctorOpt.ifPresent(doctor -> model.addAttribute("selectedDoctor", doctor));
            }
            
            List<Doctor> availableDoctors = doctorService.getAvailableDoctors();
            model.addAttribute("availableDoctors", availableDoctors);
            
            return "patient/request-consultation";
        }
        return "redirect:/dashboard";
    }

    @PostMapping("/consultations/request")
    public String createConsultationRequest(@Valid @ModelAttribute Consultation consultation,
                                           BindingResult result,
                                           Authentication authentication,
                                           RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "patient/request-consultation";
        }

        try {
            User user = (User) authentication.getPrincipal();
            Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
            
            if (patientOpt.isPresent()) {
                consultation.setPatient(patientOpt.get());
                consultation.setStatus("PENDING");
                consultation.setCreatedAt(LocalDateTime.now());
                
                Consultation savedConsultation = consultationService.createConsultation(consultation);
                
                // Send notification to doctor
                if (consultation.getDoctor() != null) {
                    notificationService.sendConsultationNotification(
                        consultation.getDoctor().getUser(),
                        "Yêu cầu tư vấn mới",
                        "Bệnh nhân " + consultation.getPatient().getFullName() + " yêu cầu tư vấn"
                    );
                }
                
                redirectAttributes.addFlashAttribute("successMessage", "Gửi yêu cầu tư vấn thành công!");
                return "redirect:/patient/consultations/" + savedConsultation.getId();
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi gửi yêu cầu!");
        }
        
        return "patient/request-consultation";
    }

    @GetMapping("/consultations/anonymous")
    public String anonymousConsultation(Model model) {
        model.addAttribute("consultation", new Consultation());
        return "patient/anonymous-consultation";
    }

    @PostMapping("/consultations/anonymous")
    public String createAnonymousConsultation(@Valid @ModelAttribute Consultation consultation,
                                             BindingResult result,
                                             RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            return "patient/anonymous-consultation";
        }

        try {
            consultation.setIsAnonymous(true);
            consultation.setStatus("PENDING");
            consultation.setCreatedAt(LocalDateTime.now());
            
            Consultation savedConsultation = consultationService.createConsultation(consultation);
            
            // Notify available doctors about anonymous consultation
            List<Doctor> availableDoctors = doctorService.getAvailableDoctors();
            for (Doctor doctor : availableDoctors) {
                notificationService.sendAnonymousConsultationNotification(
                    doctor.getUser(),
                    "Yêu cầu tư vấn ẩn danh",
                    "Có yêu cầu tư vấn ẩn danh mới cần xử lý"
                );
            }
            
            redirectAttributes.addFlashAttribute("successMessage", "Gửi yêu cầu tư vấn ẩn danh thành công!");
            redirectAttributes.addFlashAttribute("consultationId", savedConsultation.getId());
            return "redirect:/patient/consultations/anonymous/success";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi gửi yêu cầu!");
        }
        
        return "patient/anonymous-consultation";
    }

    @GetMapping("/symptoms/report")
    public String reportSymptoms(Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            model.addAttribute("patient", patientOpt.get());
            model.addAttribute("symptomReport", new SymptomReport());
            
            return "patient/report-symptoms";
        }
        return "redirect:/dashboard";
    }

   @PostMapping("/symptoms/report")
public String submitSymptomReport(@Valid @ModelAttribute SymptomReport symptomReport,
                                  BindingResult result,
                                  Authentication authentication,
                                  RedirectAttributes redirectAttributes) {
    if (result.hasErrors()) {
        return "patient/report-symptoms";
    }

    try {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            symptomReport.setPatient(patient);

            // Lưu thời gian báo cáo nếu bạn muốn
            symptomReport.setCreatedAt(LocalDateTime.now());

            // Notify patient's doctor
            if (patient.getDoctor() != null) {
                notificationService.sendSymptomReportNotification(
                    patient.getDoctor().getUser(),
                    "Báo cáo triệu chứng mới",
                    "Bệnh nhân " + patient.getFullName() + " đã báo cáo triệu chứng mới"
                );
            }

            symptomReportService.save(symptomReport); // nếu bạn chưa lưu trước đó

            redirectAttributes.addFlashAttribute("successMessage", "Báo cáo triệu chứng thành công!");
            return "redirect:/patient/symptoms/reports";
        }
    } catch (Exception e) {
        redirectAttributes.addFlashAttribute("errorMessage", "Có lỗi xảy ra khi gửi báo cáo!");
    }
    
    return "patient/report-symptoms";
}

    @GetMapping("/medical-records")
    public String medicalRecords(Authentication authentication, Model model) {
        User user = (User) authentication.getPrincipal();
        Optional<Patient> patientOpt = patientService.getPatientByUserId(user.getId());
        
        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            Optional<HIVPatientProfile> hivProfile = hivPatientProfileService.getProfileByPatientId(patient.getId());
            
            List<Appointment> medicalHistory = appointmentService.getCompletedAppointmentsByPatient(patient.getId());
            List<Prescription> prescriptionHistory = prescriptionService.getPrescriptionsByPatient(patient.getId());
            List<LabResult> labHistory = labResultService.getLabResultsByPatient(patient.getId());
            
            model.addAttribute("patient", patient);
            model.addAttribute("hivProfile", hivProfile.orElse(null));
            model.addAttribute("medicalHistory", medicalHistory);
            model.addAttribute("prescriptionHistory", prescriptionHistory);
            model.addAttribute("labHistory", labHistory);
            
            return "patient/medical-records";
        } else {
            return "redirect:/dashboard";
        }
    }

    // AJAX endpoints
   @GetMapping("/doctors/load-more")
@ResponseBody
public String loadMoreDoctors(@RequestParam int offset) {
    List<Doctor> moreDoctors = doctorService.getAvailableDoctors(offset, 12).getContent();
    return renderDoctorCards(moreDoctors);
}

    @GetMapping("/doctors/availability")
@ResponseBody
public List<DoctorAvailabilityDTO> getAvailableDoctorsDTO() {
    List<Doctor> doctors = doctorService.getAvailableDoctors();

    return doctors.stream()
        .map(d -> new DoctorAvailabilityDTO(
            d.getId(),
            d.getFirstName() + " " + d.getLastName(),
            d.getIsAvailable()
        ))
        .collect(Collectors.toList());
}


    private String renderDoctorCards(List<Doctor> doctors) {
        // This would typically use a template engine to render the HTML
        // For now, return a simple implementation
        StringBuilder html = new StringBuilder();
        for (Doctor doctor : doctors) {
            html.append("<div class='col-12'>")
                .append("<div class='doctor-selection-card' data-doctor-id='").append(doctor.getId()).append("'>")
                .append("<!-- Doctor card content -->")
                .append("</div></div>");
        }
        return html.toString();
    }
}
