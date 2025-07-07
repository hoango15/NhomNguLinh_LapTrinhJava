package com.hivtreatment.service;

import com.hivtreatment.entity.Prescription;
import com.hivtreatment.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    public long countActiveByDoctorId(Long doctorId) {
        return prescriptionRepository.countByDoctorIdAndStatus(doctorId, "ACTIVE");
    }

    public long countActive() {
        return prescriptionRepository.countByStatus("ACTIVE");
    }

    public long countAll() {
        return prescriptionRepository.count();
    }

    public long countNewThisWeekByDoctorId(Long doctorId) {
        LocalDate startOfWeek = LocalDate.now().with(java.time.DayOfWeek.MONDAY);
        return prescriptionRepository.countByDoctorIdAndCreatedDateAfter(doctorId, startOfWeek);
    }

    public long countThisMonthByDoctorId(Long doctorId) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        return prescriptionRepository.countByDoctorIdAndCreatedDateAfter(doctorId, startOfMonth);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Optional<Prescription> getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }

    public List<Prescription> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    public List<Prescription> getPrescriptionsByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    public Page<Prescription> getPrescriptionsByDoctor(Long doctorId, Pageable pageable) {
        return prescriptionRepository.findByDoctorId(doctorId, pageable);
    }

    public Page<Prescription> getPrescriptionsByDoctorAndStatus(Long doctorId, String status, Pageable pageable) {
        return prescriptionRepository.findByDoctorIdAndStatus(doctorId, status, pageable);
    }

    public List<Prescription> getActivePrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findActiveByPatient(patientId);
    }

    public List<Prescription> getPrescriptionsByStatus(String status) {
        return prescriptionRepository.findByStatus(status);
    }

    public List<Prescription> getPrescriptionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return prescriptionRepository.findByDateRange(startDate, endDate);
    }

    public Prescription createPrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    public Prescription updatePrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    public void deletePrescription(Long id) {
        prescriptionRepository.deleteById(id);
    }
    public List<Prescription> getPastPrescriptionsByPatient(Long patientId) {
    return prescriptionRepository.findByPatientIdAndStatus(patientId, "COMPLETED");
}
public List<Prescription> searchPrescriptions(String patientCode,
                                              String prescriptionCode,
                                              String status,
                                              LocalDate dateFrom,
                                              LocalDate dateTo) {
    return prescriptionRepository.searchPrescriptions(prescriptionCode, patientCode, null, status, dateFrom);
}



    public void completePrescription(Long prescriptionId) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(prescriptionId);
        if (prescriptionOpt.isPresent()) {
            Prescription prescription = prescriptionOpt.get();
            prescription.setStatus("COMPLETED");
            prescriptionRepository.save(prescription);
        }
    }

    public void cancelPrescription(Long prescriptionId) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(prescriptionId);
        if (prescriptionOpt.isPresent()) {
            Prescription prescription = prescriptionOpt.get();
            prescription.setStatus("CANCELLED");
            prescriptionRepository.save(prescription);
        }
    }

    public String generatePrescriptionCode() {
        long count = prescriptionRepository.count();
        return String.format("DT%08d", count + 1);
    }
}
