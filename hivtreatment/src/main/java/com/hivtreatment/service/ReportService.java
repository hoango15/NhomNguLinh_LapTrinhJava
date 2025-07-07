package com.hivtreatment.service;

import com.hivtreatment.dto.DashboardStatsDTO;
import com.hivtreatment.dto.PatientStatsDTO;
import com.hivtreatment.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private UserService userService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private LabResultService labResultService;

    public DashboardStatsDTO getAdminDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        stats.setTotalPatients(patientService.getTotalPatientCount());
        stats.setTotalDoctors(doctorService.getAvailableDoctorCount());
        stats.setTotalStaff(userService.getUsersByRole(UserRole.STAFF).size());
        stats.setTodayAppointments(appointmentService.getTodayAppointmentCount());
        
        // Monthly statistics
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        stats.setNewPatientsThisMonth(getNewPatientsCount(startOfMonth, LocalDate.now()));
        stats.setCompletedAppointmentsThisMonth(getCompletedAppointmentsCount(startOfMonth, LocalDate.now()));
        
        return stats;
    }

    public DashboardStatsDTO getDoctorDashboardStats(Long doctorId) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        stats.setTodayAppointments(appointmentService.getAppointmentsByDoctorAndDate(doctorId, LocalDate.now()).size());
        stats.setTotalPatients(getPatientCountByDoctor(doctorId));
        stats.setPendingConsultations(getPendingConsultationsCount(doctorId));
        
        return stats;
    }

    public PatientStatsDTO getPatientStats(Long patientId) {
        PatientStatsDTO stats = new PatientStatsDTO();
        
        stats.setTotalAppointments(appointmentService.getAppointmentsByPatient(patientId).size());
        stats.setActivePrescriptions(prescriptionService.getActivePrescriptionsByPatient(patientId).size());
        stats.setLabResultsCount(labResultService.getLabResultsByPatient(patientId).size());
        
        return stats;
    }

    public Map<String, Object> getMonthlyReport(int year, int month) {
        Map<String, Object> report = new HashMap<>();
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        report.put("period", month + "/" + year);
        report.put("newPatients", getNewPatientsCount(startDate, endDate));
        report.put("totalAppointments", getAppointmentsCount(startDate, endDate));
        report.put("completedAppointments", getCompletedAppointmentsCount(startDate, endDate));
        report.put("prescriptionsIssued", getPrescriptionsCount(startDate, endDate));
        report.put("labTestsPerformed", getLabTestsCount(startDate, endDate));
        
        return report;
    }

    public Map<String, Object> getAnnualReport(int year) {
        Map<String, Object> report = new HashMap<>();
        
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        report.put("year", year);
        report.put("totalPatients", patientService.getTotalPatientCount());
        report.put("newPatients", getNewPatientsCount(startDate, endDate));
        report.put("totalAppointments", getAppointmentsCount(startDate, endDate));
        report.put("totalPrescriptions", getPrescriptionsCount(startDate, endDate));
        report.put("totalLabTests", getLabTestsCount(startDate, endDate));
        
        // Monthly breakdown
        Map<String, Integer> monthlyBreakdown = new HashMap<>();
        for (int month = 1; month <= 12; month++) {
            LocalDate monthStart = LocalDate.of(year, month, 1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            monthlyBreakdown.put("month_" + month, getNewPatientsCount(monthStart, monthEnd));
        }
        report.put("monthlyNewPatients", monthlyBreakdown);
        
        return report;
    }

    private int getNewPatientsCount(LocalDate startDate, LocalDate endDate) {
        // Implementation would query database for patients created between dates
        return 0; // Placeholder
    }

    private int getAppointmentsCount(LocalDate startDate, LocalDate endDate) {
        // Implementation would query database for appointments between dates
        return 0; // Placeholder
    }

    private int getCompletedAppointmentsCount(LocalDate startDate, LocalDate endDate) {
        // Implementation would query database for completed appointments between dates
        return 0; // Placeholder
    }

    private int getPrescriptionsCount(LocalDate startDate, LocalDate endDate) {
        return prescriptionService.getPrescriptionsByDateRange(startDate, endDate).size();
    }

    private int getLabTestsCount(LocalDate startDate, LocalDate endDate) {
        return labResultService.getLabResultsByDateRange(startDate, endDate).size();
    }
   public Map<String, Integer> getUserDistribution() {
    Map<String, Integer> distribution = new HashMap<>();
    for (UserRole role : UserRole.values()) {
        int count = userService.getUsersByRole(role).size();
        distribution.put(role.name(), count);
    }
    return distribution;
}


public Map<String, Object> getSystemActivityChartData(String period) {
    Map<String, Object> chartData = new HashMap<>();

    List<String> labels = new ArrayList<>();
    List<Integer> values = new ArrayList<>();

    LocalDate today = LocalDate.now();

    switch (period.toLowerCase()) {
        case "week":
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                labels.add(date.toString());
                values.add(getAppointmentsCount(date, date)); // Số cuộc hẹn mỗi ngày
            }
            break;

        case "month":
            for (int i = 1; i <= today.lengthOfMonth(); i++) {
                LocalDate date = today.withDayOfMonth(i);
                labels.add(String.valueOf(i));
                values.add(getAppointmentsCount(date, date));
            }
            break;

        case "year":
            for (int i = 1; i <= 12; i++) {
                LocalDate monthStart = LocalDate.of(today.getYear(), i, 1);
                LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
                labels.add("Tháng " + i);
                values.add(getAppointmentsCount(monthStart, monthEnd));
            }
            break;

        default:
            throw new IllegalArgumentException("Invalid period: " + period);
    }

    chartData.put("labels", labels);
    chartData.put("values", values);
    return chartData;
}



    private long getPatientCountByDoctor(Long doctorId) {
        return appointmentService.getAppointmentsByDoctor(doctorId).stream()
                .map(appointment -> appointment.getPatient().getId())
                .distinct()
                .count();
    }

    private int getPendingConsultationsCount(Long doctorId) {
        // Implementation would query consultation service
        return 0; // Placeholder
    }
    public Map<String, Object> getReportSummary() {
    Map<String, Object> summary = new HashMap<>();

    summary.put("totalPatients", patientService.getTotalPatientCount());
    summary.put("totalDoctors", doctorService.getAvailableDoctorCount());
    summary.put("totalStaff", userService.getUsersByRole(UserRole.STAFF).size());
    summary.put("todayAppointments", appointmentService.getTodayAppointmentCount());

    return summary;
}

}
