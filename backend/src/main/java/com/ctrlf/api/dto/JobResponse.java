package com.ctrlf.api.dto;

import java.util.List;

import com.ctrlf.api.entity.Job;

public record JobResponse(Long jobId, String jobTitle, String jobDescription, List<String> jobTags,
    String siteLink) {
    public static JobResponse from(Job value) {
        return new JobResponse(value.getJobId(), value.getJobTitle(), value.getJobDescription(),
            DelimitedValues.parse(value.getJobTags()), value.getSiteLink());
    }
}
