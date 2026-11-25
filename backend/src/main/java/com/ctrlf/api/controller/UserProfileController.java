package com.ctrlf.api.controller;

import com.ctrlf.api.dto.UserProfileResponse;
import com.ctrlf.api.entity.UserProfile;
import com.ctrlf.api.repository.UserProfileRepository;
import com.ctrlf.api.service.UserProfileService;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-profiles")
public class UserProfileController {
    private final UserProfileService service;
    private final UserProfileRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserProfileController(UserProfileService service, UserProfileRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteAccount(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           HttpSession session) {
        UserProfile user = repository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Account not found."));
        }

        String password = body.get("password");
        if (password == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(403).body(Map.of("error", "Incorrect password."));
        }

        repository.delete(user);
        session.invalidate(); // logs the user out

        return ResponseEntity.ok(Map.of("message", "Account deleted."));
    }
}