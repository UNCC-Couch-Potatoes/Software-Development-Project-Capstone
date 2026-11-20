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
    private final NotificationService notifications;

    public JamService(JamRepository repository, NotificationService notifications) {
        this.repository = repository;
        this.notifications = notifications;
    }

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
        Jam jam = new Jam(userId, cleanTitle(body), cleanDescription(body), cleanDetailedDescription(body),
                tagsToString(body), cleanCoverImage(body), toUtc(body.startTime()), toUtc(body.endTime()));
        Jam saved = repository.save(jam);
        notifications.jamPosted(saved);
        return toResponse(saved, 0L);
    }

    public JamResponse update(Long id, Long userId, JamRequest body) {
        Jam jam = findOwned(id, userId);
        checkDates(body);
        jam.update(cleanTitle(body), cleanDescription(body), cleanDetailedDescription(body),
                tagsToString(body), cleanCoverImage(body), toUtc(body.startTime()), toUtc(body.endTime()));
        Jam saved = repository.save(jam);
        notifications.jamUpdated(saved);
        return toResponse(saved, repository.countEntrants(saved.getJamId()));
    }

    public void delete(Long id, Long userId) {
        Jam jam = findOwned(id, userId);
        try {
            repository.delete(jam);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This jam has entrants, so it cannot be deleted.");
        }
    }

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

    private String cleanDetailedDescription(JamRequest body) {
        String detailed = body.jamDetailedDescription() == null ? "" : body.jamDetailedDescription().trim();
        if (detailed.isEmpty()) return null;
        if (detailed.length() > 20000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Detailed description must be 20,000 characters or fewer.");
        }
        return detailed;
    }

    private String cleanCoverImage(JamRequest body) {
        String url = body.coverImageUrl() == null ? "" : body.coverImageUrl().trim();
        if (url.isEmpty()) return null;
        if (url.length() > 2048 || !url.matches("(?i)^https?://\\S+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cover image must be an http:// or https:// link.");
        }
        return url;
    }

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

    private LocalDateTime toUtc(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    private Instant fromUtc(LocalDateTime time) {
        return time == null ? null : time.toInstant(ZoneOffset.UTC);
    }

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

    private List<String> tagsToList(String stored) {
        if (stored == null) return List.of();
        return Arrays.stream(stored.split("\\|")).map(String::trim).filter(tag -> !tag.isEmpty()).toList();
    }

    private JamResponse toResponse(Jam jam, long entrantCount) {
        return new JamResponse(jam.getJamId(), jam.getJamTitle(), jam.getJamDescription(),
                jam.getJamDetailedDescription(), tagsToList(jam.getJamTags()), jam.getOwnerUserId(), jam.getCoverImageUrl(),
                fromUtc(jam.getStartTime()), fromUtc(jam.getEndTime()), entrantCount);
    }
}