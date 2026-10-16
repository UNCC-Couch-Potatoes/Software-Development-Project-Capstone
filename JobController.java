package com.ctrlf.api.controller;

import java.util.List;

import com.ctrlf.api.dto.JobResponse;
import com.ctrlf.api.service.JobService;
// Min for pagination
import jakarta.validation.constraints.Min;
// Pattern for sorting
import jakarta.validation.constraints.Pattern;

import org.springframework.http.ResponseEntity;
// To check if Min and Pattern are each satisfied
import org.springframework.validation.annotation.Validated;
// For GET requests
import org.springframework.web.bind.annotation.GetMapping;
// For values in a path
import org.springframework.web.bind.annotation.PathVariable;
// Defines url path
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Enables validation for Min and Pattern
@Validated
@RestController
// Sets the base url for all of these endpoints
@RequestMapping("/api/jobs")
public class JobController {
    // For accessing JobService.java (unchangeable)
    private final JobService jobService;
    
    public JobController(JobService jobService) {
       this.jobService = jobService;
    }
    
    // When GET request for /api/jobs/{id}, run findById()
    @GetMapping("/{id}")
    // Returns a job found by its id
    public ResponseEntity<JobResponse.JobItem> findById(@PathVariable Long id) {
        return ResponseEntity.of(jobService.findById(id));
    }

    // When GET request for /api/jobs, run findJobs()
    @GetMapping
    public JobResponse findJobs(
        // Get value from query params
        @RequestParam(defaultValue = "") String query,

        @RequestParam(required = false)
        List<String> tags,

        // Minimum page is 0
        @RequestParam(defaultValue = "0")
        @Min(0)
        int page,

        // How job listings are sorted
        @RequestParam(defaultValue = "featured")
        @Pattern(regexp = "featured|az|za")
        String sort
    ) {
        return jobService.findJobs(query, tags, page, sort);
    }
}