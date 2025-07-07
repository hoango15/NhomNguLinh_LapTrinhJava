package com.hivtreatment.service;

import com.hivtreatment.entity.Appointment;
import com.hivtreatment.entity.Notification;
import com.hivtreatment.entity.SymptomReport;
import com.hivtreatment.entity.User;
import com.hivtreatment.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JavaMailSender mailSender;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public void markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = getUnreadNotificationsByUser(userId);
        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    public void sendMedicationReminder(User user, String medicationName) {
        // Create notification
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Nhắc nhở uống thuốc");
        notification.setMessage("Đã đến giờ uống thuốc " + medicationName);
        notification.setType("MEDICATION_REMINDER");
        createNotification(notification);

        // Send email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Nhắc nhở uống thuốc - HIV Treatment System");
            message.setText("Xin chào " + user.getUsername() + ",\n\n" +
                    "Đây là lời nhắc nhở uống thuốc " + medicationName + ".\n" +
                    "Vui lòng tuân thủ đúng giờ để đảm bảo hiệu quả điều trị.\n\n" +
                    "Trân trọng,\nHệ thống quản lý điều trị HIV");
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the notification creation
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
    public void sendAppointmentConfirmation(Appointment appointment) {
    User user = appointment.getPatient().getUser(); // ✔️ đúng cú pháp
    String doctorName = appointment.getDoctor().getFullName();
    String appointmentTime = appointment.getAppointmentDate().toString(); // format as needed

    sendAppointmentNotification(user, doctorName, appointmentTime);
}
public void sendAppointmentCancellation(Appointment appointment, String reason) {
    User user = appointment.getPatient().getUser(); 


    Notification notification = new Notification();
    notification.setUser(user);
    notification.setTitle("Hủy lịch hẹn");
    notification.setMessage("Lịch hẹn của bạn đã bị hủy. Lý do: " + reason);
    notification.setType("APPOINTMENT_CANCELLED");
    createNotification(notification);

    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Hủy lịch hẹn - HIV Treatment System");
        message.setText("Xin chào " + user.getUsername() + ",\n\n" +
                "Lịch hẹn của bạn đã bị hủy.\nLý do: " + reason + "\n\nTrân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send cancellation email: " + e.getMessage());
    }
}
public void sendAppointmentReschedule(Appointment appointment, String newTime) {
    User user = appointment.getPatient().getUser(); // ✔️ đúng cú pháp


    Notification notification = new Notification();
    notification.setUser(user);
    notification.setTitle("Đổi lịch hẹn");
    notification.setMessage("Lịch hẹn của bạn đã được dời lại đến: " + newTime);
    notification.setType("APPOINTMENT_RESCHEDULED");
    createNotification(notification);

    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Đổi lịch hẹn - HIV Treatment System");
        message.setText("Xin chào " + user.getUsername() + ",\n\n" +
                "Lịch hẹn của bạn đã được dời lại đến: " + newTime + "\n\nTrân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send reschedule email: " + e.getMessage());
    }
}

public void notifyDoctorOfUrgentSymptomReport(SymptomReport report) {
    if (report.getReviewedByDoctor() == null) return;

    User doctorUser = report.getReviewedByDoctor().getUser();
    String messageText = "Báo cáo triệu chứng khẩn cấp từ bệnh nhân " + report.getPatient().getFullName();

    Notification notification = new Notification();
    notification.setUser(doctorUser);
    notification.setTitle("Cảnh báo triệu chứng nghiêm trọng");
    notification.setMessage(messageText);
    notification.setType("URGENT_SYMPTOM");
    createNotification(notification);

    // Gửi email (nếu cần)
    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(doctorUser.getEmail());
        message.setSubject("Cảnh báo triệu chứng nghiêm trọng - HIV Treatment System");
        message.setText("Xin chào " + doctorUser.getUsername() + ",\n\n" +
                messageText + ".\nVui lòng xem và xử lý sớm.\n\nTrân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send doctor email: " + e.getMessage());
    }
}
public void sendAppointmentNotification(User user, String doctorName, String appointmentTime) {
    Notification notification = new Notification();
    notification.setUser(user);
    notification.setTitle("Xác nhận lịch hẹn");
    notification.setMessage("Lịch hẹn với bác sĩ " + doctorName + " vào lúc " + appointmentTime);
    notification.setType("APPOINTMENT");
    createNotification(notification);

    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Xác nhận lịch hẹn - HIV Treatment System");
        message.setText("Xin chào " + user.getUsername() + ",\n\n" +
                "Lịch hẹn của bạn với bác sĩ " + doctorName + " vào lúc " + appointmentTime + " đã được xác nhận.\n\n" +
                "Trân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send appointment email: " + e.getMessage());
    }
}
public void sendAnonymousConsultationNotification(User user, String consultationTime, String details) {
    Notification notification = new Notification();
    notification.setUser(user);
    notification.setTitle("Tư vấn ẩn danh");
    notification.setMessage("Bạn đã đặt cuộc tư vấn ẩn danh vào lúc " + consultationTime + ". Chi tiết: " + details);
    notification.setType("ANONYMOUS_CONSULTATION");
    createNotification(notification);

    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Tư vấn ẩn danh - HIV Treatment System");
        message.setText("Xin chào " + user.getUsername() + ",\n\n" +
                "Bạn đã đặt cuộc tư vấn ẩn danh vào lúc " + consultationTime + ".\nChi tiết: " + details + "\n\n" +
                "Trân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send anonymous consultation email: " + e.getMessage());
    }
}
public void sendSymptomReportNotification(User doctorUser, String title, String messageText) {
    Notification notification = new Notification();
    notification.setUser(doctorUser);
    notification.setTitle(title);
    notification.setMessage(messageText);
    notification.setType("SYMPTOM_REPORT");
    createNotification(notification);

    // Gửi email
    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(doctorUser.getEmail());
        message.setSubject(title + " - HIV Treatment System");
        message.setText("Xin chào " + doctorUser.getUsername() + ",\n\n" +
                messageText + ".\n\nTrân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send symptom report email: " + e.getMessage());
    }
}

