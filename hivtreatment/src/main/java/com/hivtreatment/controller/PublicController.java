package com.hivtreatment.controller;

import com.hivtreatment.entity.BlogPost;
import com.hivtreatment.entity.EducationalResource;
import com.hivtreatment.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
public class PublicController {

    @Autowired
    private BlogService blogService;

    @Autowired
    private EducationalResourceService educationalResourceService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        // Statistics for homepage
        model.addAttribute("totalPatients", patientService.getTotalPatientCount());
        model.addAttribute("availableDoctors", doctorService.getAvailableDoctorCount());
        model.addAttribute("todayAppointments", appointmentService.getTodayAppointmentCount());
        
        // Featured content
        model.addAttribute("featuredPosts", blogService.getFeaturedPosts());
        model.addAttribute("featuredResources", educationalResourceService.getFeaturedResources());
        model.addAttribute("recentPosts", blogService.getRecentPosts(3));
        
        return "public/home";
    }

    @GetMapping("/about")
    public String about(Model model) {
        model.addAttribute("totalPatients", patientService.getTotalPatientCount());
        model.addAttribute("availableDoctors", doctorService.getAvailableDoctorCount());
        return "public/about";
    }

    @GetMapping("/services")
    public String services() {
        return "public/services";
    }

    @GetMapping("/contact")
    public String contact() {
        return "public/contact";
    }

    // Blog functionality
    @GetMapping("/blog")
    public String blog(@RequestParam(defaultValue = "0") int page,
                      @RequestParam(defaultValue = "10") int size,
                      @RequestParam(required = false) String category,
                      @RequestParam(required = false) String search,
                      Model model) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BlogPost> posts;
        
        if (search != null && !search.trim().isEmpty()) {
            posts = blogService.searchPublishedPosts(search, pageable);
            model.addAttribute("searchKeyword", search);
        } else if (category != null && !category.trim().isEmpty()) {
            posts = blogService.getPublishedPostsByCategory(category, pageable);
            model.addAttribute("selectedCategory", category);
        } else {
            posts = blogService.getPublishedPosts(pageable);
        }
        
        model.addAttribute("posts", posts);
        model.addAttribute("featuredPosts", blogService.getFeaturedPosts());
        
        return "public/blog/index";
    }

    @GetMapping("/blog/{slug}")
    public String blogPost(@PathVariable String slug, Model model) {
        Optional<BlogPost> postOpt = blogService.getPostBySlug(slug);
        if (postOpt.isPresent()) {
            BlogPost post = postOpt.get();
            blogService.incrementViewCount(post.getId());
            model.addAttribute("post", post);
            model.addAttribute("recentPosts", blogService.getRecentPosts(5));
            return "public/blog/post";
        }
        return "redirect:/blog";
    }

    // Educational Resources
    @GetMapping("/education")
    public String education(@RequestParam(required = false) String category,
                           @RequestParam(required = false) String type,
                           @RequestParam(required = false) String search,
                           Model model) {
        
        List<EducationalResource> resources;
        
        if (search != null && !search.trim().isEmpty()) {
            resources = educationalResourceService.searchResources(search);
            model.addAttribute("searchKeyword", search);
        } else if (category != null && !category.trim().isEmpty()) {
            resources = educationalResourceService.getResourcesByCategory(category);
            model.addAttribute("selectedCategory", category);
        } else if (type != null && !type.trim().isEmpty()) {
            resources = educationalResourceService.getResourcesByType(type);
            model.addAttribute("selectedType", type);
        } else {
            resources = educationalResourceService.getActiveResources();
        }
        
        model.addAttribute("resources", resources);
        model.addAttribute("featuredResources", educationalResourceService.getFeaturedResources());
        
        return "public/education/index";
    }

    @GetMapping("/education/{id}")
    public String educationResource(@PathVariable Long id, Model model) {
        Optional<EducationalResource> resourceOpt = educationalResourceService.getResourceById(id);
        if (resourceOpt.isPresent()) {
            EducationalResource resource = resourceOpt.get();
            educationalResourceService.incrementViewCount(id);
            model.addAttribute("resource", resource);
            return "public/education/resource";
        }
        return "redirect:/education";
    }

    @GetMapping("/education/{id}/download")
    public String downloadResource(@PathVariable Long id) {
        educationalResourceService.incrementDownloadCount(id);
        Optional<EducationalResource> resourceOpt = educationalResourceService.getResourceById(id);
        if (resourceOpt.isPresent() && resourceOpt.get().getFileUrl() != null) {
            return "redirect:" + resourceOpt.get().getFileUrl();
        }
        return "redirect:/education";
    }

    // Anti-stigma resources
    @GetMapping("/anti-stigma")
    public String antiStigma(Model model) {
        model.addAttribute("resources", educationalResourceService.getAntiStigmaResources());
        return "public/anti-stigma";
    }

    // Prevention information
    @GetMapping("/prevention")
    public String prevention(Model model) {
        model.addAttribute("resources", educationalResourceService.getPreventionResources());
        return "public/prevention";
    }

    // Treatment information
    @GetMapping("/treatment-info")
    public String treatmentInfo(Model model) {
        model.addAttribute("resources", educationalResourceService.getTreatmentResources());
        return "public/treatment-info";
    }

    // FAQ
    @GetMapping("/faq")
    public String faq() {
        return "public/faq";
    }

    // Anonymous consultation request
    @GetMapping("/anonymous-consultation")
    public String anonymousConsultation() {
        return "public/anonymous-consultation";
    }
}
