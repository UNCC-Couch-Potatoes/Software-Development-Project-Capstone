package com.ctrlf.api.dto;

public record CollabResponse(Long collabId, String collabType, String collabTitle, String collabDescription,
        String collabDetailedDescription, String collabLocation, Long ownerUserId) {}