package com.hivtreatment.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivtreatment.entity.Appointment;
import com.hivtreatment.enums.AppointmentStatus;
import com.hivtreatment.repository.AppointmentRepository;

@Service
@Transactional
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getRecentAppointmentsByPatient(Long patientId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return appointmentRepository.findRecentAppointmentsByPatientId(patientId, pageable);
    }

    public List<Appointment> findRecentByPatientId(Long patientId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return appointmentRepository.findRecentAppointmentsByPatientId(patientId, pageable);
    }

    public List<Appointment> findUpcomingByPatientId(Long patientId) {
        return appointmentRepository.findByPatientIdAndAppointmentDateAfterAndStatus(
            patientId, LocalDate.now(), AppointmentStatus.CONFIRMED
        );
    }

    public Optional<Appointment> findNextByPatientId(Long patientId) {
        return appointmentRepository.findFirstByPatientIdAndAppointmentDateAfterAndStatusOrderByAppointmentDateAsc(
            patientId, LocalDate.now(), AppointmentStatus.CONFIRMED
        );
    }

    public long countAll() {
        return appointmentRepository.count();
    }

    public long countToday() {
        return appointmentRepository.countTodayAppointments();
    }

    public long countTodayByDoctorId(Long doctorId) {
        return appointmentRepository.countByDoctorIdAndAppointmentDate(doctorId, LocalDate.now());
    }

    public long countUpcomingByDoctorId(Long doctorId) {
        return appointmentRepository.countByDoctorIdAndAppointmentDateAfterAndStatus(
            doctorId, LocalDate.now(), AppointmentStatus.CONFIRMED
        );
    }

    public long countCompletedThisMonthByDoctorId(Long doctorId) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        return appointmentRepository.countByDoctorIdAndStatusAndAppointmentDateBetween(
            doctorId, AppointmentStatus.COMPLETED, startOfMonth, LocalDate.now()
        );
    }

    public List<Appointment> findTodayByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, LocalDate.now());
    }

    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    // ✅ NEW: Overloaded method with Pageable
    public Page<Appointment> getAppointmentsByDate(LocalDate date, Pageable pageable) {
        return appointmentRepository.findByAppointmentDate(date, pageable);
    }

    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }

    public List<Appointment> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorAndDate(doctorId, date);
    }

    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    // ✅ NEW: Save appointment (unified for create/update)
    public Appointment saveAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public void confirmAppointment(Long appointmentId) {
        appointmentRepository.findById(appointmentId).ifPresent(appointment -> {
            appointment.setStatus(AppointmentStatus.CONFIRMED);
            appointmentRepository.save(appointment);
        });
    }

    public void cancelAppointment(Long appointmentId) {
        appointmentRepository.findById(appointmentId).ifPresent(appointment -> {
            appointment.setStatus(AppointmentStatus.CANCELLED);
            appointmentRepository.save(appointment);
        });
    }

    public void completeAppointment(Long appointmentId) {
        appointmentRepository.findById(appointmentId).ifPresent(appointment -> {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);
        });
    }

    public long getTodayAppointmentCount() {
        return appointmentRepository.countTodayAppointments();
    }

    public Page<Appointment> getAppointmentsByDoctor(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable);
    }

    public Page<Appointment> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date, Pageable pageable) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date, pageable);
    }

    public Page<Appointment> getAppointmentsByDoctorAndStatus(Long doctorId, AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status, pageable);
    }

    // ✅ NEW: Pagination with Date + Status
    public Page<Appointment> getAppointmentsByDateAndStatus(LocalDate date, AppointmentStatus status, Pageable pageable) {
        return appointmentRepository.findByAppointmentDateAndStatus(date, status, pageable);
    }

    // ✅ NEW: Get today's appointments
    public List<Appointment> getTodayAppointments() {
        return appointmentRepository.findByAppointmentDate(LocalDate.now());
    }

    public List<Appointment> getNewAppointmentsSince(Long doctorId, LocalDateTime since) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
            .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(since))
            .toList();
    }

    public List<Appointment> getUpcomingAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdAndAppointmentDateAfterAndStatus(
            patientId, LocalDate.now(), AppointmentStatus.CONFIRMED
        );
    }

    public List<Appointment> getCompletedAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdAndStatus(
            patientId, AppointmentStatus.COMPLETED
        );
    }
    public List<Appointment> getUpcomingAppointments() {
    return appointmentRepository.findByAppointmentDateAfterAndStatus(
        LocalDate.now(), AppointmentStatus.CONFIRMED
    );
}

public List<Appointment> getUrgentAppointments() {
    return appointmentRepository.findByAppointmentDateAndAppointmentType(
        LocalDate.now(), "EMERGENCY"
    );
}


    public List<Appointment> getPastAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdAndAppointmentDateBeforeAndStatus(
            patientId, LocalDate.now(), AppointmentStatus.COMPLETED
        );
    }
}
