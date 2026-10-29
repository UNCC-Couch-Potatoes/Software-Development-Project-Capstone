package com.ctrlf.api.service;

import com.ctrlf.api.dto.JamRequest;
import com.ctrlf.api.dto.JamResponse;
import com.ctrlf.api.entity.Jam;
import com.ctrlf.api.repository.JamRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JamService {
    private final JamRepository repository;

    public JamService(JamRepository repository) { this.repository = repository; }

    public List<JamResponse> findAll() {
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : repository.countEntrantsByJam()) {
            counts.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        // Newest first, matching how the page adds new jams to the top
        return repository.findAll().stream()
                .sorted((a, b) -> b.getJamId().compareTo(a.getJamId()))
                .map(jam -> toResponse(jam, counts.getOrDefault(jam.getJamId(), 0L)))
                .toList();
    }

    public Optional<JamResponse> findById(Long id) {
        return repository.findById(id)
                .map(jam -> toResponse(jam, repository.countEntrants(jam.getJamId())));
    }

    public JamResponse create(Long userId, JamRequest body) {
        checkDates(body);
        Jam jam = new Jam(userId, cleanTitle(body), cleanDescription(body), tagsToString(body),
                cleanCoverImage(body), toUtc(body.startTime()), toUtc(body.endTime()));
        return toResponse(repository.save(jam), 0L);
    }

    public JamResponse update(Long id, Long userId, JamRequest body) {
        Jam jam = findOwned(id, userId);
        checkDates(body);
        jam.update(cleanTitle(body), cleanDescription(body), tagsToString(body),
                cleanCoverImage(body), toUtc(body.startTime()), toUtc(body.endTime()));
        Jam saved = repository.save(jam);
        return toResponse(saved, repository.countEntrants(saved.getJamId()));
    }

    // Not @Transactional on purpose: the delete commits inside repository.delete,
    // so a foreign key failure (JamEntrants) surfaces here and can become a 409
    public void delete(Long id, Long userId) {
        Jam jam = findOwned(id, userId);
        try {
            repository.delete(jam);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This jam has entrants, so it cannot be deleted.");
        }
    }

    // 404 if it doesn't exist, 403 if it belongs to someone else (or to nobody, like seeded jams)
    private Jam findOwned(Long id, Long userId) {
        Jam jam = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jam not found."));
        if (!Objects.equals(jam.getOwnerUserId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the person who posted this jam can change it.");
        }
        return jam;
    }

    private String cleanTitle(JamRequest body) {
        String title = body == null || body.jamTitle() == null ? "" : body.jamTitle().trim();
        if (title.isEmpty() || title.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 1 to 50 characters.");
        }
        return title;
    }

    private String cleanDescription(JamRequest body) {
        String description = body.jamDescription() == null ? "" : body.jamDescription().trim();
        if (description.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required.");
        }
        return description;
    }

    // Optional; when present it must be an http(s) link
    private String cleanCoverImage(JamRequest body) {
        String url = body.coverImageUrl() == null ? "" : body.coverImageUrl().trim();
        if (url.isEmpty()) return null;
        if (url.length() > 2048 || !url.matches("(?i)^https?://\\S+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cover image must be an http:// or https:// link.");
        }
        return url;
    }

    // Start and end go together, and the end must come after the start
    private void checkDates(JamRequest body) {
        Instant start = body.startTime();
        Instant end = body.endTime();
        if ((start == null) != (end == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter both a start and an end time, or neither.");
        }
        if (start != null && !end.isAfter(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The end time must be after the start time.");
        }
    }

    // Times are stored in the database as UTC
    private LocalDateTime toUtc(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    private Instant fromUtc(LocalDateTime time) {
        return time == null ? null : time.toInstant(ZoneOffset.UTC);
    }

    // ["Pixel Art", "Solo"] -> "|Pixel Art|Solo|", "" when there are no tags
    private String tagsToString(JamRequest body) {
        List<String> tags = body.jamTags() == null ? List.of() : body.jamTags().stream()
                .filter(Objects::nonNull)
                .map(tag -> tag.replace("|", "").trim())
                .filter(tag -> !tag.isEmpty())
                .distinct()
                .toList();
        if (tags.isEmpty()) return "";
        String stored = "|" + String.join("|", tags) + "|";
        if (stored.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too many tags.");
        }
        return stored;
    }

    // "|Pixel Art|Solo|" -> ["Pixel Art", "Solo"]
    private List<String> tagsToList(String stored) {
        if (stored == null) return List.of();
        return Arrays.stream(stored.split("\\|")).map(String::trim).filter(tag -> !tag.isEmpty()).toList();
    }

    private JamResponse toResponse(Jam jam, long entrantCount) {
        return new JamResponse(jam.getJamId(), jam.getJamTitle(), jam.getJamDescription(),
                tagsToList(jam.getJamTags()), jam.getOwnerUserId(), jam.getCoverImageUrl(),
                fromUtc(jam.getStartTime()), fromUtc(jam.getEndTime()), entrantCount);
    }
}