package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Collabs")
public class Collab {
    public static final String JAM = "JAM";
    public static final String JOB = "JOB";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CollabId")
    private Long collabId;

    @Column(name = "CollabType", nullable = false, length = 10)
    private String collabType;

    @Column(name = "CollabTitle", nullable = false, length = 50)
    private String collabTitle;

    @Column(name = "CollabDescription", nullable = false, columnDefinition = "TEXT")
    private String collabDescription;

    @Column(name = "CollabDetailedDescription", columnDefinition = "TEXT")
    private String collabDetailedDescription;

    @Column(name = "CollabLocation", nullable = false, length = 100)
    private String collabLocation;

    @Column(name = "OwnerUserId")
    private Long ownerUserId;

    protected Collab() {}

    public Collab(Long ownerUserId, String collabType, String collabTitle, String collabDescription,
            String collabDetailedDescription, String collabLocation) {
        this.ownerUserId = ownerUserId;
        this.collabType = collabType;
        update(collabTitle, collabDescription, collabDetailedDescription, collabLocation);
    }

    public void update(String collabTitle, String collabDescription, String collabDetailedDescription,
            String collabLocation) {
        this.collabTitle = collabTitle;
        this.collabDescription = collabDescription;
        this.collabDetailedDescription = collabDetailedDescription;
        this.collabLocation = collabLocation;
    }

    public Long getCollabId() { return collabId; }
    public String getCollabType() { return collabType; }
    public String getCollabTitle() { return collabTitle; }
    public String getCollabDescription() { return collabDescription; }
    public String getCollabDetailedDescription() { return collabDetailedDescription; }
    public String getCollabLocation() { return collabLocation; }
    public Long getOwnerUserId() { return ownerUserId; }
}