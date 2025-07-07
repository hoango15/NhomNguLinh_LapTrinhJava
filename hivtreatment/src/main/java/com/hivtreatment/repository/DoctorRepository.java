package com.hivtreatment.repository;

import com.hivtreatment.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByDoctorCode(String doctorCode);
    Optional<Doctor> findByUserId(Long userId);
    boolean existsByDoctorCode(String doctorCode);
    Page<Doctor> findByIsAvailableTrue(Pageable pageable);
    List<Doctor> findByIsAvailableTrue();
    List<Doctor> findBySpecializationContaining(String specialization);
    Optional<Doctor> findByUserUsername(String username);
    
    @Query("SELECT d FROM Doctor d WHERE d.firstName LIKE %:name% OR d.lastName LIKE %:name%")
    List<Doctor> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT COUNT(d) FROM Doctor d WHERE d.isAvailable = true")
    long countAvailableDoctors();
}
