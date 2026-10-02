package com.ctrlf.api.dto;

import java.time.LocalDate;
import java.util.List;

import com.ctrlf.api.entity.UserProfile;

public record UserProfileResponse(Long userId, String firstName, String lastName,
    List<String> skills, List<String> interests, String bio, LocalDate joinDate) {
    public static UserProfileResponse from(UserProfile value) {
        return new UserProfileResponse(value.getUserId(), value.getFirstName(), value.getLastName(),
            DelimitedValues.parse(value.getSkills()), DelimitedValues.parse(value.getInterests()),
            value.getBio(), value.getJoinDate());
    }
}
