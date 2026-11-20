package com.ctrlf.api.service;

import com.ctrlf.api.dto.JobApplicationResponse;
import com.ctrlf.api.entity.Job;
import com.ctrlf.api.entity.JobApplication;
import com.ctrlf.api.repository.JobApplicationRepository;
import com.ctrlf.api.repository.JobRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JobApplicationService {
    private final JobApplicationRepository repository;
    private final JobRepository jobs;
    private final NotificationService notifications;

    public JobApplicationService(JobApplicationRepository repository, JobRepository jobs,
            NotificationService notifications) {
        this.repository = repository;
        this.jobs = jobs;
        this.notifications = notifications;
    }

    public Optional<JobApplicationResponse> findById(Long id) {
        return repository.findById(id).map(JobApplicationResponse::from);
    }

    // Ids of the jobs the logged-in user has applied to
    public List<Long> appliedJobIds(Long userId) {
        return repository.findJobIdsAppliedBy(userId);
    }

    public void apply(Long jobId, Long userId) {
        Job job = jobs.findById(jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));
        if (Objects.equals(job.getOwnerUserId(), userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot apply to your own job.");
        }
        if (repository.countApplication(userId, jobId) > 0) return;
        try {
            // The page has no resume upload yet, so the required resume column gets an empty value
            repository.save(new JobApplication(userId, jobId, new byte[0]));
        } catch (DataIntegrityViolationException ex) {
            if (repository.countApplication(userId, jobId) == 0) throw ex;
            return;
        }
        notifications.jobApplied(job, userId);
    }
}