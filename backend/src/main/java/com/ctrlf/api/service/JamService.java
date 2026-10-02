package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.JamResponse;
import com.ctrlf.api.repository.JamRepository;
import org.springframework.stereotype.Service;

@Service
public class JamService {
    private final JamRepository repository;
    public JamService(JamRepository repository) { this.repository = repository; }
    public Optional<JamResponse> findById(Long id) {
        return repository.findById(id).map(JamResponse::from);
    }
}
