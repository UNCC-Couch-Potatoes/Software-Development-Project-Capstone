package com.ctrlf.api.dto;

import java.util.List;

import com.ctrlf.api.entity.Blog;

public record BlogResponse(Long blogId, String blogTitle, String blogContent, List<String> tags,
    int views, int likes, Long userId) {
    public static BlogResponse from(Blog value) {
        return new BlogResponse(value.getBlogId(), value.getBlogTitle(), value.getBlogContent(),
            DelimitedValues.parse(value.getTags()), value.getViews(), value.getLikes(), value.getUserId());
    }
}
