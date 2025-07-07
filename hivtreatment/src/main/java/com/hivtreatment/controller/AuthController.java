package com.hivtreatment.controller;

import com.hivtreatment.entity.Patient;
import com.hivtreatment.entity.User;
import com.hivtreatment.enums.UserRole;
import com.hivtreatment.service.PatientService;
import com.hivtreatment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PatientService patientService;

    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }

    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("user", new User());
        return "auth/register";
    }

    @PostMapping("/register")
    public String registerUser(@Valid @ModelAttribute("user") User user, 
                              BindingResult result, 
                              RedirectAttributes redirectAttributes) {
        
        if (result.hasErrors()) {
            return "auth/register";
        }

        // Check if username or email already exists
        if (userService.existsByUsername(user.getUsername())) {
            result.rejectValue("username", "error.user", "Tên đăng nhập đã tồn tại");
            return "auth/register";
        }

        if (userService.existsByEmail(user.getEmail())) {
            result.rejectValue("email", "error.user", "Email đã được sử dụng");
            return "auth/register";
        }

        try {
            // Set default role as PATIENT
            user.setRole(UserRole.PATIENT);
            User savedUser = userService.createUser(user);

            // Create patient profile
            Patient patient = new Patient();
            patient.setUser(savedUser);
            patient.setPatientCode(patientService.generatePatientCode());
            patient.setFirstName(user.getUsername()); // Temporary, user can update later
            patient.setLastName("");
            patientService.createPatient(patient);

            redirectAttributes.addFlashAttribute("successMessage", "Đăng ký thành công! Vui lòng đăng nhập.");
            return "redirect:/login";
        } catch (Exception e) {
            result.rejectValue("username", "error.user", "Có lỗi xảy ra khi đăng ký");
            return "auth/register";
        }
    }
}
