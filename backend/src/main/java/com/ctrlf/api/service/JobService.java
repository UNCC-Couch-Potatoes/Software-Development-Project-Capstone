package com.ctrlf.api.service;

import java.util.List;
import java.util.Optional;
import com.ctrlf.api.dto.DelimitedValues;
import com.ctrlf.api.dto.JobRequest;
import com.ctrlf.api.dto.JobResponse;
import com.ctrlf.api.entity.Job;
import com.ctrlf.api.repository.JobRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JobService {
    private final JobRepository repository;
    public JobService(JobRepository repository) { this.repository = repository; }
    public Optional<JobResponse> findById(Long id) {
        return repository.findById(id).map(JobResponse::from);
    }
    public List<JobResponse> findAll() {
        return repository.findAll().stream().map(JobResponse::from).toList();
    }

    @Transactional
    public JobResponse create(JobRequest req) {
        Job job = new Job("", "", "", "");
        apply(job, req);
        return JobResponse.from(repository.save(job));
    }

    @Transactional
    public JobResponse update(Long id, JobRequest req) {
        Job job = repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));
        apply(job, req);
        return JobResponse.from(repository.save(job));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found.");
        }
        try {
            repository.deleteById(id);
            repository.flush();
        } catch (DataIntegrityViolationException e) {
            // JobApplication rows point at this job, so the database won't let it go
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This job has applications and cannot be deleted.");
        }
    }

    // Validates the request against the Jobs table limits, then copies it onto the entity
    private void apply(Job job, JobRequest req) {
        if (req == null || req.jobTitle() == null || req.jobTitle().isBlank()
                || req.jobDescription() == null || req.jobDescription().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title and description are required.");
        }
        String title = req.jobTitle().trim();
        String description = req.jobDescription().trim();
        String tags = DelimitedValues.join(req.jobTags());
        String link = req.siteLink() == null ? "" : req.siteLink().trim();

        if (title.length() > 50 || tags.length() > 1000 || link.length() > 2048
                || description.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 65535) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title or content exceeds the database limit.");
        }
        // The link is rendered as an href, so only allow web links (blocks javascript: URLs)
        if (!link.isEmpty() && !link.matches("(?i)^https?://\\S+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The link must start with http:// or https://.");
        }
        job.update(title, description, tags, link);
    }
}