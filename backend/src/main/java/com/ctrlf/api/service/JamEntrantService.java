package com.ctrlf.api.service;

import com.ctrlf.api.dto.JamEntrantResponse;
import com.ctrlf.api.entity.Jam;
import com.ctrlf.api.repository.JamRepository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class JamEntrantService {
    private final JamRepository repository;
    private final NotificationService notifications;

    public JamEntrantService(JamRepository repository, NotificationService notifications) {
        this.repository = repository;
        this.notifications = notifications;
    }

    public List<Long> enteredJamIds(Long userId) {
        return repository.findJamIdsEnteredBy(userId);
    }

    public JamEntrantResponse join(Long jamId, Long userId) {
        Jam jam = findJam(jamId);
        checkNotEnded(jam);
        if (repository.countEntry(userId, jamId) == 0) {
            try {
                repository.addEntrant(userId, jamId);
                notifications.jamJoined(jam, userId);
            } catch (DataIntegrityViolationException ex) {
                if (repository.countEntry(userId, jamId) == 0) throw ex;
            }
        }
        return new JamEntrantResponse(true, repository.countEntrants(jamId));
    }

    public JamEntrantResponse leave(Long jamId, Long userId) {
        Jam jam = findJam(jamId);
        checkNotEnded(jam);
        repository.removeEntrant(userId, jamId);
        return new JamEntrantResponse(false, repository.countEntrants(jamId));
    }

    private Jam findJam(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jam not found."));
    }

    private void checkNotEnded(Jam jam) {
        LocalDateTime end = jam.getEndTime();
        if (end != null && !LocalDateTime.now(ZoneOffset.UTC).isBefore(end)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This jam has already ended.");
        }
    }
}