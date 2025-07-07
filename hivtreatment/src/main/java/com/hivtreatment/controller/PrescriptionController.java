package com.hivtreatment.controller;

import com.hivtreatment.entity.Prescription;
import com.hivtreatment.entity.PrescriptionMedication;
import com.hivtreatment.entity.Patient;
import com.hivtreatment.entity.Doctor;
import com.hivtreatment.entity.Medication;
import com.hivtreatment.service.PrescriptionService;

import jakarta.validation.Valid;
import java.util.Optional;
import com.hivtreatment.service.PatientService;
import com.hivtreatment.service.DoctorService;
import com.hivtreatment.service.MedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;


import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Controller
@RequestMapping("/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private MedicationService medicationService;
@GetMapping
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String listPrescriptions(Model model, Principal principal) {
    List<Prescription> prescriptions;

    if (principal != null) {
        String role = getUserRole(principal);
        if ("DOCTOR".equals(role)) {
            // Lấy doctor theo username, sau đó lấy ID
            Optional<Doctor> doctorOpt = doctorService.getDoctorByUsername(principal.getName());
            if (doctorOpt.isPresent()) {
                Long doctorId = doctorOpt.get().getId();
                prescriptions = prescriptionService.getPrescriptionsByDoctor(doctorId);
            } else {
                // Nếu không tìm thấy bác sĩ -> danh sách rỗng hoặc thông báo lỗi
                prescriptions = List.of();
            }
        } else {
            prescriptions = prescriptionService.getAllPrescriptions();
        }
    } else {
        prescriptions = prescriptionService.getAllPrescriptions();
    }

    model.addAttribute("prescriptions", prescriptions);
    return "prescriptions/list";
}


   @GetMapping("/patient/{patientId}")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String getPatientPrescriptions(@PathVariable Long patientId, Model model) {
    Optional<Patient> optionalPatient = patientService.getPatientById(patientId);

    if (optionalPatient.isPresent()) {
        Patient patient = optionalPatient.get();
        List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatient(patientId);

        model.addAttribute("patient", patient);
        model.addAttribute("prescriptions", prescriptions);
        return "prescriptions/patient-prescriptions";
    } else {
        model.addAttribute("error", "Không tìm thấy bệnh nhân với ID: " + patientId);
        return "error/404"; // hoặc redirect:/patients hoặc bất kỳ trang lỗi nào bạn có
    }
}


    @GetMapping("/new")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public String showNewPrescriptionForm(Model model) {
        model.addAttribute("prescription", new Prescription());
        model.addAttribute("patients", patientService.getAllPatients());
        model.addAttribute("doctors", doctorService.getAllDoctors());
        model.addAttribute("medications", medicationService.getAllActiveMedications());
        return "prescriptions/form";
    }

    @PostMapping("/new")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
public String createPrescription(@Valid @ModelAttribute Prescription prescription,
                                 BindingResult result,
                                 @RequestParam List<Long> medicationIds,
                                 @RequestParam List<String> dosages,
                                 @RequestParam List<String> frequencies,
                                 @RequestParam List<Integer> durations,
                                 @RequestParam List<String> instructions,
                                 @RequestParam List<Integer> quantities,
                                 Model model,
                                 RedirectAttributes redirectAttributes) {
    if (result.hasErrors()) {
        model.addAttribute("patients", patientService.getAllPatients());
        model.addAttribute("doctors", doctorService.getAllDoctors());
        model.addAttribute("medications", medicationService.getActiveMedications()); // dùng đúng tên hàm đã tồn tại
        return "prescriptions/form";
    }

    try {
        // Tạo danh sách thuốc kê đơn
        for (int i = 0; i < medicationIds.size(); i++) {
            Optional<Medication> medicationOpt = medicationService.getMedicationById(medicationIds.get(i));

            if (medicationOpt.isEmpty()) {
                model.addAttribute("errorMessage", "Không tìm thấy thuốc với ID: " + medicationIds.get(i));
                model.addAttribute("patients", patientService.getAllPatients());
                model.addAttribute("doctors", doctorService.getAllDoctors());
                model.addAttribute("medications", medicationService.getActiveMedications());
                return "prescriptions/form";
            }

            PrescriptionMedication prescriptionMedication = new PrescriptionMedication();
            prescriptionMedication.setPrescription(prescription);
            prescriptionMedication.setMedication(medicationOpt.get());
            prescriptionMedication.setDosage(dosages.get(i));
            prescriptionMedication.setFrequency(frequencies.get(i));
            prescriptionMedication.setDurationDays(durations.get(i));
            prescriptionMedication.setInstructions(instructions.get(i));
            prescriptionMedication.setQuantity(quantities.get(i));

            prescription.getPrescriptionMedications().add(prescriptionMedication);
        }

        prescriptionService.createPrescription(prescription);
        redirectAttributes.addFlashAttribute("successMessage", "Tạo đơn thuốc thành công!");
        return "redirect:/prescriptions";

    } catch (Exception e) {
        model.addAttribute("errorMessage", "Lỗi khi tạo đơn thuốc: " + e.getMessage());
        model.addAttribute("patients", patientService.getAllPatients());
        model.addAttribute("doctors", doctorService.getAllDoctors());
        model.addAttribute("medications", medicationService.getActiveMedications());
        return "prescriptions/form";
    }
}


    @GetMapping("/{id}")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String viewPrescription(@PathVariable Long id, Model model) {
    Prescription prescription = prescriptionService.getPrescriptionById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc với ID: " + id));
    model.addAttribute("prescription", prescription);
    return "prescriptions/view";
}

@GetMapping("/{id}/edit")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
public String showEditPrescriptionForm(@PathVariable Long id, Model model) {
    Prescription prescription = prescriptionService.getPrescriptionById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc với ID: " + id));
    model.addAttribute("prescription", prescription);
    model.addAttribute("patients", patientService.getAllPatients());
    model.addAttribute("doctors", doctorService.getAllDoctors());
    model.addAttribute("medications", medicationService.getActiveMedications());
    return "prescriptions/form";
}


    @PostMapping("/{id}/edit")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public String updatePrescription(@PathVariable Long id, 
                                   @Valid @ModelAttribute Prescription prescription, 
                                   BindingResult result, 
                                   Model model, 
                                   RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            model.addAttribute("patients", patientService.getAllPatients());
            model.addAttribute("doctors", doctorService.getAllDoctors());
            model.addAttribute("medications", medicationService.getAllActiveMedications());
            return "prescriptions/form";
        }

        try {
            prescription.setId(id);
             prescriptionService.createPrescription(prescription);
            redirectAttributes.addFlashAttribute("successMessage", "Prescription updated successfully!");
            return "redirect:/prescriptions";
        } catch (Exception e) {
            model.addAttribute("errorMessage", "Error updating prescription: " + e.getMessage());
            model.addAttribute("patients", patientService.getAllPatients());
            model.addAttribute("doctors", doctorService.getAllDoctors());
            model.addAttribute("medications", medicationService.getAllActiveMedications());
            return "prescriptions/form";
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public String cancelPrescription(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            prescriptionService.cancelPrescription(id);
            redirectAttributes.addFlashAttribute("successMessage", "Prescription cancelled successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Error cancelling prescription: " + e.getMessage());
        }
        return "redirect:/prescriptions";
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public String completePrescription(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            prescriptionService.completePrescription(id);
            redirectAttributes.addFlashAttribute("successMessage", "Prescription marked as completed!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Error completing prescription: " + e.getMessage());
        }
        return "redirect:/prescriptions";
    }

    @GetMapping("/search")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String searchPrescriptions(@RequestParam(required = false) String patientCode,
                                  @RequestParam(required = false) String prescriptionCode,
                                  @RequestParam(required = false) String status,
                                  @RequestParam(required = false) String dateFrom,
                                  @RequestParam(required = false) String dateTo,
                                  Model model) {

    LocalDate startDate = null;
    LocalDate endDate = null;
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    try {
        if (dateFrom != null && !dateFrom.isBlank()) {
            startDate = LocalDate.parse(dateFrom, formatter);
        }
        if (dateTo != null && !dateTo.isBlank()) {
            endDate = LocalDate.parse(dateTo, formatter);
        }
    } catch (DateTimeParseException e) {
        model.addAttribute("errorMessage", "Sai định dạng ngày. Định dạng đúng là yyyy-MM-dd");
        return "prescriptions/search-results";
    }

    // ✅ Gọi service với LocalDate đúng định dạng
    List<Prescription> prescriptions = prescriptionService.searchPrescriptions(
        patientCode, prescriptionCode, status, startDate, endDate
    );

    model.addAttribute("prescriptions", prescriptions);
    model.addAttribute("patientCode", patientCode);
    model.addAttribute("prescriptionCode", prescriptionCode);
    model.addAttribute("status", status);
    model.addAttribute("dateFrom", dateFrom);
    model.addAttribute("dateTo", dateTo);
    return "prescriptions/search-results";
}

   @GetMapping("/{id}/print")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String printPrescription(@PathVariable Long id, Model model) {
    Prescription prescription = prescriptionService.getPrescriptionById(id)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc với ID: " + id));

    model.addAttribute("prescription", prescription);
    return "prescriptions/print";
}


    private String getUserRole(Principal principal) {
        // Implementation to get user role from principal
        return "DOCTOR"; // Placeholder
    }
}
