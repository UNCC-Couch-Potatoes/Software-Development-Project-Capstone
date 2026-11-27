package com.ctrlf.api.dto;

import java.time.Instant;
import java.util.List;

public record BlogRequest(Long blogId, String blogTitle, String blogContent, Instant datePosted, List<String> tags,
    Integer views, Integer likes, Long userId) {}