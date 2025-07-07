package com.hivtreatment.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hivtreatment.entity.Appointment;
import com.hivtreatment.enums.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByAppointmentDate(LocalDate date);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByDoctorIdAndAppointmentDate(@Param("doctorId") Long doctorId, @Param("appointmentDate") LocalDate appointmentDate);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    List<Appointment> findByDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId ORDER BY a.appointmentDate DESC")
    List<Appointment> findRecentAppointmentsByPatient(@Param("patientId") Long patientId, Pageable pageable);

    List<Appointment> findByPatientIdAndAppointmentDateAfter(@Param("patientId") Long patientId, @Param("date") LocalDate date);

    Optional<Appointment> findFirstByPatientIdAndAppointmentDateAfterOrderByAppointmentDateAsc(Long patientId, LocalDate date);

    Optional<Appointment> findFirstByPatientIdAndAppointmentDateAfterAndStatusOrderByAppointmentDateAsc(
        Long patientId, LocalDate date, AppointmentStatus status
    );

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId ORDER BY a.appointmentDate DESC")
    List<Appointment> findRecentAppointmentsByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    long countByDoctorIdAndAppointmentDateAfter(Long doctorId, LocalDate date);

    long countByDoctorIdAndStatusAndAppointmentDateBetween(
            Long doctorId, AppointmentStatus status, LocalDate startDate, LocalDate endDate);

    long countByDoctorIdAndAppointmentDateBetweenAndStatus(
            Long doctorId, LocalDate start, LocalDate end, AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = CURRENT_DATE")
    long countTodayAppointments();

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date, Pageable pageable);

    Page<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status, Pageable pageable);

    List<Appointment> findByPatientIdAndAppointmentDateAfterAndStatus(
        Long patientId, LocalDate date, AppointmentStatus status
    );

    long countByDoctorIdAndAppointmentDateAfterAndStatus(
        Long doctorId, LocalDate date, AppointmentStatus status
    );

    List<Appointment> findByPatientIdAndStatus(
        Long patientId, AppointmentStatus status
    );

    List<Appointment> findByPatientIdAndAppointmentDateBeforeAndStatus(
        Long patientId, LocalDate date, AppointmentStatus status
    );
    List<Appointment> findByAppointmentDateAfterAndStatus(LocalDate date, AppointmentStatus status);

    List<Appointment> findByAppointmentDateAndAppointmentType(LocalDate date, String appointmentType);


    // ✅ Newly added methods for support in AppointmentService
    Page<Appointment> findByAppointmentDate(LocalDate date, Pageable pageable);

    Page<Appointment> findByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status, Pageable pageable);
}
