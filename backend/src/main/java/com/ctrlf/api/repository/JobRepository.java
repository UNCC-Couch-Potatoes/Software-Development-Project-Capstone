package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Job;
// For SQL operations
import org.springframework.data.jpa.repository.JpaRepository;
// For filtering/searching
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {}