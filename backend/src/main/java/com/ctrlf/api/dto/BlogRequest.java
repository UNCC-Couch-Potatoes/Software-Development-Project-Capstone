package com.ctrlf.api.dto;

import java.util.List;

public record BlogRequest(Long blogId, String blogTitle, String blogContent, List<String> tags,
    Integer views, Integer likes, Long userId) {}