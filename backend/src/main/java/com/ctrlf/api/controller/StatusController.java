package com.ctrlf.api.controller;

import java.time.Instant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StatusController {

    @GetMapping("/status")
    public ApiStatus status() {
        return new ApiStatus("CtrlF API", "UP", Instant.now());
    }

    public record ApiStatus(String application, String status, Instant timestamp) {
    }
}
