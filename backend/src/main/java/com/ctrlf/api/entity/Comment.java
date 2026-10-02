package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CommentId")
    private Long commentId;

    @Column(name = "CommentContent", nullable = false, columnDefinition = "TEXT")
    private String commentContent;

    @Column(name = "Likes", nullable = false)
    private int likes;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @Column(name = "BlogId", nullable = false)
    private Long blogId;

    protected Comment() {}

    public Long getCommentId() { return commentId; }
    public String getCommentContent() { return commentContent; }
    public int getLikes() { return likes; }
    public Long getUserId() { return userId; }
    public Long getBlogId() { return blogId; }
}
