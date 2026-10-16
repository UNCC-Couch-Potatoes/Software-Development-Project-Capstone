package com.ctrlf.api.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import com.ctrlf.api.dto.BlogResponse;
import com.ctrlf.api.service.BlogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BlogController.class)
class BlogControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BlogService blogService;

    @Test
    void returnsOneBlogById() throws Exception {
        when(blogService.findById(7L)).thenReturn(Optional.of(new BlogResponse(
            7L, "Devlog", "Week one", List.of("Godot"), 12, 3, 2L
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
