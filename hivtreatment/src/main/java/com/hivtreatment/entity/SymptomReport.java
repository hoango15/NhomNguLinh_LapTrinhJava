package com.hivtreatment.entity;

import com.hivtreatment.enums.SymptomSeverity;
import com.hivtreatment.enums.ReportStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "symptom_reports")
public class SymptomReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "report_title", nullable = false)
    private String reportTitle;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private SymptomSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "pain_level")
    private Integer painLevel;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "blood_pressure")
    private String bloodPressure;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Column(name = "attachments")
    private String attachments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_doctor_id")
    private Doctor reviewedByDoctor;

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(name = "doctor_response", columnDefinition = "TEXT")
    private String doctorResponse;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "priority_level")
    private Integer priorityLevel = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getReportTitle() { return reportTitle; }
    public void setReportTitle(String reportTitle) { this.reportTitle = reportTitle; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SymptomSeverity getSeverity() { return severity; }
    public void setSeverity(SymptomSeverity severity) { this.severity = severity; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public Integer getPainLevel() { return painLevel; }
    public void setPainLevel(Integer painLevel) { this.painLevel = painLevel; }

    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public String getBloodPressure() { return bloodPressure; }
    public void setBloodPressure(String bloodPressure) { this.bloodPressure = bloodPressure; }

    public String getAdditionalNotes() { return additionalNotes; }
    public void setAdditionalNotes(String additionalNotes) { this.additionalNotes = additionalNotes; }

    public String getAttachments() { return attachments; }
    public void setAttachments(String attachments) { this.attachments = attachments; }

    public Doctor getReviewedByDoctor() { return reviewedByDoctor; }
    public void setReviewedByDoctor(Doctor reviewedByDoctor) { this.reviewedByDoctor = reviewedByDoctor; }

    public String getDoctorNotes() { return doctorNotes; }
    public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }

    public String getDoctorResponse() { return doctorResponse; }
    public void setDoctorResponse(String doctorResponse) { this.doctorResponse = doctorResponse; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public Boolean getFollowUpRequired() { return followUpRequired; }
    public void setFollowUpRequired(Boolean followUpRequired) { this.followUpRequired = followUpRequired; }

    public LocalDateTime getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDateTime followUpDate) { this.followUpDate = followUpDate; }

    public Integer getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public boolean isUrgent() {
        return severity == SymptomSeverity.SEVERE || severity == SymptomSeverity.CRITICAL;
    }

    public boolean isPending() {
        return status == ReportStatus.PENDING;
    }

    public boolean isReviewed() {
        return status == ReportStatus.REVIEWED;
    }

    public String getFormattedSymptoms() {
        if (symptoms == null) return "";
        return symptoms.replace(",", ", ");
    }
    

    public String getStatusDisplayName() {
        switch (status) {
            case PENDING: return "Chờ xử lý";
            case IN_PROGRESS: return "Đang xử lý";
            case REVIEWED: return "Đã xem";
            case RESOLVED: return "Đã giải quyết";
            default: return status.name();
        }
    }

    public String getSeverityDisplayName() {
        switch (severity) {
            case MILD: return "Nhẹ";
            case MODERATE: return "Vừa";
            case SEVERE: return "Nặng";
            case CRITICAL: return "Nghiêm trọng";
            default: return severity.name();
        }
    }

    public String getSeverityColor() {
        switch (severity) {
            case MILD: return "success";
            case MODERATE: return "warning";
            case SEVERE: return "danger";
            case CRITICAL: return "dark";
            default: return "secondary";
        }
    }
    
}
