package com.hivtreatment.service;

import com.hivtreatment.entity.EducationalResource;
import com.hivtreatment.repository.EducationalResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EducationalResourceService {

    @Autowired
    private EducationalResourceRepository educationalResourceRepository;

    public List<EducationalResource> getAllResources() {
        return educationalResourceRepository.findAll();
    }

    public List<EducationalResource> getActiveResources() {
        return educationalResourceRepository.findByIsActiveTrue();
    }

    public Optional<EducationalResource> getResourceById(Long id) {
        return educationalResourceRepository.findById(id);
    }

    public List<EducationalResource> getResourcesByCategory(String category) {
        return educationalResourceRepository.findActiveByCategoryOrderByCreatedAtDesc(category);
    }

    public List<EducationalResource> getResourcesByType(String type) {
        return educationalResourceRepository.findByType(type);
    }

    public List<EducationalResource> getFeaturedResources() {
        return educationalResourceRepository.findByIsFeaturedTrue();
    }

    public List<EducationalResource> searchResources(String keyword) {
        return educationalResourceRepository.searchActiveResources(keyword);
    }

    public EducationalResource createResource(EducationalResource resource) {
        return educationalResourceRepository.save(resource);
    }

    public EducationalResource updateResource(EducationalResource resource) {
        return educationalResourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        educationalResourceRepository.deleteById(id);
    }

    public void incrementViewCount(Long id) {
        Optional<EducationalResource> resourceOpt = educationalResourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            EducationalResource resource = resourceOpt.get();
            resource.setViewCount(resource.getViewCount() + 1);
            educationalResourceRepository.save(resource);
        }
    }

    public void incrementDownloadCount(Long id) {
        Optional<EducationalResource> resourceOpt = educationalResourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            EducationalResource resource = resourceOpt.get();
            resource.setDownloadCount(resource.getDownloadCount() + 1);
            educationalResourceRepository.save(resource);
        }
    }

    public List<EducationalResource> getAntiStigmaResources() {
        return getResourcesByCategory("STIGMA");
    }

    public List<EducationalResource> getPreventionResources() {
        return getResourcesByCategory("PREVENTION");
    }

    public List<EducationalResource> getTreatmentResources() {
        return getResourcesByCategory("TREATMENT");
    }

    public List<EducationalResource> getNutritionResources() {
        return getResourcesByCategory("NUTRITION");
    }
}
