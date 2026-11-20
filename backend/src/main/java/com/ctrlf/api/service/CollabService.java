package com.ctrlf.api.service;

import com.ctrlf.api.dto.CollabRequest;
import com.ctrlf.api.dto.CollabResponse;
import com.ctrlf.api.entity.Collab;
import com.ctrlf.api.repository.CollabRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CollabService {
    private final CollabRepository repository;

    public CollabService(CollabRepository repository) { this.repository = repository; }

    public List<CollabResponse> findByType(String type) {
        return repository.findByCollabTypeOrderByCollabIdDesc(cleanType(type)).stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<CollabResponse> findById(Long id) {
        return repository.findById(id).map(this::toResponse);
    }

    public CollabResponse create(Long userId, CollabRequest body) {
        if (body == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required.");
        String type = cleanType(body.collabType());
        Collab collab = new Collab(userId, type, cleanTitle(body), cleanDescription(body),
                cleanDetailedDescription(body, type), cleanLocation(body));
        return toResponse(repository.save(collab));
    }

    public CollabResponse update(Long id, Long userId, CollabRequest body) {
        if (body == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required.");
        Collab collab = findOwned(id, userId);
        collab.update(cleanTitle(body), cleanDescription(body),
                cleanDetailedDescription(body, collab.getCollabType()), cleanLocation(body));
        return toResponse(repository.save(collab));
    }

    public void delete(Long id, Long userId) {
        repository.delete(findOwned(id, userId));
    }

    private Collab findOwned(Long id, Long userId) {
        Collab collab = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collab not found."));
        if (!Objects.equals(collab.getOwnerUserId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the person who posted this collab can change it.");
        }
        return collab;
    }

    private String cleanType(String type) {
        String value = type == null ? "" : type.trim().toUpperCase();
        if (!value.equals(Collab.JAM) && !value.equals(Collab.JOB)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Collab type must be JAM or JOB.");
        }
        return value;
    }

    private String cleanTitle(CollabRequest body) {
        String title = body.collabTitle() == null ? "" : body.collabTitle().trim();
        if (title.isEmpty() || title.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title must be 1 to 50 characters.");
        }
        return title;
    }

    private String cleanDescription(CollabRequest body) {
        String description = body.collabDescription() == null ? "" : body.collabDescription().trim();
        if (description.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Short description is required.");
        }
        return description;
    }

    private String cleanDetailedDescription(CollabRequest body, String type) {
        if (!Collab.JAM.equals(type)) return null;
        String detailed = body.collabDetailedDescription() == null ? "" : body.collabDetailedDescription().trim();
        if (detailed.isEmpty()) return null;
        if (detailed.length() > 20000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Long description must be 20,000 characters or fewer.");
        }
        return detailed;
    }

    private String cleanLocation(CollabRequest body) {
        String location = body.collabLocation() == null ? "" : body.collabLocation().trim();
        if (location.isEmpty() || location.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Location must be 1 to 100 characters.");
        }
        return location;
    }

    private CollabResponse toResponse(Collab collab) {
        return new CollabResponse(collab.getCollabId(), collab.getCollabType(), collab.getCollabTitle(),
                collab.getCollabDescription(), collab.getCollabDetailedDescription(), collab.getCollabLocation(),
                collab.getOwnerUserId());
    }
}