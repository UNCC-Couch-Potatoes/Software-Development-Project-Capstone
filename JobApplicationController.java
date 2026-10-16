package com.ctrlf.api.controller;

import com.ctrlf.api.dto.JobApplicationResponse;
import com.ctrlf.api.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {
    private final JobApplicationService service;
    public JobApplicationController(JobApplicationService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
