package com.ctrlf.api.dto;

import java.time.Instant;
import java.util.List;

public record BlogRequest(Long blogId, String blogTitle, String blogContent, List<String> tags,
    int views, int likes, Long userId) {}