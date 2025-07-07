package com.hivtreatment.service;

import com.hivtreatment.entity.Doctor;
import com.hivtreatment.entity.User;
import com.hivtreatment.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;


import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    // --- CÁC PHƯƠNG THỨC CƠ BẢN ---

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Page<Doctor> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable);
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> getDoctorByCode(String doctorCode) {
        return doctorRepository.findByDoctorCode(doctorCode);
    }

    public Optional<Doctor> getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId);
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByIsAvailableTrue();
    }
    public Page<Doctor> getAvailableDoctors(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return doctorRepository.findByIsAvailableTrue(pageable);
}


    public List<Doctor> searchDoctorsByName(String name) {
        return doctorRepository.findByNameContaining(name);
    }

    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationContaining(specialization);
    }

    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }

    public boolean existsByDoctorCode(String doctorCode) {
        return doctorRepository.existsByDoctorCode(doctorCode);
    }

    public long getAvailableDoctorCount() {
        return doctorRepository.countAvailableDoctors();
    }

    public String generateDoctorCode() {
        long count = doctorRepository.count();
        return String.format("BS%06d", count + 1);
    }

    public void toggleDoctorAvailability(Long doctorId) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        doctorOpt.ifPresent(doctor -> {
            doctor.setIsAvailable(!doctor.getIsAvailable());
            doctorRepository.save(doctor);
        });
    }

    public long getTotalDoctorCount() {
        return doctorRepository.count();
    }

    public Optional<Doctor> getDoctorByUsername(String username) {
        return doctorRepository.findByUserUsername(username);
    }

    public Doctor createDoctorProfile(User user) {
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setFirstName(user.getFirstName());
        doctor.setLastName(user.getLastName());
        doctor.setDoctorCode(generateDoctorCode());
        doctor.setIsAvailable(true);
        return doctorRepository.save(doctor);
    }

    // --- PHƯƠNG THỨC MỚI ĐƯỢC THÊM ĐỂ KHẮC PHỤC LỖI ---

    /**
     * Lấy danh sách bác sĩ đang khả dụng (isAvailable = true)
     */
    public List<Doctor> getAllDoctorAvailability() {
        return getAvailableDoctors(); // hoặc viết riêng nếu cần
    }

    /**
     * Lấy chuyên khoa của bác sĩ theo doctorId
     */
    public List<String> getDoctorSpecializations(Long doctorId) {
    Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
    return doctorOpt.map(Doctor::getSpecialization)
            .map(spec -> Arrays.stream(spec.split(","))
                               .map(String::trim)
                               .filter(s -> !s.isBlank())
                               .collect(Collectors.toList()))
            .orElse(Collections.emptyList());
}

    /**
     * Lấy điểm trung bình đánh giá bác sĩ (nếu có hệ thống rating)
     * Hiện chưa có bảng rating nên trả về null hoặc 0.0
     */
    public Double getAverageRating(Long doctorId) {
        // TODO: Thêm logic thực tế khi có bảng đánh giá
        return null;
    }

    /**
     * Tìm bác sĩ với nhiều bộ lọc: tên, chuyên khoa, vị trí, trạng thái khả dụng
     */
 public List<Doctor> searchDoctorsWithFilters(String specialization, String experience, String rating, Boolean isAvailable) {
    final String finalSpecialization = specialization;
    final String finalExperience = experience;
    final String finalRating = rating;
    final Boolean finalIsAvailable = isAvailable;

    return doctorRepository.findAll().stream()
        .filter(d -> finalSpecialization == null || 
                     (d.getSpecialization() != null && d.getSpecialization().toLowerCase().contains(finalSpecialization.toLowerCase())))
        .filter(d -> finalExperience == null || 
                     (d.getExperienceYears() != null && d.getExperienceYears().toString().contains(finalExperience)))
        .filter(d -> finalRating == null || 
                     (getAverageRating(d.getId()) != null && 
                      String.valueOf(getAverageRating(d.getId())).contains(finalRating)))
        .filter(d -> finalIsAvailable == null || d.getIsAvailable().equals(finalIsAvailable))
        .collect(Collectors.toList());
}


    // --- CÁC PHƯƠNG THỨC TÌM KIẾM VÀ PHÂN TRANG ---

    /**
     * Tìm bác sĩ theo tên với phân trang
     */
    public Page<Doctor> searchDoctors(String name, Pageable pageable) {
        List<Doctor> filtered = doctorRepository.findAll().stream()
            .filter(d -> name == null || (d.getFirstName() + " " + d.getLastName())
                .toLowerCase().contains(name.toLowerCase()))
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > end) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    /**
     * Lấy bác sĩ theo chuyên khoa với phân trang
     */
    public Page<Doctor> getDoctorsBySpecialization(String specialization, Pageable pageable) {
        List<Doctor> filtered = doctorRepository.findAll().stream()
            .filter(d -> d.getSpecialization() != null && d.getSpecialization().toLowerCase().contains(specialization.toLowerCase()))
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > end) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    /**
     * Lấy bác sĩ theo trạng thái khả dụng với phân trang
     */
    public Page<Doctor> getDoctorsByAvailability(Boolean isAvailable, Pageable pageable) {
        List<Doctor> filtered = doctorRepository.findAll().stream()
            .filter(d -> isAvailable == null || Objects.equals(d.getIsAvailable(), isAvailable))
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        if (start > end) {
            return new PageImpl<>(List.of(), pageable, filtered.size());
        }

        return new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
    }

    /**
     * Lấy danh sách tất cả chuyên khoa của bác sĩ
     */
    public List<String> getAllSpecializations() {
        return doctorRepository.findAll().stream()
            .map(Doctor::getSpecialization)
            .filter(s -> s != null && !s.isBlank())
            .distinct()
            .collect(Collectors.toList());
    }
}
