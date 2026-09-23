package com.ctrlf.api.controller;

import com.ctrlf.api.dto.FollowerResponse;
import com.ctrlf.api.service.FollowerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/followers")
public class FollowerController {
    private final FollowerService service;
    public FollowerController(FollowerService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<FollowerResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
