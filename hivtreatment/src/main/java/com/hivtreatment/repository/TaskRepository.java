package com.hivtreatment.repository;

import com.hivtreatment.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    long countByDoctorIdAndUrgentTrue(Long doctorId);
}
