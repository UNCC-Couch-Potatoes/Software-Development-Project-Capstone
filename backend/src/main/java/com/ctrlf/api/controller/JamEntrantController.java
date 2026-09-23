package com.ctrlf.api.controller;

import com.ctrlf.api.dto.JamEntrantResponse;
import com.ctrlf.api.service.JamEntrantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jam-entrants")
public class JamEntrantController {
    private final JamEntrantService service;
    public JamEntrantController(JamEntrantService service) { this.service = service; }
    @GetMapping("/{id}")
    public ResponseEntity<JamEntrantResponse> findById(@PathVariable Long id) {
        return ResponseEntity.of(service.findById(id));
    }
}
