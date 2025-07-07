package com.hivtreatment.repository;

import com.hivtreatment.entity.SymptomReport;
import com.hivtreatment.enums.ReportStatus;
import com.hivtreatment.enums.SymptomSeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SymptomReportRepository extends JpaRepository<SymptomReport, Long> {
    
    // Find by patient
    Page<SymptomReport> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
    List<SymptomReport> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    // Find by doctor
    Page<SymptomReport> findByReviewedByDoctorIdOrderByCreatedAtDesc(Long doctorId, Pageable pageable);
    
    // Find by status
    Page<SymptomReport> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);
    
    // Find by severity
    Page<SymptomReport> findBySeverityOrderByCreatedAtDesc(SymptomSeverity severity, Pageable pageable);
    
    // Find urgent reports
    @Query("SELECT sr FROM SymptomReport sr WHERE sr.severity IN ('SEVERE', 'CRITICAL') AND sr.status = 'PENDING' ORDER BY sr.createdAt DESC")
    List<SymptomReport> findUrgentReports();
    
    // Find pending reports
    List<SymptomReport> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    
    // Find reports by patient and doctor
    @Query("SELECT sr FROM SymptomReport sr WHERE sr.patient.currentDoctor.id = :doctorId ORDER BY sr.createdAt DESC")
    Page<SymptomReport> findByPatientDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Long doctorId, Pageable pageable);
    
    // Count reports by status
    long countByStatus(ReportStatus status);
    
    // Count urgent reports
    @Query("SELECT COUNT(sr) FROM SymptomReport sr WHERE sr.severity IN ('SEVERE', 'CRITICAL') AND sr.status = 'PENDING'")
    long countUrgentReports();
    
    // Find reports created in date range
    @Query("SELECT sr FROM SymptomReport sr WHERE sr.createdAt BETWEEN :startDate AND :endDate ORDER BY sr.createdAt DESC")
    List<SymptomReport> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Search reports
    @Query("SELECT sr FROM SymptomReport sr WHERE " +
           "LOWER(sr.reportTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sr.symptoms) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sr.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sr.patient.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sr.patient.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY sr.createdAt DESC")
    Page<SymptomReport> searchReports(@Param("keyword") String keyword, Pageable pageable);
    
    // Find reports requiring follow-up
    @Query("SELECT sr FROM SymptomReport sr WHERE sr.followUpRequired = true AND sr.followUpDate <= :date ORDER BY sr.followUpDate ASC")
    List<SymptomReport> findReportsRequiringFollowUp(@Param("date") LocalDateTime date);
}
