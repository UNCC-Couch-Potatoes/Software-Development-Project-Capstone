package com.ctrlf.api.dto;

public record CollabRequest(String collabType, String collabTitle, String collabDescription,
        String collabDetailedDescription, String collabLocation) {}