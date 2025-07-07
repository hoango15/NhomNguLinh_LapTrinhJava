package com.hivtreatment.service;

import com.hivtreatment.entity.SymptomReport;
import com.hivtreatment.entity.Doctor;
import com.hivtreatment.enums.ReportStatus;
import com.hivtreatment.enums.SymptomSeverity;
import com.hivtreatment.repository.SymptomReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SymptomReportService {
    
    @Autowired
    private SymptomReportRepository symptomReportRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public SymptomReport createReport(SymptomReport report) {
        report.setCreatedAt(LocalDateTime.now());
        report.setStatus(ReportStatus.PENDING);
        
        // Set priority based on severity
        if (report.getSeverity() == SymptomSeverity.CRITICAL) {
            report.setPriorityLevel(5);
        } else if (report.getSeverity() == SymptomSeverity.SEVERE) {
            report.setPriorityLevel(4);
        } else if (report.getSeverity() == SymptomSeverity.MODERATE) {
            report.setPriorityLevel(3);
        } else {
            report.setPriorityLevel(2);
        }
        
        SymptomReport savedReport = symptomReportRepository.save(report);
        
        // Send notification to doctor if urgent
        if (savedReport.isUrgent()) {
            notificationService.notifyDoctorOfUrgentSymptomReport(savedReport);
        }
        
        return savedReport;
    }
    
    public Optional<SymptomReport> getReportById(Long id) {
        return symptomReportRepository.findById(id);
    }
    
    public Page<SymptomReport> getAllReports(Pageable pageable) {
        return symptomReportRepository.findAll(pageable);
    }
    public SymptomReport save(SymptomReport report) {
        return symptomReportRepository.save(report);
    }
    
    public Page<SymptomReport> getReportsByPatient(Long patientId, Pageable pageable) {
        return symptomReportRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
    }
    
    public Page<SymptomReport> getReportsByDoctor(Long doctorId, Pageable pageable) {
        return symptomReportRepository.findByPatientDoctorIdOrderByCreatedAtDesc(doctorId, pageable);
    }
    
    public Page<SymptomReport> getReportsByStatus(ReportStatus status, Pageable pageable) {
        return symptomReportRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }
    
    public Page<SymptomReport> getReportsBySeverity(SymptomSeverity severity, Pageable pageable) {
        return symptomReportRepository.findBySeverityOrderByCreatedAtDesc(severity, pageable);
    }
    
    public List<SymptomReport> getUrgentReports() {
        return symptomReportRepository.findUrgentReports();
    }
    
    public List<SymptomReport> getPendingReports() {
        return symptomReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING);
    }
    
    public Page<SymptomReport> searchReports(String keyword, Pageable pageable) {
        return symptomReportRepository.searchReports(keyword, pageable);
    }
    
    public SymptomReport reviewReport(Long reportId, Doctor doctor, String doctorNotes, String doctorResponse) {
        Optional<SymptomReport> reportOpt = symptomReportRepository.findById(reportId);
        if (reportOpt.isPresent()) {
            SymptomReport report = reportOpt.get();
            report.setReviewedByDoctor(doctor);
            report.setDoctorNotes(doctorNotes);
            report.setDoctorResponse(doctorResponse);
            report.setReviewedAt(LocalDateTime.now());
            report.setStatus(ReportStatus.REVIEWED);
            
            SymptomReport savedReport = symptomReportRepository.save(report);
            
            // Notify patient of doctor's response
            notificationService.notifyPatientOfDoctorResponse(savedReport);
            
            return savedReport;
        }
        throw new RuntimeException("Không tìm thấy báo cáo triệu chứng");
    }
    
    public SymptomReport updateReportStatus(Long reportId, ReportStatus status) {
        Optional<SymptomReport> reportOpt = symptomReportRepository.findById(reportId);
        if (reportOpt.isPresent()) {
            SymptomReport report = reportOpt.get();
            report.setStatus(status);
            return symptomReportRepository.save(report);
        }
        throw new RuntimeException("Không tìm thấy báo cáo triệu chứng");
    }
    
    public SymptomReport setFollowUp(Long reportId, LocalDateTime followUpDate, String notes) {
        Optional<SymptomReport> reportOpt = symptomReportRepository.findById(reportId);
        if (reportOpt.isPresent()) {
            SymptomReport report = reportOpt.get();
            report.setFollowUpRequired(true);
            report.setFollowUpDate(followUpDate);
            if (notes != null) {
                report.setDoctorNotes(report.getDoctorNotes() + "\n\nFollow-up: " + notes);
            }
            return symptomReportRepository.save(report);
        }
        throw new RuntimeException("Không tìm thấy báo cáo triệu chứng");
    }
    
    public List<SymptomReport> getReportsRequiringFollowUp() {
        return symptomReportRepository.findReportsRequiringFollowUp(LocalDateTime.now());
    }
    
    // Statistics methods
    public long getTotalReportsCount() {
        return symptomReportRepository.count();
    }
    
    public long getPendingReportsCount() {
        return symptomReportRepository.countByStatus(ReportStatus.PENDING);
    }
    
    public long getUrgentReportsCount() {
        return symptomReportRepository.countUrgentReports();
    }
    
    public long getReviewedReportsCount() {
        return symptomReportRepository.countByStatus(ReportStatus.REVIEWED);
    }
}
