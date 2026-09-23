package com.ctrlf.api.dto;

import com.ctrlf.api.entity.Comment;

public record CommentResponse(Long commentId, String commentContent, int likes, Long userId, Long blogId) {
    public static CommentResponse from(Comment value) {
        return new CommentResponse(value.getCommentId(), value.getCommentContent(), value.getLikes(),
            value.getUserId(), value.getBlogId());
    }
}
