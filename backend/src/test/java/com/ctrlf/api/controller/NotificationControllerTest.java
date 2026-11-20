package com.ctrlf.api.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ctrlf.api.dto.NotificationFeed;
import com.ctrlf.api.dto.NotificationResponse;
import com.ctrlf.api.service.NotificationService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(NotificationController.class)
class NotificationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationService service;

    @Test
    void returnsTheLoggedInUsersFeed() throws Exception {
        when(service.feed(5L)).thenReturn(new NotificationFeed(1, List.of(new NotificationResponse(
            9L, "JAM", "Ana posted a new jam: Pixel Jam", "/jams/3", Instant.parse("2026-01-01T00:00:00Z"), false))));

        mockMvc.perform(get("/api/notifications").sessionAttr("userId", 5L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.unreadCount").value(1))
            .andExpect(jsonPath("$.items[0].notificationId").value(9))
            .andExpect(jsonPath("$.items[0].type").value("JAM"))
            .andExpect(jsonPath("$.items[0].read").value(false));
    }

    @Test
    void marksOneNotificationReadForTheLoggedInUser() throws Exception {
        mockMvc.perform(post("/api/notifications/9/read").sessionAttr("userId", 5L))
            .andExpect(status().isNoContent());
        verify(service).markRead(9L, 5L);
    }

    @Test
    void marksEverythingRead() throws Exception {
        mockMvc.perform(post("/api/notifications/read-all").sessionAttr("userId", 5L))
            .andExpect(status().isNoContent());
        verify(service).markAllRead(5L);
    }

    @Test
    void rejectsRequestsWithoutASession() throws Exception {
        mockMvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/notifications/read-all")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
}