package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "CommentThread")
public class CommentThread {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ThreadCommentId")
    private Long threadCommentId;

    @Column(name = "ParentId", nullable = false)
    private Long parentId;

    @Column(name = "CommentContent", nullable = false, columnDefinition = "TEXT")
    private String commentContent;

    protected CommentThread() {}

    public Long getThreadCommentId() { return threadCommentId; }
    public Long getParentId() { return parentId; }
    public String getCommentContent() { return commentContent; }
}
