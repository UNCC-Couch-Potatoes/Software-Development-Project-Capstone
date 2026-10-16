package com.ctrlf.api.repository;

import com.ctrlf.api.entity.ResourceTag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceTagRepository extends JpaRepository<ResourceTag, String> {
    List<ResourceTag> findAllByOrderByGroupOrderAscTagOrderAsc();
}
