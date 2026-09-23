package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ResourceID")
    private Long resourceId;

    @Column(name = "SiteName", nullable = false, length = 255)
    private String siteName;

    @Column(name = "Overview", nullable = false, columnDefinition = "TEXT")
    private String overview;

    @Column(name = "SiteLink", nullable = false, length = 2048)
    private String siteLink;

    @Column(name = "Tags", nullable = false, length = 1000)
    private String tags;

    protected Resource() {
    }

    public Resource(Long resourceId, String siteName, String overview, String siteLink, String tags) {
        this.resourceId = resourceId;
        this.siteName = siteName;
        this.overview = overview;
        this.siteLink = siteLink;
        this.tags = tags;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public String getSiteName() {
        return siteName;
    }

    public String getOverview() {
        return overview;
    }

    public String getSiteLink() {
        return siteLink;
    }

    public String getTags() {
        return tags;
    }
}
