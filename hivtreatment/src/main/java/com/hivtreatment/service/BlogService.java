package com.hivtreatment.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivtreatment.entity.BlogPost;
import com.hivtreatment.repository.BlogPostRepository;

@Service
@Transactional
public class BlogService {

    @Autowired
    private BlogPostRepository blogPostRepository;

    public Page<BlogPost> getPublishedPosts(Pageable pageable) {
        return blogPostRepository.findPublishedPosts(pageable);
    }

    public Page<BlogPost> getPublishedPostsByCategory(String category, Pageable pageable) {
        return blogPostRepository.findPublishedPostsByCategory(category, pageable);
    }

    public Page<BlogPost> searchPublishedPosts(String keyword, Pageable pageable) {
        return blogPostRepository.searchPublishedPosts(keyword, pageable);
    }

    public Optional<BlogPost> getPostBySlug(String slug) {
        return blogPostRepository.findBySlug(slug);
    }

    public List<BlogPost> getFeaturedPosts() {
        return blogPostRepository.findByIsFeaturedTrue();
    }

    public BlogPost createPost(BlogPost post) {
        return blogPostRepository.save(post);
    }

    public BlogPost updatePost(BlogPost post) {
        return blogPostRepository.save(post);
    }

    public void deletePost(Long id) {
        blogPostRepository.deleteById(id);
    }

    public void publishPost(Long id) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(id);
        if (postOpt.isPresent()) {
            BlogPost post = postOpt.get();
            post.setStatus("PUBLISHED");
            post.setPublishedAt(LocalDateTime.now());
            blogPostRepository.save(post);
        }
    }

    public void incrementViewCount(Long id) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(id);
        if (postOpt.isPresent()) {
            BlogPost post = postOpt.get();
            post.setViewCount(post.getViewCount() + 1);
            blogPostRepository.save(post);
        }
    }

    public List<BlogPost> getRecentPosts(int limit) {
        return blogPostRepository.findPublishedPosts(
            org.springframework.data.domain.PageRequest.of(0, limit)
        ).getContent();
    }
}
