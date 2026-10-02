package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.JobResponse;
import com.ctrlf.api.repository.JobRepository;
import org.springframework.stereotype.Service;

@Service
public class JobService {
    private final JobRepository repository;
    public JobService(JobRepository repository) { this.repository = repository; }
    public Optional<JobResponse> findById(Long id) {
        return repository.findById(id).map(JobResponse::from);
    }
}
