package com.hivtreatment.repository;

import com.hivtreatment.entity.EducationalResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationalResourceRepository extends JpaRepository<EducationalResource, Long> {
    List<EducationalResource> findByIsActiveTrue();
    List<EducationalResource> findByCategory(String category);
    List<EducationalResource> findByType(String type);
    List<EducationalResource> findByIsFeaturedTrue();
    
    @Query("SELECT e FROM EducationalResource e WHERE e.isActive = true AND e.category = :category")
    List<EducationalResource> findActiveByCategoryOrderByCreatedAtDesc(@Param("category") String category);
    
    @Query("SELECT e FROM EducationalResource e WHERE e.isActive = true AND (e.title LIKE %:keyword% OR e.description LIKE %:keyword%)")
    List<EducationalResource> searchActiveResources(@Param("keyword") String keyword);
}
