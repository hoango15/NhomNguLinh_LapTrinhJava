package com.hivtreatment.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hivtreatment.entity.LabResult;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    // --- List return ---
    List<LabResult> findByPatientId(Long patientId);
    List<LabResult> findByTestType(String testType);
    List<LabResult> findByDoctorId(Long doctorId);

    @Query("SELECT COUNT(l) FROM LabResult l WHERE l.doctor.id = :doctorId AND l.reviewedDate BETWEEN :startDate AND :endDate")
    long countByDoctorIdAndReviewedDateBetween(@Param("doctorId") Long doctorId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    @Query("SELECT l FROM LabResult l WHERE l.patient.id = :patientId AND l.testType = :testType ORDER BY l.testDate DESC")
    List<LabResult> findByPatientAndTestType(@Param("patientId") Long patientId, @Param("testType") String testType);

    @Query("SELECT l FROM LabResult l WHERE l.patient.id = :patientId ORDER BY l.testDate DESC")
    List<LabResult> findByPatientOrderByTestDateDesc(@Param("patientId") Long patientId);

    @Query("SELECT l FROM LabResult l WHERE l.testDate BETWEEN :startDate AND :endDate")
    List<LabResult> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // --- Page return (pagination) ---
    Page<LabResult> findByTestType(String testType, Pageable pageable);
    Page<LabResult> findByPatientIdOrderByTestDateDesc(Long patientId, Pageable pageable);
    Page<LabResult> findByPatientIdAndTestType(Long patientId, String testType, Pageable pageable);
}
