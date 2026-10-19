package com.ctrlf.api.controller;

import com.ctrlf.api.dto.JobRequest;
import com.ctrlf.api.dto.JobResponse;
import com.ctrlf.api.service.JobService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService service;
    public JobController(JobService service) { this.service = service; }

    // Same session check the resources API uses: you must be logged in to change jobs
    private void requireLogin(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("userId") instanceof Long)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
    }

    @GetMapping
    public List<JobResponse> findAll() { return service.findAll(); }
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JobResponse create(@RequestBody JobRequest body, HttpServletRequest request) {
        requireLogin(request);
        return service.create(body);
    }

    @PutMapping("/{id}")
    public JobResponse update(@PathVariable Long id, @RequestBody JobRequest body,
            HttpServletRequest request) {
        requireLogin(request);
        return service.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        requireLogin(request);
        service.delete(id);
    }
}