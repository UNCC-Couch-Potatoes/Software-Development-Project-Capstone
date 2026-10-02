package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.JobApplicationResponse;
import com.ctrlf.api.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;

@Service
public class JobApplicationService {
    private final JobApplicationRepository repository;
    public JobApplicationService(JobApplicationRepository repository) { this.repository = repository; }
    public Optional<JobApplicationResponse> findById(Long id) {
        return repository.findById(id).map(JobApplicationResponse::from);
    }
}
