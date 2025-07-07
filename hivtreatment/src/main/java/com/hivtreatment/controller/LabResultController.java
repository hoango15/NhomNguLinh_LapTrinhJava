package com.hivtreatment.controller;

import com.hivtreatment.entity.Doctor;
import com.hivtreatment.entity.LabResult;
import com.hivtreatment.entity.Patient;
import com.hivtreatment.service.LabResultService;
import com.hivtreatment.service.PatientService;
import com.hivtreatment.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/lab-results")
public class LabResultController {

    @Autowired
    private LabResultService labResultService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @GetMapping
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String listLabResults(Model model, Principal principal) {
    List<LabResult> labResults;

    if (principal != null) {
        String role = getUserRole(principal);
        if ("DOCTOR".equals(role)) {
            // Lấy doctor từ user
            Optional<Doctor> doctorOpt = doctorService.getDoctorByUsername(principal.getName());
            if (doctorOpt.isPresent()) {
                Long doctorId = doctorOpt.get().getId();
                labResults = labResultService.getLabResultsByDoctor(doctorId);
            } else {
                labResults = List.of(); // Không tìm thấy bác sĩ → trả danh sách rỗng
            }
        } else {
            labResults = labResultService.getAllLabResults();
        }
    } else {
        labResults = labResultService.getAllLabResults();
    }

    model.addAttribute("labResults", labResults);
    return "lab-results/list";
}


    @GetMapping("/patient/{patientId}")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String getPatientLabResults(@PathVariable Long patientId, Model model) {
    Patient patient = patientService.getPatientById(patientId)
        .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

    List<LabResult> labResults = labResultService.getLabResultsByPatient(patientId);
    
    model.addAttribute("patient", patient);
    model.addAttribute("labResults", labResults);
    return "lab-results/patient-results";
}


    @GetMapping("/new")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public String showNewLabResultForm(Model model) {
        model.addAttribute("labResult", new LabResult());
        model.addAttribute("patients", patientService.getAllPatients());
        model.addAttribute("doctors", doctorService.getAllDoctors());
        return "lab-results/form";
    }

    @PostMapping("/new")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public String createLabResult(@Valid @ModelAttribute LabResult labResult, 
                                 BindingResult result, 
                                 Model model, 
                                 RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            model.addAttribute("patients", patientService.getAllPatients());
            model.addAttribute("doctors", doctorService.getAllDoctors());
            return "lab-results/form";
        }

        try {
            labResultService.saveLabResult(labResult);
            redirectAttributes.addFlashAttribute("successMessage", "Lab result created successfully!");
            return "redirect:/lab-results";
        } catch (Exception e) {
            model.addAttribute("errorMessage", "Error creating lab result: " + e.getMessage());
            model.addAttribute("patients", patientService.getAllPatients());
            model.addAttribute("doctors", doctorService.getAllDoctors());
            return "lab-results/form";
        }
    }

    @GetMapping("/{id}/edit")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
public String showEditLabResultForm(@PathVariable Long id, Model model) {
    Optional<LabResult> optionalLabResult = labResultService.getLabResultById(id);
    if (optionalLabResult.isPresent()) {
        LabResult labResult = optionalLabResult.get();
        model.addAttribute("labResult", labResult);
        model.addAttribute("patients", patientService.getAllPatients());
        model.addAttribute("doctors", doctorService.getAllDoctors());
        return "lab-results/form";
    } else {
        
        return "redirect:/lab-results?error=notfound";
    }
}

    @PostMapping("/{id}/edit")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public String updateLabResult(@PathVariable Long id, 
                                 @Valid @ModelAttribute LabResult labResult, 
                                 BindingResult result, 
                                 Model model, 
                                 RedirectAttributes redirectAttributes) {
        if (result.hasErrors()) {
            model.addAttribute("patients", patientService.getAllPatients());
            model.addAttribute("doctors", doctorService.getAllDoctors());
            return "lab-results/form";
        }

        try {
            labResult.setId(id);
            labResultService.saveLabResult(labResult);
            redirectAttributes.addFlashAttribute("successMessage", "Lab result updated successfully!");
            return "redirect:/lab-results";
        } catch (Exception e) {
            model.addAttribute("errorMessage", "Error updating lab result: " + e.getMessage());
            model.addAttribute("patients", patientService.getAllPatients());
            model.addAttribute("doctors", doctorService.getAllDoctors());
            return "lab-results/form";
        }
    }

    @GetMapping("/{id}")
@PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
public String viewLabResult(@PathVariable Long id, Model model) {
    Optional<LabResult> optionalLabResult = labResultService.getLabResultById(id);
    if (optionalLabResult.isPresent()) {
        LabResult labResult = optionalLabResult.get();
        model.addAttribute("labResult", labResult);
        return "lab-results/view";
    } else {
        
        return "redirect:/lab-results?error=notfound";
    }
}

    @PostMapping("/{id}/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteLabResult(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            labResultService.deleteLabResult(id);
            redirectAttributes.addFlashAttribute("successMessage", "Lab result deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Error deleting lab result: " + e.getMessage());
        }
        return "redirect:/lab-results";
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN') or hasRole('MANAGER')")
    public String searchLabResults(@RequestParam(required = false) String testType,
                                  @RequestParam(required = false) String patientCode,
                                  @RequestParam(required = false) String dateFrom,
                                  @RequestParam(required = false) String dateTo,
                                  Model model) {
        List<LabResult> labResults = labResultService.searchLabResults(testType, patientCode, dateFrom, dateTo);
        model.addAttribute("labResults", labResults);
        model.addAttribute("testType", testType);
        model.addAttribute("patientCode", patientCode);
        model.addAttribute("dateFrom", dateFrom);
        model.addAttribute("dateTo", dateTo);
        return "lab-results/search-results";
    }

    private String getUserRole(Principal principal) {
        // Implementation to get user role from principal
        // This would typically involve looking up the user's authorities
        return "DOCTOR"; // Placeholder
    }
}
