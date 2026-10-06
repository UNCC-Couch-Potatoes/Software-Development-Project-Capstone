package com.ctrlf.api.controller;

import com.ctrlf.api.dto.DelimitedValues;
import com.ctrlf.api.dto.LoginRequest;
import com.ctrlf.api.dto.RegisterRequest;
import com.ctrlf.api.dto.UpdateProfileRequest;
import com.ctrlf.api.dto.UserProfileResponse;
import com.ctrlf.api.entity.UserProfile;
import com.ctrlf.api.repository.UserProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ctrlf.api.dto.DelimitedValues;
import com.ctrlf.api.dto.UpdateProfileRequest;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String SESSION_KEY = "userId";

    private final UserProfileRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserProfileRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req, HttpServletRequest request) {
        if (req == null || blank(req.username()) || blank(req.email()) || blank(req.password())
                || blank(req.firstName()) || blank(req.lastName())) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }
        String username = req.username().trim();
        String email = req.email().trim();
        String firstName = req.firstName().trim();
        String lastName = req.lastName().trim();

        if (username.length() > 30 || firstName.length() > 30 || lastName.length() > 30
                || email.length() > 100) {
            return ResponseEntity.badRequest().body("One of the fields is too long.");
        }
        if (req.password().length() < 8 || req.password().length() > 72) {
            return ResponseEntity.badRequest().body("Password must be 8 to 72 characters.");
        }
        if (repo.existsByUsernameIgnoreCase(username)) {
            return ResponseEntity.status(409).body("That username is already taken.");
        }
        if (repo.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(409).body("That email is already registered.");
        }

        UserProfile saved = repo.save(new UserProfile(
                username, email, encoder.encode(req.password()), firstName, lastName));
        startSession(request, saved.getUserId());
        return ResponseEntity.status(201).body(UserProfileResponse.from(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest request) {
        if (req == null || blank(req.usernameOrEmail()) || blank(req.password())) {
            return ResponseEntity.badRequest().body("Enter your username/email and password.");
        }
        String id = req.usernameOrEmail().trim();
        Optional<UserProfile> found = repo.findByUsernameIgnoreCaseOrEmailIgnoreCase(id, id);

        if (found.isEmpty() || !encoder.matches(req.password(), found.get().getPassword())) {
            return ResponseEntity.status(401).body("Incorrect username/email or password.");
        }
        startSession(request, found.get().getUserId());
        return ResponseEntity.ok(UserProfileResponse.from(found.get()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute(SESSION_KEY) == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) session.getAttribute(SESSION_KEY);
        Optional<UserProfile> user = repo.findById(userId);
        if (user.isEmpty()) {
            session.invalidate();
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(UserProfileResponse.from(user.get()));
    }
        @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody UpdateProfileRequest req, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute(SESSION_KEY) == null) {
            return ResponseEntity.status(401).body("Please log in again.");
        }
        Long userId = (Long) session.getAttribute(SESSION_KEY);
        Optional<UserProfile> found = repo.findById(userId);
        if (found.isEmpty()) {
            session.invalidate();
            return ResponseEntity.status(401).body("Please log in again.");
        }

        if (req == null || blank(req.firstName()) || blank(req.lastName())) {
            return ResponseEntity.badRequest().body("First and last name are required.");
        }
        String firstName = req.firstName().trim();
        String lastName = req.lastName().trim();
        String bio = req.bio() == null ? "" : req.bio().trim();
        String skills = DelimitedValues.join(req.skills());
        String interests = DelimitedValues.join(req.interests());

        if (firstName.length() > 30 || lastName.length() > 30) {
            return ResponseEntity.badRequest().body("Names must be 30 characters or fewer.");
        }
        if (bio.length() > 1000) {
            return ResponseEntity.badRequest().body("Bio must be 1000 characters or fewer.");
        }
        if (skills.length() > 1000 || interests.length() > 1000) {
            return ResponseEntity.badRequest().body("Too many skills or interests. Remove a few and try again.");
        }

        UserProfile user = found.get();
        user.updateProfile(firstName, lastName, bio, skills, interests);
        UserProfile saved = repo.save(user);
        return ResponseEntity.ok(UserProfileResponse.from(saved));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().build();
    }

    private void startSession(HttpServletRequest request, Long userId) {
        HttpSession old = request.getSession(false);
        if (old != null) old.invalidate();
        request.getSession(true).setAttribute(SESSION_KEY, userId);
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }
}