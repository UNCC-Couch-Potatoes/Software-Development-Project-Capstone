package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.CommentThreadResponse;
import com.ctrlf.api.repository.CommentThreadRepository;
import org.springframework.stereotype.Service;

@Service
public class CommentThreadService {
    private final CommentThreadRepository repository;
    public CommentThreadService(CommentThreadRepository repository) { this.repository = repository; }
    public Optional<CommentThreadResponse> findById(Long id) {
        return repository.findById(id).map(CommentThreadResponse::from);
    }
}
