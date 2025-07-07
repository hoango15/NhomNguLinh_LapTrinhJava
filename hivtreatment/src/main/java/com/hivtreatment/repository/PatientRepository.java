package com.hivtreatment.repository;

import com.hivtreatment.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientCode(String patientCode);
    Optional<Patient> findByUserId(Long userId);
    boolean existsByPatientCode(String patientCode);

    @Query("SELECT p FROM Patient p WHERE p.firstName LIKE %:name% OR p.lastName LIKE %:name%")
    List<Patient> findByNameContaining(@Param("name") String name);

    @Query("SELECT COUNT(p) FROM Patient p")
    long countAllPatients();

    long countByDoctorId(Long doctorId);

    long countByDoctorIdAndCreatedDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);
    List<Patient> findByDoctorId(Long doctorId);
    long countByIsActiveTrue();
    @Query("SELECT p FROM Patient p WHERE p.doctor.id = :doctorId ORDER BY p.createdDate DESC")
    List<Patient> findByDoctorIdOrderByCreatedDateDesc(@Param("doctorId") Long doctorId, Pageable pageable);
}
