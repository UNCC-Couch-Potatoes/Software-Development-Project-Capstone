package com.ctrlf.api.dto;

import com.ctrlf.api.entity.Follower;

public record FollowerResponse(Long followerLinkId, Long followerUser, Long followingUser) {
    public static FollowerResponse from(Follower value) {
        return new FollowerResponse(value.getFollowerLinkId(), value.getFollowerUser(), value.getFollowingUser());
    }
}
