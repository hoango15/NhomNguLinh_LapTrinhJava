package com.hivtreatment.service;

import com.hivtreatment.entity.Appointment;
import com.hivtreatment.entity.Prescription;
import com.hivtreatment.enums.AppointmentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduledTaskService {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private NotificationService notificationService;

    // Send appointment reminders every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void sendAppointmentReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Appointment> tomorrowAppointments = appointmentService.getAppointmentsByDate(tomorrow);
        
        for (Appointment appointment : tomorrowAppointments) {
            if (appointment.getStatus() == AppointmentStatus.CONFIRMED) {
                LocalDateTime appointmentDateTime = LocalDateTime.of(
                    appointment.getAppointmentDate(), 
                    appointment.getAppointmentTime()
                );
                
                notificationService.sendAppointmentReminder(
                    appointment.getPatient().getUser(),
                    appointmentDateTime,
                    appointment.getDoctor().getFullName()
                );
            }
        }
    }

    // Send medication reminders every day at 7:00 AM and 7:00 PM
    @Scheduled(cron = "0 0 7,19 * * ?")
    public void sendMedicationReminders() {
        List<Prescription> activePrescriptions = prescriptionService.getPrescriptionsByStatus("ACTIVE");
        
        for (Prescription prescription : activePrescriptions) {
            // Check if prescription is still valid
            if (prescription.getEndDate() == null || prescription.getEndDate().isAfter(LocalDate.now())) {
                prescription.getPrescriptionMedications().forEach(prescriptionMedication -> {
                    notificationService.sendMedicationReminder(
                        prescription.getPatient().getUser(),
                        prescriptionMedication.getMedication().getName()
                    );
                });
            }
        }
    }

    // Clean up old notifications every week
    @Scheduled(cron = "0 0 2 * * SUN")
    public void cleanupOldNotifications() {
        // Implementation to delete notifications older than 30 days
        // This would require additional repository methods
    }

    // Generate monthly reports on the 1st of each month
    @Scheduled(cron = "0 0 6 1 * ?")
    public void generateMonthlyReports() {
        // Implementation to generate and email monthly reports to administrators
        // This would integrate with ReportService and email functionality
    }
}
