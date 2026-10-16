package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.BlogResponse;
import com.ctrlf.api.repository.BlogRepository;
import org.springframework.stereotype.Service;

@Service
public class BlogService {
    private final BlogRepository repository;
    public BlogService(BlogRepository repository) { this.repository = repository; }
    public Optional<BlogResponse> findById(Long id) {
        return repository.findById(id).map(BlogResponse::from);
    }
}
