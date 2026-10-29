package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ResourceRepository extends
    JpaRepository<Resource, Long>,
    JpaSpecificationExecutor<Resource> {
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM ResourceUserLink WHERE ResourceId = :resourceId", nativeQuery = true)
    void deleteUserLinks(@org.springframework.data.repository.query.Param("resourceId") Long resourceId);

    java.util.List<Resource> findByOwnerUserIdOrderByResourceIdDesc(Long ownerUserId);
}
