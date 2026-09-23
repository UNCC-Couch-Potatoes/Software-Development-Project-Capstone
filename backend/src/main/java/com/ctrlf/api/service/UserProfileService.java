package com.ctrlf.api.service;

import java.util.Optional;
import com.ctrlf.api.dto.UserProfileResponse;
import com.ctrlf.api.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {
    private final UserProfileRepository repository;
    public UserProfileService(UserProfileRepository repository) { this.repository = repository; }
    public Optional<UserProfileResponse> findById(Long id) {
        return repository.findById(id).map(UserProfileResponse::from);
    }
}
