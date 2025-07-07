package com.hivtreatment.repository;

import com.hivtreatment.entity.ARVProtocol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ARVProtocolRepository extends JpaRepository<ARVProtocol, Long> {
    List<ARVProtocol> findByIsActiveTrue();
    List<ARVProtocol> findByTargetGroup(String targetGroup);
    List<ARVProtocol> findByIsFirstLineTrue();
    Optional<ARVProtocol> findByProtocolCode(String protocolCode);
    
    @Query("SELECT p FROM ARVProtocol p WHERE p.targetGroup = :targetGroup AND p.isActive = true")
    List<ARVProtocol> findActiveProtocolsByTargetGroup(@Param("targetGroup") String targetGroup);
    
    @Query("SELECT p FROM ARVProtocol p WHERE p.isFirstLine = true AND p.isActive = true")
    List<ARVProtocol> findFirstLineProtocols();
}
