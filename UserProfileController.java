package com.ctrlf.api.controller;

import com.ctrlf.api.dto.UserProfileResponse;
import com.ctrlf.api.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-profiles")
public class UserProfileController {
    private final UserProfileService service;
    public UserProfileController(UserProfileService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
