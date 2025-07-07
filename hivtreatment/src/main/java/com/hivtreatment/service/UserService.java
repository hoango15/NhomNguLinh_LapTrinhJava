package com.hivtreatment.service;

import com.hivtreatment.entity.User;
import com.hivtreatment.enums.UserRole;
import com.hivtreatment.entity.UserActivity;
import com.hivtreatment.repository.UserActivityRepository;
import com.hivtreatment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public Page<User> getUsersByRole(UserRole role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }

    public Page<User> getUsersByActiveStatus(Boolean isActive, Pageable pageable) {
        return userRepository.findByIsActive(isActive, pageable);
    }

    public Page<User> searchUsers(String keyword, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword, pageable);
    }

    public List<User> getRecentUsers(int count) {
        Pageable pageable = PageRequest.of(0, count);
        return userRepository.findRecentUsers(pageable);
    }

    public long countAll() {
        return userRepository.count();
    }

    public long countNewThisMonth() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();
        return userRepository.countByCreatedDateBetween(start, end);
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void changePassword(Long userId, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        }
    }

    @Autowired
    private UserActivityRepository userActivityRepository;

    public List<UserActivity> getUserActivities(Long userId, int limit) {
        return userActivityRepository.findRecentActivitiesByUserId(userId, PageRequest.of(0, limit));
    }

    public void toggleUserStatus(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(!user.getIsActive());
            userRepository.save(user);
        }
    }

    @Autowired
    private DoctorService doctorService;

    public List<User> getUsersWithoutDoctorProfile() {
        List<User> doctorUsers = userRepository.findByRole(UserRole.DOCTOR);
        List<Long> existingDoctorUserIds = doctorService.getAllDoctors().stream()
                .map(d -> d.getUser().getId())
                .toList();

        return doctorUsers.stream()
                .filter(user -> !existingDoctorUserIds.contains(user.getId()))
                .toList();
    }
}
