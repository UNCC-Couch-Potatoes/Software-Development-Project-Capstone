package com.ctrlf.api.service;

import com.ctrlf.api.dto.FollowerResponse;
import com.ctrlf.api.entity.Follower;
import com.ctrlf.api.repository.FollowerRepository;
import com.ctrlf.api.repository.UserProfileRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FollowerService {
    private final FollowerRepository repository;
    private final UserProfileRepository users;

    public FollowerService(FollowerRepository repository, UserProfileRepository users) {
        this.repository = repository;
        this.users = users;
    }

    public Optional<FollowerResponse> findById(Long id) {
        return repository.findById(id).map(FollowerResponse::from);
    }

    // Ids of the users the logged-in user follows (pages use this to label their Follow buttons)
    public List<Long> followingIds(Long userId) {
        return repository.findFollowingIds(userId);
    }

    public void follow(Long userId, Long targetId) {
        if (Objects.equals(userId, targetId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot follow yourself.");
        }
        if (!users.existsById(targetId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }
        if (repository.countLink(userId, targetId) > 0) return;
        try {
            repository.save(new Follower(userId, targetId));
        } catch (DataIntegrityViolationException ex) {
            if (repository.countLink(userId, targetId) == 0) throw ex;
        }
    }

    public void unfollow(Long userId, Long targetId) {
        repository.removeLink(userId, targetId);
    }
}