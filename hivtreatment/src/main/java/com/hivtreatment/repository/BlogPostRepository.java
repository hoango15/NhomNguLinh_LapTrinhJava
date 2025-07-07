package com.hivtreatment.repository;

import com.hivtreatment.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Optional<BlogPost> findBySlug(String slug);
    List<BlogPost> findByStatus(String status);
    List<BlogPost> findByCategory(String category);
    List<BlogPost> findByIsFeaturedTrue();
    
    @Query("SELECT b FROM BlogPost b WHERE b.status = 'PUBLISHED' ORDER BY b.publishedAt DESC")
    Page<BlogPost> findPublishedPosts(Pageable pageable);
    
    @Query("SELECT b FROM BlogPost b WHERE b.status = 'PUBLISHED' AND b.category = :category ORDER BY b.publishedAt DESC")
    Page<BlogPost> findPublishedPostsByCategory(@Param("category") String category, Pageable pageable);
    
    @Query("SELECT b FROM BlogPost b WHERE b.status = 'PUBLISHED' AND (b.title LIKE %:keyword% OR b.content LIKE %:keyword%)")
    Page<BlogPost> searchPublishedPosts(@Param("keyword") String keyword, Pageable pageable);
}
