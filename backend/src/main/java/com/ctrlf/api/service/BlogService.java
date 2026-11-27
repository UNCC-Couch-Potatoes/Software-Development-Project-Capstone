package com.ctrlf.api.service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ctrlf.api.dto.BlogRequest;
import com.ctrlf.api.dto.BlogResponse;
import com.ctrlf.api.entity.Blog;
import com.ctrlf.api.repository.BlogRepository;
import com.ctrlf.api.repository.CommentRepository;
import com.ctrlf.api.repository.CommentThreadRepository;


@Service
public class BlogService {
    private final BlogRepository repository;
    private final CommentRepository commentRepository;
    private final CommentThreadRepository threadRepository;

    public BlogService(BlogRepository repository, CommentRepository commentRepository,
            CommentThreadRepository threadRepository) {
        this.repository = repository;
        this.commentRepository = commentRepository;
        this.threadRepository = threadRepository;
    }

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
        Blog blog = new Blog(cleanTitle(body.blogTitle()),
            cleanContent(body.blogContent()),
            LocalDateTime.ofInstant(body.datePosted(), ZoneOffset.UTC),
            "",
            0, 
            0, 
            body.userId()
        );
        return BlogResponse.from(repository.save(blog));
    }

    // Deletes the blog and everything under it: its likes, the replies on its comments,
    // and the comments. Order matters because of the foreign keys: likes, comments and
    // blog all point at the blog, and replies point at comments.
    @Transactional
    public void delete(Long id, Long userId) {
        Blog blog = repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found."));
        if (!userId.equals(blog.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the person who posted this blog can delete it.");
        }
        repository.deleteLikesByBlogId(id);
        threadRepository.deleteByBlogId(id);
        commentRepository.deleteByBlogId(id);
        repository.delete(blog);
    }

    private String cleanTitle(String title) {
       String newTitle = title == null || title == null ? "" : title.trim();
        if (newTitle.isEmpty() || newTitle.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 1 to 50 characters.");
        }

        return newTitle;
    }

    private String cleanContent(String content) {
        String newContent = content == null ? "" : content.trim();
        if (newContent.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required.");
        }

        return newContent;
    }

    
}