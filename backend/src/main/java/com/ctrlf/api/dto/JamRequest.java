package com.ctrlf.api.dto;

import java.time.Instant;
import java.util.List;

public record JamRequest(String jamTitle, String jamDescription, List<String> jamTags, String coverImageUrl, Instant startTime, Instant endTime) {}