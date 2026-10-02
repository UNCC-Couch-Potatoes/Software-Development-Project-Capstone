package com.ctrlf.api.controller;

import com.ctrlf.api.dto.JamResponse;
import com.ctrlf.api.service.JamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jams")
public class JamController {
    private final JamService service;
    public JamController(JamService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<JamResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
