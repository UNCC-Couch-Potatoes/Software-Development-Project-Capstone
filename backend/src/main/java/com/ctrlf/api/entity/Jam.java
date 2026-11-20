package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "Jams")
public class Jam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JamId")
    private Long jamId;

    @Column(name = "JamTitle", nullable = false, length = 50)
    private String jamTitle;

    @Column(name = "JamDescription", nullable = false, columnDefinition = "TEXT")
    private String jamDescription;

    // Optional longer write-up shown on the jam's own page (Markdown)
    @Column(name = "JamDetailedDescription", columnDefinition = "TEXT")
    private String jamDetailedDescription;

    @Column(name = "JamTags", nullable = false, length = 1000)
    private String jamTags;

    @Column(name = "OwnerUserId")
    private Long ownerUserId;

    @Column(name = "CoverImageUrl", length = 2048)
    private String coverImageUrl;

    // Both are UTC
    @Column(name = "StartTime")
    private LocalDateTime startTime;

    @Column(name = "EndTime")
    private LocalDateTime endTime;

    protected Jam() {}

    public Jam(Long ownerUserId, String jamTitle, String jamDescription, String jamDetailedDescription,
            String jamTags, String coverImageUrl, LocalDateTime startTime, LocalDateTime endTime) {
        this.ownerUserId = ownerUserId;
        update(jamTitle, jamDescription, jamDetailedDescription, jamTags, coverImageUrl, startTime, endTime);
    }

    public void update(String jamTitle, String jamDescription, String jamDetailedDescription, String jamTags,
            String coverImageUrl, LocalDateTime startTime, LocalDateTime endTime) {
        this.jamTitle = jamTitle;
        this.jamDescription = jamDescription;
        this.jamDetailedDescription = jamDetailedDescription;
        this.jamTags = jamTags;
        this.coverImageUrl = coverImageUrl;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getJamId() { return jamId; }
    public String getJamTitle() { return jamTitle; }
    public String getJamDescription() { return jamDescription; }
    public String getJamDetailedDescription() { return jamDetailedDescription; }
    public String getJamTags() { return jamTags; }
    public Long getOwnerUserId() { return ownerUserId; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
}