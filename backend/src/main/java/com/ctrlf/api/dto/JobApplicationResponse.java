package com.ctrlf.api.dto;

import com.ctrlf.api.entity.JobApplication;

public record JobApplicationResponse(Long applicationId, Long userId, Long jobId, int resumeSizeBytes) {
    public static JobApplicationResponse from(JobApplication value) {
        byte[] resume = value.getApplicantResume();
        return new JobApplicationResponse(value.getApplicationId(), value.getUserId(), value.getJobId(),
            resume == null ? 0 : resume.length);
    }
}
