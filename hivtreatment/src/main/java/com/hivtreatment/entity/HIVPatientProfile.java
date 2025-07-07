package com.hivtreatment.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hiv_patient_profiles")
public class HIVPatientProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "patient_id", unique = true, nullable = false)
    private Patient patient;

    @Column(name = "hiv_diagnosis_date")
    private LocalDate hivDiagnosisDate;

    @Column(name = "art_start_date")
    private LocalDate artStartDate;

    @Column(name = "current_cd4_count")
    private Integer currentCD4Count;

    @Column(name = "baseline_cd4_count")
    private Integer baselineCD4Count;

    @Column(name = "current_viral_load")
    private Integer currentViralLoad;

    @Column(name = "baseline_viral_load")
    private Integer baselineViralLoad;

    @Column(name = "hiv_stage")
    private String hivStage;

    @Column(name = "transmission_route")
    private String transmissionRoute;

    @Column(name = "current_arv_protocol")
    private String currentARVProtocol;

    @Column(name = "treatment_adherence_rate")
    private Double treatmentAdherenceRate;

    @Column(name = "last_cd4_test_date")
    private LocalDate lastCD4TestDate;

    @Column(name = "last_viral_load_test_date")
    private LocalDate lastViralLoadTestDate;

    @Column(name = "next_appointment_date")
    private LocalDate nextAppointmentDate;

    @Column(name = "is_treatment_experienced")
    private Boolean isTreatmentExperienced = false;

    @Column(name = "has_drug_resistance")
    private Boolean hasDrugResistance = false;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String comorbidities;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ✅ New field
    @Column(name = "viral_load_undetectable")
    private Boolean viralLoadUndetectable;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public HIVPatientProfile() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public LocalDate getHivDiagnosisDate() { return hivDiagnosisDate; }
    public void setHivDiagnosisDate(LocalDate hivDiagnosisDate) { this.hivDiagnosisDate = hivDiagnosisDate; }

    public LocalDate getArtStartDate() { return artStartDate; }
    public void setArtStartDate(LocalDate artStartDate) { this.artStartDate = artStartDate; }

    public Integer getCurrentCD4Count() { return currentCD4Count; }
    public void setCurrentCD4Count(Integer currentCD4Count) { this.currentCD4Count = currentCD4Count; }

    public Integer getBaselineCD4Count() { return baselineCD4Count; }
    public void setBaselineCD4Count(Integer baselineCD4Count) { this.baselineCD4Count = baselineCD4Count; }

    public Integer getCurrentViralLoad() { return currentViralLoad; }
    public void setCurrentViralLoad(Integer currentViralLoad) { this.currentViralLoad = currentViralLoad; }

    public Integer getBaselineViralLoad() { return baselineViralLoad; }
    public void setBaselineViralLoad(Integer baselineViralLoad) { this.baselineViralLoad = baselineViralLoad; }

    public String getHivStage() { return hivStage; }
    public void setHivStage(String hivStage) { this.hivStage = hivStage; }

    public String getTransmissionRoute() { return transmissionRoute; }
    public void setTransmissionRoute(String transmissionRoute) { this.transmissionRoute = transmissionRoute; }

    public String getCurrentARVProtocol() { return currentARVProtocol; }
    public void setCurrentARVProtocol(String currentARVProtocol) { this.currentARVProtocol = currentARVProtocol; }

    public Double getTreatmentAdherenceRate() { return treatmentAdherenceRate; }
    public void setTreatmentAdherenceRate(Double treatmentAdherenceRate) { this.treatmentAdherenceRate = treatmentAdherenceRate; }

    public LocalDate getLastCD4TestDate() { return lastCD4TestDate; }
    public void setLastCD4TestDate(LocalDate lastCD4TestDate) { this.lastCD4TestDate = lastCD4TestDate; }

    public LocalDate getLastViralLoadTestDate() { return lastViralLoadTestDate; }
    public void setLastViralLoadTestDate(LocalDate lastViralLoadTestDate) { this.lastViralLoadTestDate = lastViralLoadTestDate; }

    public LocalDate getNextAppointmentDate() { return nextAppointmentDate; }
    public void setNextAppointmentDate(LocalDate nextAppointmentDate) { this.nextAppointmentDate = nextAppointmentDate; }

    public Boolean getIsTreatmentExperienced() { return isTreatmentExperienced; }
    public void setIsTreatmentExperienced(Boolean isTreatmentExperienced) { this.isTreatmentExperienced = isTreatmentExperienced; }

    public Boolean getHasDrugResistance() { return hasDrugResistance; }
    public void setHasDrugResistance(Boolean hasDrugResistance) { this.hasDrugResistance = hasDrugResistance; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getComorbidities() { return comorbidities; }
    public void setComorbidities(String comorbidities) { this.comorbidities = comorbidities; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ✅ Getter and Setter for new field
    public Boolean getViralLoadUndetectable() {
        return viralLoadUndetectable;
    }

    public void setViralLoadUndetectable(Boolean viralLoadUndetectable) {
        this.viralLoadUndetectable = viralLoadUndetectable;
    }
}
