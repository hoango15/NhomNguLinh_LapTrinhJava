package com.hivtreatment.repository;

import com.hivtreatment.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Consultation> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    List<Consultation> findByStatus(String status);
    List<Consultation> findByType(String type);
    List<Consultation> findByIsAnonymousTrue();
    List<Consultation> findByPatientIdAndStatus(Long patientId, String status);

}
