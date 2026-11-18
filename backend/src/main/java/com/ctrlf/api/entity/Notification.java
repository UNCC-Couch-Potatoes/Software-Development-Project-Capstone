package com.ctrlf.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "Notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NotificationId")
    private Long notificationId;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @Column(name = "NotificationType", nullable = false, length = 10)
    private String type;

    @Column(name = "Message", nullable = false, length = 500)
    private String message;

    @Column(name = "LinkPath", nullable = false, length = 255)
    private String linkPath;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "ReadAt")
    private LocalDateTime readAt;

    protected Notification() {}

    public Notification(Long userId, String type, String message, String linkPath) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.linkPath = linkPath;
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Long getNotificationId() { return notificationId; }
    public Long getUserId() { return userId; }
    public String getType() { return type; }
    public String getMessage() { return message; }
    public String getLinkPath() { return linkPath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReadAt() { return readAt; }
}