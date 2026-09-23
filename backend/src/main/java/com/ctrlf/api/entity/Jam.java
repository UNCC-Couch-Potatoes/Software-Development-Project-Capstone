package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

    @Column(name = "JamTags", nullable = false, length = 1000)
    private String jamTags;

    protected Jam() {}

    public Long getJamId() { return jamId; }
    public String getJamTitle() { return jamTitle; }
    public String getJamDescription() { return jamDescription; }
    public String getJamTags() { return jamTags; }
}
