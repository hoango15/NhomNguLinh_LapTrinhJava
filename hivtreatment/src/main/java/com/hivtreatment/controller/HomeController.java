package com.hivtreatment.controller;

import com.hivtreatment.entity.BlogPost;
import com.hivtreatment.entity.EducationalResource;
import com.hivtreatment.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class HomeController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private BlogService blogService;

    @Autowired
    private EducationalResourceService educationalResourceService;

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        // Facility statistics
        model.addAttribute("totalPatients", patientService.getTotalPatientCount());
        model.addAttribute("availableDoctors", doctorService.getAvailableDoctorCount());
        model.addAttribute("todayAppointments", appointmentService.getTodayAppointmentCount());
        
        // Featured content for reducing stigma and education
        List<BlogPost> featuredPosts = blogService.getFeaturedPosts();
        List<EducationalResource> featuredResources = educationalResourceService.getFeaturedResources();
        List<BlogPost> recentPosts = blogService.getRecentPosts(3);
        
        model.addAttribute("featuredPosts", featuredPosts);
        model.addAttribute("featuredResources", featuredResources);
        model.addAttribute("recentPosts", recentPosts);
        
        // Anti-stigma resources
        model.addAttribute("antiStigmaResources", educationalResourceService.getAntiStigmaResources());
        
        return "public/home";
    }

    @GetMapping("/about")
    public String about(Model model) {
        // Facility information
        model.addAttribute("totalPatients", patientService.getTotalPatientCount());
        model.addAttribute("availableDoctors", doctorService.getAvailableDoctorCount());
        model.addAttribute("establishedYear", "2010");
        model.addAttribute("facilityName", "Trung tâm Điều trị HIV/AIDS");
        return "public/about";
    }

    @GetMapping("/services")
    public String services(Model model) {
        model.addAttribute("availableDoctors", doctorService.getAvailableDoctors());
        return "public/services";
    }

    @GetMapping("/contact")
    public String contact() {
        return "public/contact";
    }

    @GetMapping("/faq")
    public String faq() {
        return "public/faq";
    }
}
