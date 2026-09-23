package com.ctrlf.api.dto;

import com.ctrlf.api.entity.CommentThread;

public record CommentThreadResponse(Long threadCommentId, Long parentId, String commentContent) {
    public static CommentThreadResponse from(CommentThread value) {
        return new CommentThreadResponse(value.getThreadCommentId(), value.getParentId(), value.getCommentContent());
    }
}
