package com.ctrlf.api.dto;

import com.ctrlf.api.entity.JamEntrant;

public record JamEntrantResponse(Long entryId, Long userId, Long jamId) {
    public static JamEntrantResponse from(JamEntrant value) {
        return new JamEntrantResponse(value.getEntryId(), value.getUserId(), value.getJamId());
    }
}
