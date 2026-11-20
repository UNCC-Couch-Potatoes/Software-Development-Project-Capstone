package com.ctrlf.api.dto;

import java.time.Instant;
import java.util.List;

public record JamRequest(String jamTitle, String jamDescription, String jamDetailedDescription, List<String> jamTags, String coverImageUrl, Instant startTime, Instant endTime) {}