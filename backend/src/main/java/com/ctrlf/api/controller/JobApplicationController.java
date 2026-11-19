package com.ctrlf.api.controller;

import com.ctrlf.api.dto.JobApplicationResponse;
import com.ctrlf.api.service.JobApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {
    private final JobApplicationService service;
    public JobApplicationController(JobApplicationService service) { this.service = service; }

    private Long currentUser(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("userId") instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
        return userId;
    }

    // Ids of the jobs the logged-in user has applied to (the page uses this to label the buttons)
    @GetMapping("/mine")
    public List<Long> mine(HttpServletRequest request) {
        return service.appliedJobIds(currentUser(request));
    }

    @PostMapping("/job/{jobId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void apply(@PathVariable Long jobId, HttpServletRequest request) {
        service.apply(jobId, currentUser(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}