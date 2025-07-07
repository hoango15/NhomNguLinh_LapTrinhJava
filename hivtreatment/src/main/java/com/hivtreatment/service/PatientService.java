package com.hivtreatment.service;

import com.hivtreatment.dto.PatientSearchParams;
import com.hivtreatment.entity.Patient;
import com.hivtreatment.entity.User;
import com.hivtreatment.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public long countByDoctorId(Long doctorId) {
        return patientRepository.countByDoctorId(doctorId);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

     public Optional<Patient> getPatientByCode(String patientCode) {
        return patientRepository.findByPatientCode(patientCode);
    }

    public Optional<Patient> getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId);
    }

    public List<Patient> searchPatientsByName(String name) {
        return patientRepository.findByNameContaining(name);
    }

    public Patient createPatientProfile(User user) {
        Patient patient = new Patient();
        patient.setUser(user);
        patient.setFirstName(user.getFirstName());
        patient.setLastName(user.getLastName());
        patient.setPatientCode(generatePatientCode());
        patient.setIsActive(true);
        return patientRepository.save(patient);
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }

    public boolean existsByPatientCode(String patientCode) {
        return patientRepository.existsByPatientCode(patientCode);
    }

    public long getTotalPatientCount() {
        return patientRepository.countAllPatients();
    }

    public long getActivePatientCount() {
        return patientRepository.countByIsActiveTrue();
    }

    public String generatePatientCode() {
        long count = patientRepository.count();
        return String.format("BN%06d", count + 1);
    }

    public Page<Patient> getPatientsByDoctor(Long doctorId, Pageable pageable) {
        List<Patient> filtered = patientRepository.findByDoctorId(doctorId);

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > end) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        List<Patient> pageContent = filtered.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public Page<Patient> searchPatientsByDoctorAndKeyword(Long doctorId, String keyword, Pageable pageable) {
        List<Patient> filtered = patientRepository.findByDoctorId(doctorId).stream()
            .filter(p -> {
                String fullName = (p.getFirstName() + " " + p.getLastName()).toLowerCase();
                return keyword == null || fullName.contains(keyword.toLowerCase());
            })
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > end) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        List<Patient> pageContent = filtered.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public long countNewThisMonthByDoctorId(Long doctorId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        return patientRepository.countByDoctorIdAndCreatedDateBetween(doctorId, startOfMonth, endOfMonth);
    }

    public List<Patient> findRecentByDoctorId(Long doctorId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return patientRepository.findByDoctorIdOrderByCreatedDateDesc(doctorId, pageable);
    }

    public Page<Patient> searchPatients(PatientSearchParams params, Pageable pageable) {
        List<Patient> filtered = patientRepository.findAll().stream()
            .filter(p -> params.getName() == null || (p.getFirstName() + " " + p.getLastName())
                .toLowerCase().contains(params.getName().toLowerCase()))
            .filter(p -> params.getGender() == null ||
                (p.getGender() != null && p.getGender().name().equalsIgnoreCase(params.getGender())))
            .filter(p -> params.getAge() == null ||
                (p.getDateOfBirth() != null && calculateAge(p.getDateOfBirth()) == params.getAge()))
            .filter(p -> params.getPhone() == null ||
                (p.getPhone() != null && p.getPhone().contains(params.getPhone())))
            .filter(p -> params.getTreatmentStatus() == null ||
                (p.getTreatmentStatus() != null && p.getTreatmentStatus().equalsIgnoreCase(params.getTreatmentStatus())))
            .filter(p -> params.getDoctorId() == null ||
                (p.getDoctor() != null && p.getDoctor().getId().equals(params.getDoctorId())))
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > end) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        List<Patient> pageContent = filtered.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    private int calculateAge(LocalDate dob) {
        return Period.between(dob, LocalDate.now()).getYears();
    }
}
s