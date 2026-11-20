package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Collab;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollabRepository extends JpaRepository<Collab, Long> {
    List<Collab> findByCollabTypeOrderByCollabIdDesc(String collabType);
}