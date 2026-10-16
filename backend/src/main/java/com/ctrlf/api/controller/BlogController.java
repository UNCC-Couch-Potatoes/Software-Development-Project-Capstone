package com.ctrlf.api.controller;

import com.ctrlf.api.dto.BlogResponse;
import com.ctrlf.api.service.BlogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {
    private final BlogService service;
    public BlogController(BlogService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
