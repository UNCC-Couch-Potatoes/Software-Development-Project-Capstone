package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.BlogResponse;
import com.ctrlf.api.repository.BlogRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import com.ctrlf.api.dto.BlogRequest;
import com.ctrlf.api.entity.Blog;  
import java.util.List;
import org.springframework.web.server.ResponseStatusException;


@Service
public class BlogService {
    private final BlogRepository repository;
    public BlogService(BlogRepository repository) { this.repository = repository; }

    public Optional<BlogResponse> findById(Long id) {
        return repository.findById(id).map(BlogResponse::from);
    }

    public List<BlogResponse> findAll() {
        // Newest first, matching how the page adds new blogs to the top
        return repository.findAll().stream()
                .sorted((a, b) -> b.getBlogId().compareTo(a.getBlogId()))
                .map(blog -> BlogResponse.from(blog))
                .toList();
    }

    public BlogResponse create(Long userId, BlogRequest body) {
        //No likes currently as the feature does not work with current database.
        Blog blog = new Blog(cleanTitle(body.blogTitle()), cleanContent(body.blogContent()), "", 0, 0, userId);
        return BlogResponse.from(repository.save(blog));
    }

    private String cleanTitle(String title) {
       String newTitle = title == null || title == null ? "" : title.trim();
        if (newTitle.isEmpty() || newTitle.length() > 50) {
            //throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 1 to 50 characters.");
        }

        return newTitle;
    }

    private String cleanContent(String content) {
        String newContent = content == null ? "" : content.trim();
        if (newContent.isEmpty()) {
            //throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required.");
        }

        return newContent;
    }
}
