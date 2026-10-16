package com.ctrlf.api.controller;

import com.ctrlf.api.dto.CommentThreadResponse;
import com.ctrlf.api.service.CommentThreadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comment-threads")
public class CommentThreadController {
    private final CommentThreadService service;
    public CommentThreadController(CommentThreadService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<CommentThreadResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
