package com.ctrlf.api.controller;

import com.ctrlf.api.dto.CommentResponse;
import com.ctrlf.api.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentService service;
    public CommentController(CommentService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
