package com.ctrlf.api.dto;

import com.ctrlf.api.entity.Notification;
import java.time.Instant;
import java.time.ZoneOffset;

public record NotificationResponse(Long notificationId, String type, String message, String linkPath,
        Instant createdAt, boolean read) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getNotificationId(), n.getType(), n.getMessage(), n.getLinkPath(),
                n.getCreatedAt().toInstant(ZoneOffset.UTC), n.getReadAt() != null);
    }
}