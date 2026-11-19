package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    @Modifying
    @Query(value = "DELETE FROM BlogLikes WHERE BlogId = :blogId", nativeQuery = true)
    void deleteLikesByBlogId(@Param("blogId") Long blogId);
}