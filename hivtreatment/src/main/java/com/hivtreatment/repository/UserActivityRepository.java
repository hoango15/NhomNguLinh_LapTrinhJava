package com.hivtreatment.repository;

import com.hivtreatment.entity.UserActivity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    
    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId ORDER BY ua.timestamp DESC")
    List<UserActivity> findRecentActivitiesByUserId(Long userId, org.springframework.data.domain.Pageable pageable);
}
