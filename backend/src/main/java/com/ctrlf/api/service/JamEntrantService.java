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

    public JamEntrantService(JamRepository repository) { this.repository = repository; }

    // Ids of every jam this user has joined (the page uses this to label the buttons)
    public List<Long> enteredJamIds(Long userId) {
        return repository.findJamIdsEnteredBy(userId);
    }

    // Joining twice is harmless: the second request just reports that you're in
    public JamEntrantResponse join(Long jamId, Long userId) {
        Jam jam = findJam(jamId);
        checkNotEnded(jam);
        if (repository.countEntry(userId, jamId) == 0) {
            try {
                repository.addEntrant(userId, jamId);
            } catch (DataIntegrityViolationException ex) {
                // Two requests at once can collide on the unique key; only that case is fine
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

    // The entrant list of a finished jam stays as a record, so no joining or leaving after the end
    private void checkNotEnded(Jam jam) {
        LocalDateTime end = jam.getEndTime();
        if (end != null && !LocalDateTime.now(ZoneOffset.UTC).isBefore(end)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This jam has already ended.");
        }
    }
}