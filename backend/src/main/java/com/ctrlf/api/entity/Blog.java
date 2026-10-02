package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Blogs")
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BlogId")
    private Long blogId;

    @Column(name = "BlogTitle", nullable = false, length = 100)
    private String blogTitle;

    @Column(name = "BlogContent", nullable = false, columnDefinition = "TEXT")
    private String blogContent;

    @Column(name = "Tags", nullable = false, length = 1000)
    private String tags;

    @Column(name = "Views", nullable = false)
    private int views;

    @Column(name = "Likes", nullable = false)
    private int likes;

    @Column(name = "Userid", nullable = false)
    private Long userId;

    protected Blog() {}

    public Long getBlogId() { return blogId; }
    public String getBlogTitle() { return blogTitle; }
    public String getBlogContent() { return blogContent; }
    public String getTags() { return tags; }
    public int getViews() { return views; }
    public int getLikes() { return likes; }
    public Long getUserId() { return userId; }
}
