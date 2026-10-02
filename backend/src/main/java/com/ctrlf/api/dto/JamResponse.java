package com.ctrlf.api.dto;

import java.util.List;

import com.ctrlf.api.entity.Jam;

public record JamResponse(Long jamId, String jamTitle, String jamDescription, List<String> jamTags) {
    public static JamResponse from(Jam value) {
        return new JamResponse(value.getJamId(), value.getJamTitle(), value.getJamDescription(),
            DelimitedValues.parse(value.getJamTags()));
    }
}
