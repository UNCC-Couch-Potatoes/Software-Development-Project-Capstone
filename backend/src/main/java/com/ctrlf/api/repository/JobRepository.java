package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {}
