package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "JamEntrants")
public class JamEntrant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EntryId")
    private Long entryId;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @Column(name = "JamId", nullable = false)
    private Long jamId;

    protected JamEntrant() {}

    public Long getEntryId() { return entryId; }
    public Long getUserId() { return userId; }
    public Long getJamId() { return jamId; }
}
