package com.ctrlf.api.repository;

import com.ctrlf.api.entity.CommentThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentThreadRepository extends JpaRepository<CommentThread, Long> {
    @Modifying
    @Query("delete from CommentThread t where t.parentId in "
         + "(select c.commentId from Comment c where c.blogId = :blogId)")
    void deleteByBlogId(@Param("blogId") Long blogId);
}