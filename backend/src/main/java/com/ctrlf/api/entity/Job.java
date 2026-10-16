package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JobId")
    private Long jobId;

    @Column(name = "JobTitle", nullable = false, length = 50)
    private String jobTitle;

    @Column(name = "JobDescription", nullable = false, columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "JobTags", nullable = false, length = 1000)
    private String jobTags;

    @Column(name = "SiteLink", nullable = false, length = 2048)
    private String siteLink;

    protected Job() {}

    public Long getJobId() { return jobId; }
    public String getJobTitle() { return jobTitle; }
    public String getJobDescription() { return jobDescription; }
    public String getJobTags() { return jobTags; }
    public String getSiteLink() { return siteLink; }
}
