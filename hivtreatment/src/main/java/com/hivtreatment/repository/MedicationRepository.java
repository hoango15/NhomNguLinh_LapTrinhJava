package com.hivtreatment.repository;

import com.hivtreatment.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByIsActiveTrue();
    List<Medication> findByCategory(String category);
    List<Medication> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT m FROM Medication m WHERE m.name LIKE %:keyword% OR m.genericName LIKE %:keyword%")
    List<Medication> searchByKeyword(@Param("keyword") String keyword);
}
