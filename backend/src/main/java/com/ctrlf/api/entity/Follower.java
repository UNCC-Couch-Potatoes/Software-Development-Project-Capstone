package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Followers")
public class Follower {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FollowerLinkId")
    private Long followerLinkId;

    @Column(name = "FollowerUser", nullable = false)
    private Long followerUser;

    @Column(name = "FollowingUser", nullable = false)
    private Long followingUser;

    protected Follower() {}

    public Long getFollowerLinkId() { return followerLinkId; }
    public Long getFollowerUser() { return followerUser; }
    public Long getFollowingUser() { return followingUser; }
}
