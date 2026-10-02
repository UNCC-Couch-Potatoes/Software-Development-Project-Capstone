package com.ctrlf.api.controller;

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
