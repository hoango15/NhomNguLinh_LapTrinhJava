package com.hivtreatment.dto;

import java.util.Map;

public class AnnualReportDTO {
    private int totalAppointments;
    private int totalPatients;
    private int totalPrescriptions;
    private Map<Integer, Integer> appointmentsPerMonth;

    // Constructors
    public AnnualReportDTO() {}

    public AnnualReportDTO(int totalAppointments, int totalPatients, int totalPrescriptions, Map<Integer, Integer> appointmentsPerMonth) {
        this.totalAppointments = totalAppointments;
        this.totalPatients = totalPatients;
        this.totalPrescriptions = totalPrescriptions;
        this.appointmentsPerMonth = appointmentsPerMonth;
    }

    // Getters and Setters
    public int getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(int totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public int getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(int totalPatients) {
        this.totalPatients = totalPatients;
    }

    public int getTotalPrescriptions() {
        return totalPrescriptions;
    }

    public void setTotalPrescriptions(int totalPrescriptions) {
        this.totalPrescriptions = totalPrescriptions;
    }

    public Map<Integer, Integer> getAppointmentsPerMonth() {
        return appointmentsPerMonth;
    }

    public void setAppointmentsPerMonth(Map<Integer, Integer> appointmentsPerMonth) {
        this.appointmentsPerMonth = appointmentsPerMonth;
    }
}
