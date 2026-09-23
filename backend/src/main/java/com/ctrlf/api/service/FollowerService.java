package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.FollowerResponse;
import com.ctrlf.api.repository.FollowerRepository;
import org.springframework.stereotype.Service;

@Service
public class FollowerService {
    private final FollowerRepository repository;
    public FollowerService(FollowerRepository repository) { this.repository = repository; }
    public Optional<FollowerResponse> findById(Long id) {
        return repository.findById(id).map(FollowerResponse::from);
    }
}
