package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogRepository extends JpaRepository<Blog, Long> {}
