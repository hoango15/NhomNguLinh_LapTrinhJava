package com.hivtreatment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
public class LabResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @NotNull(message = "Ngày xét nghiệm không được để trống")
    @Column(name = "test_date", nullable = false)
    private LocalDate testDate;

    @Column(name = "test_type")
    private String testType;

    @Column(name = "result_value")
    private BigDecimal resultValue;

    @Column(name = "result_text", columnDefinition = "TEXT")
    private String resultText;

    @Column(name = "reference_range")
    private String referenceRange;

    private String status = "NORMAL";
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public LabResult() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public LocalDate getTestDate() { return testDate; }
    public void setTestDate(LocalDate testDate) { this.testDate = testDate; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }

    public BigDecimal getResultValue() { return resultValue; }
    public void setResultValue(BigDecimal resultValue) { this.resultValue = resultValue; }

    public String getResultText() { return resultText; }
    public void setResultText(String resultText) { this.resultText = resultText; }

    public String getReferenceRange() { return referenceRange; }
    public void setReferenceRange(String referenceRange) { this.referenceRange = referenceRange; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
