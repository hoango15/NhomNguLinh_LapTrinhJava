package com.hivtreatment.service;

import com.hivtreatment.entity.Consultation;
import com.hivtreatment.repository.ConsultationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ConsultationService {

    @Autowired
    private ConsultationRepository consultationRepository;

    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }

    public Optional<Consultation> getConsultationById(Long id) {
        return consultationRepository.findById(id);
    }

    public List<Consultation> getConsultationsByPatient(Long patientId) {
        return consultationRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<Consultation> getConsultationsByDoctor(Long doctorId) {
        return consultationRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    public List<Consultation> getConsultationsByStatus(String status) {
        return consultationRepository.findByStatus(status);
    }

    public List<Consultation> getConsultationsByType(String type) {
        return consultationRepository.findByType(type);
    }

    public Consultation createConsultation(Consultation consultation) {
        return consultationRepository.save(consultation);
    }

    public Consultation updateConsultation(Consultation consultation) {
        return consultationRepository.save(consultation);
    }

    public void deleteConsultation(Long id) {
        consultationRepository.deleteById(id);
    }

    public void startConsultation(Long consultationId) {
        Optional<Consultation> consultationOpt = consultationRepository.findById(consultationId);
        if (consultationOpt.isPresent()) {
            Consultation consultation = consultationOpt.get();
            consultation.setStatus("IN_PROGRESS");
            consultation.setStartTime(LocalDateTime.now());
            consultationRepository.save(consultation);
        }
    }

    public void completeConsultation(Long consultationId, String notes) {
        Optional<Consultation> consultationOpt = consultationRepository.findById(consultationId);
        if (consultationOpt.isPresent()) {
            Consultation consultation = consultationOpt.get();
            consultation.setStatus("COMPLETED");
            consultation.setEndTime(LocalDateTime.now());
            consultation.setNotes(notes);
            consultationRepository.save(consultation);
        }
    }
    public List<Consultation> getActiveConsultationsByPatient(Long patientId) {
    return consultationRepository.findByPatientIdAndStatus(patientId, "IN_PROGRESS");
}

public List<Consultation> getPastConsultationsByPatient(Long patientId) {
    return consultationRepository.findByPatientIdAndStatus(patientId, "COMPLETED");
}


    public void cancelConsultation(Long consultationId, String reason) {
        Optional<Consultation> consultationOpt = consultationRepository.findById(consultationId);
        if (consultationOpt.isPresent()) {
            Consultation consultation = consultationOpt.get();
            consultation.setStatus("CANCELLED");
            consultation.setNotes("Cancelled: " + reason);
            consultationRepository.save(consultation);
        }
    }

    public List<Consultation> getPendingConsultations() {
        return consultationRepository.findByStatus("PENDING");
    }

    public List<Consultation> getActiveConsultations() {
        return consultationRepository.findByStatus("IN_PROGRESS");
    }
}
