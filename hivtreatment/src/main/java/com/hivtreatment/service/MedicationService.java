package com.hivtreatment.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivtreatment.entity.Medication;
import com.hivtreatment.repository.MedicationRepository;

@Service
@Transactional
public class MedicationService {

    @Autowired
    private MedicationRepository medicationRepository;

    public List<Medication> getAllMedications() {
        return medicationRepository.findAll();
    }

    public List<Medication> getActiveMedications() {
        return medicationRepository.findByIsActiveTrue();
    }

    public Optional<Medication> getMedicationById(Long id) {
        return medicationRepository.findById(id);
    }

    public List<Medication> getMedicationsByCategory(String category) {
        return medicationRepository.findByCategory(category);
    }

    public List<Medication> searchMedications(String keyword) {
        return medicationRepository.searchByKeyword(keyword);
    }

    public Medication createMedication(Medication medication) {
        return medicationRepository.save(medication);
    }

    public Medication updateMedication(Medication medication) {
        return medicationRepository.save(medication);
    }

    public void deleteMedication(Long id) {
        medicationRepository.deleteById(id);
    }

    public void toggleMedicationStatus(Long id) {
        Optional<Medication> medicationOpt = medicationRepository.findById(id);
        if (medicationOpt.isPresent()) {
            Medication medication = medicationOpt.get();
            medication.setIsActive(!medication.getIsActive());
            medicationRepository.save(medication);
        }
    }

    public List<Medication> getARVMedications() {
        return medicationRepository.findByCategory("ARV");
    }
    public List<Medication> getAllActiveMedications() {
    return medicationRepository.findByIsActiveTrue();
}

}
