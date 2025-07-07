package com.hivtreatment.repository;

import com.hivtreatment.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdAndStatus(Long patientId, String status);


    // Đơn thuốc theo bệnh nhân
    List<Prescription> findByPatientId(Long patientId);

    // Đơn thuốc theo bác sĩ
    List<Prescription> findByDoctorId(Long doctorId);

    // Phân trang đơn thuốc theo bác sĩ
    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);

    // Phân trang đơn thuốc theo bác sĩ và trạng thái
    Page<Prescription> findByDoctorIdAndStatus(Long doctorId, String status, Pageable pageable);

    // Đơn thuốc theo trạng thái
    List<Prescription> findByStatus(String status);

    // Đếm đơn thuốc ACTIVE theo bác sĩ
    long countByDoctorIdAndStatus(Long doctorId, String status);

    // Đếm đơn thuốc ACTIVE toàn hệ thống
    long countByStatus(String status);

    // Đơn thuốc ACTIVE theo bệnh nhân (JPQL)
    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.status = 'ACTIVE'")
    List<Prescription> findActiveByPatient(@Param("patientId") Long patientId);

    // Đơn thuốc trong khoảng thời gian
    @Query("SELECT p FROM Prescription p WHERE p.prescriptionDate BETWEEN :startDate AND :endDate")
    List<Prescription> findByDateRange(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    // Đếm đơn thuốc mới từ thời điểm cho trước
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.doctor.id = :doctorId AND p.createdDate >= :startDate")
    long countByDoctorIdAndCreatedDateAfter(@Param("doctorId") Long doctorId,
                                            @Param("startDate") LocalDate startDate);
                                            @Query("SELECT p FROM Prescription p " +
       "WHERE (:code IS NULL OR p.code LIKE %:code%) " +
       "AND (:patientName IS NULL OR LOWER(p.patient.fullName) LIKE LOWER(CONCAT('%', :patientName, '%'))) " +
       "AND (:doctorName IS NULL OR LOWER(p.doctor.fullName) LIKE LOWER(CONCAT('%', :doctorName, '%'))) " +
       "AND (:status IS NULL OR p.status = :status) " +
       "AND (:prescriptionDate IS NULL OR p.prescriptionDate = :prescriptionDate)")
List<Prescription> searchPrescriptions(@Param("code") String code,
                                       @Param("patientName") String patientName,
                                       @Param("doctorName") String doctorName,
                                       @Param("status") String status,
                                       @Param("prescriptionDate") LocalDate prescriptionDate);

}
