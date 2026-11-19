package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Follower;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface FollowerRepository extends JpaRepository<Follower, Long> {
    @Query("SELECT COUNT(f) FROM Follower f WHERE f.followerUser = :follower AND f.followingUser = :following")
    long countLink(@Param("follower") Long follower, @Param("following") Long following);

    @Query("SELECT f.followingUser FROM Follower f WHERE f.followerUser = :follower")
    List<Long> findFollowingIds(@Param("follower") Long follower);

    @Modifying
    @Transactional
    @Query("DELETE FROM Follower f WHERE f.followerUser = :follower AND f.followingUser = :following")
    int removeLink(@Param("follower") Long follower, @Param("following") Long following);
}