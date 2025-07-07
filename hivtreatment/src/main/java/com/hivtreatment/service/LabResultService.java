package com.hivtreatment.service;

import com.hivtreatment.entity.LabResult;
import com.hivtreatment.repository.LabResultRepository;
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
public class LabResultService {

    @Autowired
    private LabResultRepository labResultRepository;

    // --- LIST METHODS ---

    public List<LabResult> getAllLabResults() {
        return labResultRepository.findAll();
    }

    public Page<LabResult> getAllLabResults(Pageable pageable) {
        return labResultRepository.findAll(pageable);
    }

    public Optional<LabResult> getLabResultById(Long id) {
        return labResultRepository.findById(id);
    }

    public List<LabResult> getLabResultsByPatient(Long patientId) {
        return labResultRepository.findByPatientOrderByTestDateDesc(patientId);
    }

    public Page<LabResult> getLabResultsByPatient(Long patientId, Pageable pageable) {
        return labResultRepository.findByPatientIdOrderByTestDateDesc(patientId, pageable);
    }

    public List<LabResult> getLabResultsByTestType(String testType) {
        return labResultRepository.findByTestType(testType);
    }

    public Page<LabResult> getLabResultsByTestType(String testType, Pageable pageable) {
        return labResultRepository.findByTestType(testType, pageable);
    }

    public List<LabResult> getLabResultsByPatientAndTestType(Long patientId, String testType) {
        return labResultRepository.findByPatientAndTestType(patientId, testType);
    }

    public Page<LabResult> getLabResultsByPatientAndTestType(Long patientId, String testType, Pageable pageable) {
        return labResultRepository.findByPatientIdAndTestType(patientId, testType, pageable);
    }

    public List<LabResult> getLabResultsByDateRange(LocalDate startDate, LocalDate endDate) {
        return labResultRepository.findByDateRange(startDate, endDate);
    }

    public List<LabResult> getRecentLabResultsByPatient(Long patientId, int limit) {
        List<LabResult> results = labResultRepository.findByPatientOrderByTestDateDesc(patientId);
        return results.stream().limit(limit).toList();
    }

    // --- CREATE / UPDATE / DELETE ---

    public LabResult createLabResult(LabResult labResult) {
        return labResultRepository.save(labResult);
    }
    public LabResult saveLabResult(LabResult labResult) {
    return labResultRepository.save(labResult);
}


    public LabResult updateLabResult(LabResult labResult) {
        return labResultRepository.save(labResult);
    }

    public void deleteLabResult(Long id) {
        labResultRepository.deleteById(id);
    }
    public List<LabResult> getLabResultsByDoctor(Long doctorId) {
    return labResultRepository.findByDoctorId(doctorId);
}


    // --- FILTERED METHODS ---

    public List<LabResult> getCD4Results(Long patientId) {
        return getLabResultsByPatientAndTestType(patientId, "CD4");
    }

    public List<LabResult> getViralLoadResults(Long patientId) {
        return getLabResultsByPatientAndTestType(patientId, "VIRAL_LOAD");
    }

    public Optional<LabResult> getLatestLabResult(Long patientId, String testType) {
        List<LabResult> results = getLabResultsByPatientAndTestType(patientId, testType);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
    public List<LabResult> searchLabResults(String patientCode, String testType, String startDateStr, String endDateStr) {
    // Bạn cần parse ngày tháng nếu truyền dưới dạng String
    LocalDate startDate = (startDateStr == null || startDateStr.isBlank()) ? null : LocalDate.parse(startDateStr);
    LocalDate endDate = (endDateStr == null || endDateStr.isBlank()) ? null : LocalDate.parse(endDateStr);

    // Tùy theo repository, bạn có thể tạo query hoặc filter sau khi lấy tất cả
    List<LabResult> results = labResultRepository.findAll();

    return results.stream()
        .filter(lr -> patientCode == null || patientCode.isBlank() || (lr.getPatient() != null && lr.getPatient().getPatientCode().equalsIgnoreCase(patientCode)))
        .filter(lr -> testType == null || testType.isBlank() || testType.equalsIgnoreCase(lr.getTestType()))
        .filter(lr -> {
            if (startDate == null && endDate == null) return true;
            if (lr.getTestDate() == null) return false;
            if (startDate != null && lr.getTestDate().isBefore(startDate)) return false;
            if (endDate != null && lr.getTestDate().isAfter(endDate)) return false;
            return true;
        })
        .toList();
}


    public long countReviewedThisMonthByDoctorId(Long doctorId) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        return labResultRepository.countByDoctorIdAndReviewedDateBetween(doctorId, startOfMonth, endOfMonth);
    }
}
