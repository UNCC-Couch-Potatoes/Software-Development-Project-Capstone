package com.ctrlf.api.dto;

import java.util.List;

public record NotificationFeed(long unreadCount, List<NotificationResponse> items) {}