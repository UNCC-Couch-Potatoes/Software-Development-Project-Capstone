package com.ctrlf.api.controller;

import com.ctrlf.api.dto.LoginRequest;
import com.ctrlf.api.dto.LoginResponse;
import com.ctrlf.api.dto.RegisterRequest;
import com.ctrlf.api.entity.UserProfile;
import com.ctrlf.api.repository.UserProfileRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserProfileRepository repository;

    public AuthController(UserProfileRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        UserProfile user = repository.findByUsername(request.usernameOrEmail())
            .or(() -> repository.findByEmail(request.usernameOrEmail()))
            .orElse(null);

        if (user == null || !user.getPassword().equals(request.password())) {
            return ResponseEntity.status(401)
                .body("Incorrect username/email or password.");
        }

        LoginResponse response = new LoginResponse(
            user.getUserId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (repository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest()
                .body("Username is already taken.");
        }

        if (repository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest()
                .body("Email is already registered.");
        }

        UserProfile user = new UserProfile(
            request.username(),
            request.email(),
            request.password(),
            request.firstName(),
            request.lastName(),
            "",
            "",
            "",
            LocalDate.now()
        );

        UserProfile savedUser = repository.save(user);

        return ResponseEntity.ok(
            new LoginResponse(
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName()
            )
        );
    }
}