package com.ctrlf.api.controller;

import com.ctrlf.api.dto.ResourceDetail;
import com.ctrlf.api.dto.ResourcePostRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

import com.ctrlf.api.dto.ResourceResponse;
import com.ctrlf.api.service.ResourceService;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    private Long currentUser(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session == null || !(session.getAttribute("userId") instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
        return userId;
    }

    @GetMapping("/mine")
    public java.util.List<ResourceDetail> mine(HttpServletRequest request) {
        return resourceService.mine(currentUser(request));
    }

    @GetMapping("/{id}")
    public ResourceDetail detail(@PathVariable Long id) {
        return resourceService.detail(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceDetail create(@RequestBody ResourcePostRequest body,
            HttpServletRequest request) {
        return resourceService.savePost(null, currentUser(request), body);
    }

    @PutMapping("/{id}")
    public ResourceDetail update(@PathVariable Long id,
            @RequestBody ResourcePostRequest body,
            HttpServletRequest request) {
        return resourceService.savePost(id, currentUser(request), body);
    }

    @GetMapping
    public ResourceResponse findResources(
        @RequestParam(defaultValue = "") String query,
        @RequestParam(required = false) List<String> tags,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "featured")
        @Pattern(regexp = "featured|az|za") String sort
    ) {
        return resourceService.findResources(query, tags, page, sort);
    }
}
