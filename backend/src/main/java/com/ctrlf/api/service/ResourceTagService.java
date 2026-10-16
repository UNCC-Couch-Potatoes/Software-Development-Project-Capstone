package com.ctrlf.api.service;

import com.ctrlf.api.repository.ResourceTagRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ResourceTagService {
    public static final String USER_MADE = "User Made";
    private final ResourceTagRepository repository;

    public ResourceTagService(ResourceTagRepository repository) { this.repository = repository; }

    public record TagGroup(String title, List<String> tags) {}

    public List<TagGroup> groups() {
        var groups = new LinkedHashMap<String, List<String>>();
        for (var tag : repository.findAllByOrderByGroupOrderAscTagOrderAsc()) {
            groups.computeIfAbsent(tag.getGroupName(), name -> new ArrayList<>()).add(tag.getTagName());
        }
        return groups.entrySet().stream().map(entry -> new TagGroup(entry.getKey(), entry.getValue())).toList();
    }

    // Canonicalize against the database; never silently strip or accept unknown values.
    public List<String> forUserPost(List<String> requested) {
        var approved = new LinkedHashMap<String, String>();
        for (var tag : repository.findAllByOrderByGroupOrderAscTagOrderAsc()) {
            approved.put(tag.getTagName().toLowerCase(Locale.ROOT), tag.getTagName());
        }
        String mandatory = approved.get(USER_MADE.toLowerCase(Locale.ROOT));
        if (mandatory == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "The resource tag catalog has not been loaded.");
        }
        var selected = new LinkedHashSet<String>();
        selected.add(mandatory);
        if (requested != null) {
            for (String value : requested) {
                String canonical = value == null ? null : approved.get(value.trim().toLowerCase(Locale.ROOT));
                if (canonical == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose tags from the approved resource tag catalog.");
                }
                selected.add(canonical);
            }
        }
        return List.copyOf(selected);
    }
}
