package com.hivtreatment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "arv_protocol_medications")
public class ARVProtocolMedication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "protocol_id", nullable = false)
    private ARVProtocol protocol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @NotBlank(message = "Liều lượng không được để trống")
    @Column(nullable = false)
    private String dosage;

    @NotBlank(message = "Tần suất không được để trống")
    @Column(nullable = false)
    private String frequency;

    private String timing; // MORNING, EVENING, WITH_FOOD, etc.

    private String notes;

    // Constructors
    public ARVProtocolMedication() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ARVProtocol getProtocol() { return protocol; }
    public void setProtocol(ARVProtocol protocol) { this.protocol = protocol; }

    public Medication getMedication() { return medication; }
    public void setMedication(Medication medication) { this.medication = medication; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getTiming() { return timing; }
    public void setTiming(String timing) { this.timing = timing; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
