package com.hivtreatment.entity;

import jakarta.persistence.*;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "arv_protocols")
public class ARVProtocol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên phác đồ không được để trống")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "protocol_code", unique = true)
    private String protocolCode; // VD: TDF+3TC+DTG

    @Column(name = "target_group")
    private String targetGroup; // ADULT, PREGNANT, CHILDREN, etc.

    @Column(name = "is_first_line")
    private Boolean isFirstLine = true;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String contraindications;

    @Column(columnDefinition = "TEXT")
    private String sideEffects;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "protocol", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ARVProtocolMedication> protocolMedications;

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
    public ARVProtocol() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getProtocolCode() { return protocolCode; }
    public void setProtocolCode(String protocolCode) { this.protocolCode = protocolCode; }

    public String getTargetGroup() { return targetGroup; }
    public void setTargetGroup(String targetGroup) { this.targetGroup = targetGroup; }

    public Boolean getIsFirstLine() { return isFirstLine; }
    public void setIsFirstLine(Boolean isFirstLine) { this.isFirstLine = isFirstLine; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getContraindications() { return contraindications; }
    public void setContraindications(String contraindications) { this.contraindications = contraindications; }

    public String getSideEffects() { return sideEffects; }
    public void setSideEffects(String sideEffects) { this.sideEffects = sideEffects; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ARVProtocolMedication> getProtocolMedications() { return protocolMedications; }
    public void setProtocolMedications(List<ARVProtocolMedication> protocolMedications) { this.protocolMedications = protocolMedications; }
}
