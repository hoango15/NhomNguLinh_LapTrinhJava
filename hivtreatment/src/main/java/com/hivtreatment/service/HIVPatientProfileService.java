package com.hivtreatment.service;

import com.hivtreatment.entity.HIVPatientProfile;
import com.hivtreatment.entity.LabResult;
import com.hivtreatment.repository.HIVPatientProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class HIVPatientProfileService {

    @Autowired
    private HIVPatientProfileRepository hivPatientProfileRepository;

    public List<HIVPatientProfile> getAllProfiles() {
        return hivPatientProfileRepository.findAll();
    }

    public Optional<HIVPatientProfile> getProfileById(Long id) {
        return hivPatientProfileRepository.findById(id);
    }

    public Optional<HIVPatientProfile> getProfileByPatientId(Long patientId) {
        return hivPatientProfileRepository.findByPatientId(patientId);
    }

    public HIVPatientProfile createProfile(HIVPatientProfile profile) {
        return hivPatientProfileRepository.save(profile);
    }

    public HIVPatientProfile updateProfile(HIVPatientProfile profile) {
        return hivPatientProfileRepository.save(profile);
    }

    public void deleteProfile(Long id) {
        hivPatientProfileRepository.deleteById(id);
    }

    public List<HIVPatientProfile> getProfilesByHIVStage(String hivStage) {
        return hivPatientProfileRepository.findByHivStage(hivStage);
    }

    public List<HIVPatientProfile> getProfilesByARVProtocol(String protocol) {
        return hivPatientProfileRepository.findByCurrentARVProtocol(protocol);
    }

    public List<HIVPatientProfile> getPatientsWithUpcomingAppointments(LocalDate date) {
        return hivPatientProfileRepository.findByNextAppointmentDate(date);
    }

    public List<HIVPatientProfile> getPatientsNeedingCD4Test() {
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        return hivPatientProfileRepository.findPatientsNeedingCD4Test(sixMonthsAgo);
    }

    public List<HIVPatientProfile> getPatientsNeedingViralLoadTest() {
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        return hivPatientProfileRepository.findPatientsNeedingViralLoadTest(sixMonthsAgo);
    }

    public long getViralSuppressionRate() {
        long totalPatients = hivPatientProfileRepository.count();
        long suppressedPatients = hivPatientProfileRepository.countViralSuppressedPatients();
        return totalPatients > 0 ? (suppressedPatients * 100) / totalPatients : 0;
    }

    public void updateCD4Count(Long profileId, Integer cd4Count) {
        Optional<HIVPatientProfile> profileOpt = hivPatientProfileRepository.findById(profileId);
        if (profileOpt.isPresent()) {
            HIVPatientProfile profile = profileOpt.get();
            profile.setCurrentCD4Count(cd4Count);
            profile.setLastCD4TestDate(LocalDate.now());
            hivPatientProfileRepository.save(profile);
        }
    }

    public void updateViralLoad(Long profileId, Integer viralLoad) {
        Optional<HIVPatientProfile> profileOpt = hivPatientProfileRepository.findById(profileId);
        if (profileOpt.isPresent()) {
            HIVPatientProfile profile = profileOpt.get();
            profile.setCurrentViralLoad(viralLoad);
            profile.setLastViralLoadTestDate(LocalDate.now());
            hivPatientProfileRepository.save(profile);
        }
    }

    public void updateARVProtocol(Long profileId, String protocol) {
        Optional<HIVPatientProfile> profileOpt = hivPatientProfileRepository.findById(profileId);
        if (profileOpt.isPresent()) {
            HIVPatientProfile profile = profileOpt.get();
            profile.setCurrentARVProtocol(protocol);
            hivPatientProfileRepository.save(profile);
        }
    }

   public void updateFromLabResult(LabResult labResult) {
        if (labResult.getPatient() == null || labResult.getPatient().getId() == null) {
            return;
        }

        Optional<HIVPatientProfile> profileOpt = hivPatientProfileRepository.findByPatientId(labResult.getPatient().getId());

        if (profileOpt.isPresent()) {
            HIVPatientProfile profile = profileOpt.get();

            Integer intValue = labResult.getResultValue() != null ? labResult.getResultValue().intValue() : null;

            switch (labResult.getTestType()) {
                case "CD4" -> {
                    profile.setCurrentCD4Count(intValue);
                    profile.setLastCD4TestDate(labResult.getTestDate());
                }
                case "VIRAL_LOAD" -> {
                    profile.setCurrentViralLoad(intValue);
                    profile.setLastViralLoadTestDate(labResult.getTestDate());
                }
            }

            hivPatientProfileRepository.save(profile);
        }
    } // ✅ BỔ SUNG DẤU ĐÓNG NÀY
}