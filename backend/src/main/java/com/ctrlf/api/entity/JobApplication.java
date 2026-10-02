package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "JobApplication")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ApplicationId")
    private Long applicationId;

    @Lob
    @Column(name = "ApplicantResume", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] applicantResume;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @Column(name = "JobId", nullable = false)
    private Long jobId;

    protected JobApplication() {}

    public Long getApplicationId() { return applicationId; }
    public byte[] getApplicantResume() { return applicantResume; }
    public Long getUserId() { return userId; }
    public Long getJobId() { return jobId; }
}
