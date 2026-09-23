package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.JamEntrantResponse;
import com.ctrlf.api.repository.JamEntrantRepository;
import org.springframework.stereotype.Service;

@Service
public class JamEntrantService {
    private final JamEntrantRepository repository;
    public JamEntrantService(JamEntrantRepository repository) { this.repository = repository; }
    public Optional<JamEntrantResponse> findById(Long id) {
        return repository.findById(id).map(JamEntrantResponse::from);
    }
}
