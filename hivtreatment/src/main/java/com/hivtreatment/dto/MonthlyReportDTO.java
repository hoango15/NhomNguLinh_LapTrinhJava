package com.hivtreatment.dto;

import java.util.List;

public class MonthlyReportDTO {
    private int totalAppointments;
    private int confirmedAppointments;
    private int cancelledAppointments;
    private int completedAppointments;
    private List<String> mostPrescribedMedications;

    // Constructors
    public MonthlyReportDTO() {}

    public MonthlyReportDTO(int totalAppointments, int confirmedAppointments, int cancelledAppointments, int completedAppointments, List<String> mostPrescribedMedications) {
        this.totalAppointments = totalAppointments;
        this.confirmedAppointments = confirmedAppointments;
        this.cancelledAppointments = cancelledAppointments;
        this.completedAppointments = completedAppointments;
        this.mostPrescribedMedications = mostPrescribedMedications;
    }

    // Getters and Setters
    public int getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(int totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public int getConfirmedAppointments() {
        return confirmedAppointments;
    }

    public void setConfirmedAppointments(int confirmedAppointments) {
        this.confirmedAppointments = confirmedAppointments;
    }

    public int getCancelledAppointments() {
        return cancelledAppointments;
    }

    public void setCancelledAppointments(int cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }

    public int getCompletedAppointments() {
        return completedAppointments;
    }

    public void setCompletedAppointments(int completedAppointments) {
        this.completedAppointments = completedAppointments;
    }

    public List<String> getMostPrescribedMedications() {
        return mostPrescribedMedications;
    }

    public void setMostPrescribedMedications(List<String> mostPrescribedMedications) {
        this.mostPrescribedMedications = mostPrescribedMedications;
    }
}
