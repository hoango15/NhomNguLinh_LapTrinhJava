package com.hivtreatment.service;

import com.hivtreatment.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public long getUrgentTaskCount(Long doctorId) {
        return taskRepository.countByDoctorIdAndUrgentTrue(doctorId);
    }
}
