package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Resource;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ResourceRepository extends
    JpaRepository<Resource, Long>,
    JpaSpecificationExecutor<Resource> {
}
