package com.hivtreatment.dto;

public class DoctorAvailabilityDTO {
    private Long id;
    private String fullName;
    private boolean isAvailable;

    public DoctorAvailabilityDTO(Long id, String fullName, boolean isAvailable) {
        this.id = id;
        this.fullName = fullName;
        this.isAvailable = isAvailable;
    }

    // Getters và Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }
}
