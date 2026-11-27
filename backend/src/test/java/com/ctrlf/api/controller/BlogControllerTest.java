package com.ctrlf.api.controller;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ctrlf.api.dto.BlogResponse;
import com.ctrlf.api.service.BlogService;

@WebMvcTest(BlogController.class)
class BlogControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BlogService blogService;

    @Test
    void createsBlogWithOnlyTitleAndContent() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 2L);
        when(blogService.create(eq(2L), any())).thenReturn(new BlogResponse(
            7L, "Devlog", "Week one", Instant.now(), List.of(), 0, 0, 2L
        ));

        mockMvc.perform(post("/api/blogs")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"blogTitle\":\"Devlog\",\"blogContent\":\"Week one\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.blogTitle").value("Devlog"));
    }

    @Test
    void returnsOneBlogById() throws Exception {
        when(blogService.findById(7L)).thenReturn(Optional.of(new BlogResponse(
            7L, "Devlog", "Week one", Instant.now(),List.of("Godot"), 12, 3, 2L
        )));

        mockMvc.perform(get("/api/blogs/7"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.blogId").value(7))
            .andExpect(jsonPath("$.blogTitle").value("Devlog"))
            .andExpect(jsonPath("$.tags[0]").value("Godot"))
            .andExpect(jsonPath("$.userId").value(2));
    }

    @Test
    void returnsNotFoundForUnknownBlog() throws Exception {
        when(blogService.findById(999L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/blogs/999"))
            .andExpect(status().isNotFound());
    }
}
