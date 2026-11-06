package com.ctrlf.api.controller;

import com.ctrlf.api.dto.CollabRequest;
import com.ctrlf.api.dto.CollabResponse;
import com.ctrlf.api.service.CollabService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/collabs")
public class CollabController {
    private final CollabService service;

    public CollabController(CollabService service) { this.service = service; }

    private Long currentUser(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("userId") instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
        return userId;
    }

    @GetMapping
    public List<CollabResponse> findByType(@RequestParam String type) { return service.findByType(type); }

    @GetMapping("/{id}")
    public ResponseEntity<CollabResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CollabResponse create(@RequestBody CollabRequest body, HttpServletRequest request) {
        return service.create(currentUser(request), body);
    }

    @PutMapping("/{id}")
    public CollabResponse update(@PathVariable Long id, @RequestBody CollabRequest body,
            HttpServletRequest request) {
        return service.update(id, currentUser(request), body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpServletRequest request) {
        service.delete(id, currentUser(request));
    }
}