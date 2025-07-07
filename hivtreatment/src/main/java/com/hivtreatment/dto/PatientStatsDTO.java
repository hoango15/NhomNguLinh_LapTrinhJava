package com.hivtreatment.dto;

public class PatientStatsDTO {
    private int totalAppointments;
    private int activePrescriptions;
    private int labResultsCount;
    private int upcomingAppointments;

    // Constructors
    public PatientStatsDTO() {}

    // Getters and Setters
    public int getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(int totalAppointments) { this.totalAppointments = totalAppointments; }

    public int getActivePrescriptions() { return activePrescriptions; }
    public void setActivePrescriptions(int activePrescriptions) { this.activePrescriptions = activePrescriptions; }

    public int getLabResultsCount() { return labResultsCount; }
    public void setLabResultsCount(int labResultsCount) { this.labResultsCount = labResultsCount; }

    public int getUpcomingAppointments() { return upcomingAppointments; }
    public void setUpcomingAppointments(int upcomingAppointments) { this.upcomingAppointments = upcomingAppointments; }
}
