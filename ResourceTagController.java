package com.ctrlf.api.controller;

import com.ctrlf.api.service.ResourceTagService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resource-tags")
public class ResourceTagController {
    private final ResourceTagService service;
    public ResourceTagController(ResourceTagService service) { this.service = service; }
    @GetMapping
    public List<ResourceTagService.TagGroup> groups() { return service.groups(); }
}
