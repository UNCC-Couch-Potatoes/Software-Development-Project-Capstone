package com.ctrlf.api.controller;

import com.ctrlf.api.dto.FollowerResponse;
import com.ctrlf.api.service.FollowerService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/followers")
public class FollowerController {
    private final FollowerService service;
    public FollowerController(FollowerService service) { this.service = service; }

    private Long currentUser(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("userId") instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
        return userId;
    }

    @GetMapping("/following")
    public List<Long> following(HttpServletRequest request) {
        return service.followingIds(currentUser(request));
    }

    @PostMapping("/follow/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void follow(@PathVariable Long userId, HttpServletRequest request) {
        service.follow(currentUser(request), userId);
    }

    @DeleteMapping("/follow/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollow(@PathVariable Long userId, HttpServletRequest request) {
        service.unfollow(currentUser(request), userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FollowerResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}