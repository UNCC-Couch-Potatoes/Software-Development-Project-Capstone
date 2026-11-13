package com.ctrlf.api.controller;

import com.ctrlf.api.dto.BlogResponse;
import com.ctrlf.api.service.BlogService;
import com.ctrlf.api.dto.BlogRequest;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {
    private final BlogService service;

    @GetMapping
    public List<BlogResponse> findAll() { return service.findAll(); }

    public BlogController(BlogService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));

    }

    // Same session check as the jobs and resources APIs
    private Long currentUser(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("userId") instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
        return userId;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BlogResponse create(@RequestBody BlogRequest body, HttpServletRequest request) {
        return service.create(currentUser(request), body);
    }

    //Not being used at the moment so commented out for now.
    // @PutMapping("/{id}")
    // public BlogResponse update(@PathVariable Long id, @RequestBody BlogRequest body,
    //         HttpServletRequest request) {
    //     return service.update(id, currentUser(request), body);
    // }

    // @DeleteMapping("/{id}")
    // @ResponseStatus(HttpStatus.NO_CONTENT)
    // public void delete(@PathVariable Long id, HttpServletRequest request) {
    //     service.delete(id, currentUser(request));
    // }


}
