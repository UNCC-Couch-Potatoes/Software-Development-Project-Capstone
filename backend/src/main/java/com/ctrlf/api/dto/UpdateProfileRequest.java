package com.ctrlf.api.dto;

import java.util.List;

public record UpdateProfileRequest(String firstName, String lastName, String bio,
                                   List<String> skills, List<String> interests) {}