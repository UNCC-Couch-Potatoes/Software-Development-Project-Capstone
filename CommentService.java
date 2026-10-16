package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.CommentResponse;
import com.ctrlf.api.repository.CommentRepository;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    private final CommentRepository repository;
    public CommentService(CommentRepository repository) { this.repository = repository; }
    public Optional<CommentResponse> findById(Long id) {
        return repository.findById(id).map(CommentResponse::from);
    }
}
