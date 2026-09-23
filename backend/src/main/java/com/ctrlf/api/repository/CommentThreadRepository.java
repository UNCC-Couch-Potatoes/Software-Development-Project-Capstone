package com.ctrlf.api.repository;

import com.ctrlf.api.entity.CommentThread;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentThreadRepository extends JpaRepository<CommentThread, Long> {}
