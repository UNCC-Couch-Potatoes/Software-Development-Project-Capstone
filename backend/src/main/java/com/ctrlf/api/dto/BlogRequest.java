package com.ctrlf.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record BlogRequest(Long blogId, String blogTitle, String blogContent, LocalDateTime datePosted, List<String> tags,
    Integer views, Integer likes, Long userId) {}