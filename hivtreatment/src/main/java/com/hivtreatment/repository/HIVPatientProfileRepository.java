package com.hivtreatment.repository;

import com.hivtreatment.entity.HIVPatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HIVPatientProfileRepository extends JpaRepository<HIVPatientProfile, Long> {
    Optional<HIVPatientProfile> findByPatientId(Long patientId);
    List<HIVPatientProfile> findByHivStage(String hivStage);
    List<HIVPatientProfile> findByCurrentARVProtocol(String protocol);
    
    @Query("SELECT h FROM HIVPatientProfile h WHERE h.nextAppointmentDate = :date")
    List<HIVPatientProfile> findByNextAppointmentDate(@Param("date") LocalDate date);
    
    @Query("SELECT h FROM HIVPatientProfile h WHERE h.lastCD4TestDate < :date")
    List<HIVPatientProfile> findPatientsNeedingCD4Test(@Param("date") LocalDate date);
    
    @Query("SELECT h FROM HIVPatientProfile h WHERE h.lastViralLoadTestDate < :date")
    List<HIVPatientProfile> findPatientsNeedingViralLoadTest(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(h) FROM HIVPatientProfile h WHERE h.currentViralLoad < 50")
    long countViralSuppressedPatients();
}
