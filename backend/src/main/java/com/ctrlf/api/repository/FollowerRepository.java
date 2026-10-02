package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Follower;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowerRepository extends JpaRepository<Follower, Long> {}
