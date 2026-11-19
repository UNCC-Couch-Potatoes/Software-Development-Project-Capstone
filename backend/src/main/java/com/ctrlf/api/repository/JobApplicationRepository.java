package com.ctrlf.api.repository;

import com.ctrlf.api.entity.JobApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.userId = :userId AND a.jobId = :jobId")
    long countApplication(@Param("userId") Long userId, @Param("jobId") Long jobId);

    @Query("SELECT a.jobId FROM JobApplication a WHERE a.userId = :userId")
    List<Long> findJobIdsAppliedBy(@Param("userId") Long userId);
}