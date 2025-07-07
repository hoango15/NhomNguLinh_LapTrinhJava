package com.hivtreatment.dto;

public class DashboardStatsDTO {

    private long totalPatients;
    private long totalDoctors;
    private long totalStaff;
    private long todayAppointments;
    private long newPatientsThisMonth;
    private long completedAppointmentsThisMonth;
    private long pendingConsultations;
    private long activePrescriptions;
    private long onlineConsultations;
    private long upcomingAppointments;
    private long newPrescriptionsThisWeek;

    // ➕ Thêm các trường mới theo yêu cầu controller
    private long totalUsers;
    private long totalAppointments;
    private long totalPrescriptions;
    private long newUsersThisMonth;
    private long activePatients;
    private long availableDoctors;
    private String monthlyRevenue;
    private String revenueGrowth;

    // Constructors
    public DashboardStatsDTO() {
    }

    // Getters and Setters

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalStaff() {
        return totalStaff;
    }

    public void setTotalStaff(long totalStaff) {
        this.totalStaff = totalStaff;
    }

    public long getTodayAppointments() {
        return todayAppointments;
    }

    public void setTodayAppointments(long todayAppointments) {
        this.todayAppointments = todayAppointments;
    }

    public long getNewPatientsThisMonth() {
        return newPatientsThisMonth;
    }

    public void setNewPatientsThisMonth(long newPatientsThisMonth) {
        this.newPatientsThisMonth = newPatientsThisMonth;
    }

    public long getCompletedAppointmentsThisMonth() {
        return completedAppointmentsThisMonth;
    }

    public void setCompletedAppointmentsThisMonth(long completedAppointmentsThisMonth) {
        this.completedAppointmentsThisMonth = completedAppointmentsThisMonth;
    }

    public long getPendingConsultations() {
        return pendingConsultations;
    }

    public void setPendingConsultations(long pendingConsultations) {
        this.pendingConsultations = pendingConsultations;
    }

    public long getActivePrescriptions() {
        return activePrescriptions;
    }

    public void setActivePrescriptions(long activePrescriptions) {
        this.activePrescriptions = activePrescriptions;
    }

    public long getOnlineConsultations() {
        return onlineConsultations;
    }

    public void setOnlineConsultations(long onlineConsultations) {
        this.onlineConsultations = onlineConsultations;
    }

    public long getUpcomingAppointments() {
        return upcomingAppointments;
    }

    public void setUpcomingAppointments(long upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }

    public long getNewPrescriptionsThisWeek() {
        return newPrescriptionsThisWeek;
    }

    public void setNewPrescriptionsThisWeek(long newPrescriptionsThisWeek) {
        this.newPrescriptionsThisWeek = newPrescriptionsThisWeek;
    }

    // ➕ Các getter/setter mới thêm

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getTotalPrescriptions() {
        return totalPrescriptions;
    }

    public void setTotalPrescriptions(long totalPrescriptions) {
        this.totalPrescriptions = totalPrescriptions;
    }

    public long getNewUsersThisMonth() {
        return newUsersThisMonth;
    }

    public void setNewUsersThisMonth(long newUsersThisMonth) {
        this.newUsersThisMonth = newUsersThisMonth;
    }

    public long getActivePatients() {
        return activePatients;
    }

    public void setActivePatients(long activePatients) {
        this.activePatients = activePatients;
    }

    public long getAvailableDoctors() {
        return availableDoctors;
    }

    public void setAvailableDoctors(long availableDoctors) {
        this.availableDoctors = availableDoctors;
    }

    public String getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(String monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public String getRevenueGrowth() {
        return revenueGrowth;
    }

    public void setRevenueGrowth(String revenueGrowth) {
        this.revenueGrowth = revenueGrowth;
    }
}
