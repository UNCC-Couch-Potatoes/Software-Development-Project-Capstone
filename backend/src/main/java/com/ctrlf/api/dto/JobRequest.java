package com.ctrlf.api.dto;

import java.util.List;

/** Body for creating or updating a job. Field names match JobResponse. */
public record JobRequest(String jobTitle, String jobDescription, List<String> jobTags, String siteLink) {}