package com.ctrlf.api.dto;

import java.time.Instant;
import java.util.List;

public record JamResponse(Long jamId, String jamTitle, String jamDescription,
        String jamDetailedDescription, List<String> jamTags, Long ownerUserId, String coverImageUrl,
        Instant startTime, Instant endTime, long entrantCount) {}