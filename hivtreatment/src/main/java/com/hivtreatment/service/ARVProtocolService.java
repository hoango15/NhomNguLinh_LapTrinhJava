package com.hivtreatment.service;

import com.hivtreatment.entity.ARVProtocol;
import com.hivtreatment.entity.Patient;
import com.hivtreatment.repository.ARVProtocolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ARVProtocolService {

    @Autowired
    private ARVProtocolRepository arvProtocolRepository;

    public List<ARVProtocol> getAllProtocols() {
        return arvProtocolRepository.findAll();
    }

    public List<ARVProtocol> getActiveProtocols() {
        return arvProtocolRepository.findByIsActiveTrue();
    }

    public Optional<ARVProtocol> getProtocolById(Long id) {
        return arvProtocolRepository.findById(id);
    }

    public Optional<ARVProtocol> getProtocolByCode(String protocolCode) {
        return arvProtocolRepository.findByProtocolCode(protocolCode);
    }

    public List<ARVProtocol> getProtocolsByTargetGroup(String targetGroup) {
        return arvProtocolRepository.findActiveProtocolsByTargetGroup(targetGroup);
    }

    public List<ARVProtocol> getFirstLineProtocols() {
        return arvProtocolRepository.findFirstLineProtocols();
    }

    public ARVProtocol createProtocol(ARVProtocol protocol) {
        return arvProtocolRepository.save(protocol);
    }

    public ARVProtocol updateProtocol(ARVProtocol protocol) {
        return arvProtocolRepository.save(protocol);
    }

    public void deleteProtocol(Long id) {
        arvProtocolRepository.deleteById(id);
    }

    public List<ARVProtocol> getRecommendedProtocols(Patient patient) {
        // Logic to recommend protocols based on patient characteristics
        String targetGroup = determineTargetGroup(patient);
        return getProtocolsByTargetGroup(targetGroup);
    }

    private String determineTargetGroup(Patient patient) {
        if (patient.getIsPregnant() != null && patient.getIsPregnant()) {
            return "PREGNANT";
        }
        
        // Calculate age
        if (patient.getDateOfBirth() != null) {
            int age = java.time.Period.between(patient.getDateOfBirth(), java.time.LocalDate.now()).getYears();
            if (age < 18) {
                return "CHILDREN";
            }
        }
        
        return "ADULT";
    }

    public void toggleProtocolStatus(Long id) {
        Optional<ARVProtocol> protocolOpt = arvProtocolRepository.findById(id);
        if (protocolOpt.isPresent()) {
            ARVProtocol protocol = protocolOpt.get();
            protocol.setIsActive(!protocol.getIsActive());
            arvProtocolRepository.save(protocol);
        }
    }
}
