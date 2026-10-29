package com.ctrlf.api.controller;

import com.ctrlf.api.dto.JamEntrantResponse;
import com.ctrlf.api.service.JamEntrantService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

// Shares the /api/jams prefix with JamController, so the page's URLs stay the same
@RestController
@RequestMapping("/api/jams")
public class JamEntrantController {
    private final JamEntrantService service;

    public JamEntrantController(JamEntrantService service) { this.service = service; }

    // Same session check as the other controllers: you must be logged in
    private Long currentUser(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("userId") instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
        return userId;
    }

    // Ids of the jams the logged-in user has joined (the page uses this to label the buttons)
    @GetMapping("/entered")
    public List<Long> entered(HttpServletRequest request) {
        return service.enteredJamIds(currentUser(request));
    }

    @PostMapping("/{id}/join")
    public JamEntrantResponse join(@PathVariable Long id, HttpServletRequest request) {
        return service.join(id, currentUser(request));
    }

    @DeleteMapping("/{id}/join")
    public JamEntrantResponse leave(@PathVariable Long id, HttpServletRequest request) {
        return service.leave(id, currentUser(request));
    }
}