package com.ctrlf.api.controller;

import com.ctrlf.api.dto.JobResponse;
import com.ctrlf.api.service.JobService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService service;
    public JobController(JobService service) { this.service = service; }
    @GetMapping
    public List<JobResponse> findAll() {
        return service.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}