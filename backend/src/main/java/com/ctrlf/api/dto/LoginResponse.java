package com.ctrlf.api.dto;

public record LoginResponse(
    Long userId,
    String username,
    String email,
    String firstName,
    String lastName
) {
}
