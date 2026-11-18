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
    private final NotificationService notifications;
    public JobService(JobRepository repository, NotificationService notifications) {
        this.repository = repository;
        this.notifications = notifications;
    }
    public Optional<JobResponse> findById(Long id) {
        return repository.findById(id).map(JobResponse::from);
    }
    public List<JobResponse> findAll() {
        return repository.findAll().stream().map(JobResponse::from).toList();
    }

    @Transactional
    public JobResponse create(Long userId, JobRequest req) {
        Job job = new Job(userId, "", "", "", "");
        apply(job, req);
        Job saved = repository.save(job);
        notifications.jobPosted(saved);
        return JobResponse.from(saved);
    }

    @Transactional
    public JobResponse update(Long id, Long userId, JobRequest req) {
        Job job = findOwned(id, userId);
        apply(job, req);
        Job saved = repository.save(job);
        notifications.jobUpdated(saved);
        return JobResponse.from(saved);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Job job = findOwned(id, userId);
        try {
            repository.delete(job);
            repository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This job has applications and cannot be deleted.");
        }
    }

    private Job findOwned(Long id, Long userId) {
        Job job = repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));
        if (!userId.equals(job.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the person who posted this job can change it.");
        }
        return job;
    }

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
        if (!link.isEmpty() && !link.matches("(?i)^https?://\\S+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The link must start with http:// or https://.");
        }
        job.update(title, description, tags, link);
    }
}