public void sendConsultationNotification(User user, String doctorName, String consultationTime) {
    Notification notification = new Notification();
    notification.setUser(user);
    notification.setTitle("Tư vấn với bác sĩ");
    notification.setMessage("Bạn có cuộc tư vấn với bác sĩ " + doctorName + " vào lúc " + consultationTime);
    notification.setType("CONSULTATION");
    createNotification(notification);

    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Thông báo tư vấn - HIV Treatment System");
        message.setText("Xin chào " + user.getUsername() + ",\n\n" +
                "Bạn có cuộc tư vấn với bác sĩ " + doctorName + " vào lúc " + consultationTime + ".\n\n" +
                "Trân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send consultation email: " + e.getMessage());
    }
}


public void notifyPatientOfDoctorResponse(SymptomReport report) {
    User patientUser = report.getPatient().getUser();
    String messageText = "Bác sĩ đã phản hồi báo cáo triệu chứng của bạn.";

    Notification notification = new Notification();
    notification.setUser(patientUser);
    notification.setTitle("Phản hồi từ bác sĩ");
    notification.setMessage(messageText);
    notification.setType("DOCTOR_RESPONSE");
    createNotification(notification);

    // Gửi email (nếu cần)
    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(patientUser.getEmail());
        message.setSubject("Phản hồi từ bác sĩ - HIV Treatment System");
        message.setText("Xin chào " + patientUser.getUsername() + ",\n\n" +
                messageText + "\n\nVui lòng đăng nhập để xem chi tiết.\n\nTrân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send patient email: " + e.getMessage());
    }
}

    public void sendAppointmentReminder(User user, LocalDateTime appointmentTime, String doctorName) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Nhắc nhở lịch hẹn");
        notification.setMessage("Bạn có lịch hẹn với " + doctorName + " vào " + appointmentTime);
        notification.setType("APPOINTMENT_REMINDER");
        createNotification(notification);

        // Send email
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Nhắc nhở lịch hẹn - HIV Treatment System");
            message.setText("Xin chào " + user.getUsername() + ",\n\n" +
                    "Bạn có lịch hẹn với " + doctorName + " vào " + appointmentTime + ".\n" +
                    "Vui lòng đến đúng giờ.\n\n" +
                    "Trân trọng,\nHệ thống quản lý điều trị HIV");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
    public void notifyDoctorOfAssignedSymptomReport(SymptomReport report, com.hivtreatment.entity.Doctor doctor) {
    User doctorUser = doctor.getUser();
    String messageText = "Bạn đã được phân công xử lý một báo cáo triệu chứng từ bệnh nhân " + report.getPatient().getFullName();

    Notification notification = new Notification();
    notification.setUser(doctorUser);
    notification.setTitle("Phân công báo cáo triệu chứng");
    notification.setMessage(messageText);
    notification.setType("ASSIGNED_SYMPTOM");
    createNotification(notification);

    // Gửi email
    try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(doctorUser.getEmail());
        message.setSubject("Phân công báo cáo triệu chứng - HIV Treatment System");
        message.setText("Xin chào " + doctorUser.getUsername() + ",\n\n" +
                messageText + "\n\nVui lòng đăng nhập để xem chi tiết.\n\nTrân trọng,\nHệ thống điều trị HIV");
        mailSender.send(message);
    } catch (Exception e) {
        System.err.println("Failed to send doctor assignment email: " + e.getMessage());
    }
}


    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
