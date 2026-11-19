package com.ctrlf.api.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ctrlf.api.service.FollowerService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FollowerController.class)
class FollowerControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FollowerService service;

    @Test
    void listsWhoTheUserFollows() throws Exception {
        when(service.followingIds(5L)).thenReturn(List.of(2L, 3L));
        mockMvc.perform(get("/api/followers/following").sessionAttr("userId", 5L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value(2))
            .andExpect(jsonPath("$[1]").value(3));
    }

    @Test
    void followsAndUnfollows() throws Exception {
        mockMvc.perform(post("/api/followers/follow/2").sessionAttr("userId", 5L)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/followers/follow/2").sessionAttr("userId", 5L)).andExpect(status().isNoContent());
        verify(service).follow(5L, 2L);
        verify(service).unfollow(5L, 2L);
    }

    @Test
    void requiresLogin() throws Exception {
        mockMvc.perform(post("/api/followers/follow/2")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/followers/following")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
}