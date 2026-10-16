package com.ctrlf.api.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.ctrlf.api.dto.JobResponse;
import com.ctrlf.api.service.JobService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(JobController.class)
class JobControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobService jobService;

    @Test
    void returnsAllJobs() throws Exception {
        when(jobService.findAll()).thenReturn(List.of(new JobResponse(
            1L, "Game Developer", "Example Studios", "Build games", List.of("Programming"),
            "https://example.com/jobs/game-developer"
        )));

        mockMvc.perform(get("/api/jobs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].jobTitle").value("Game Developer"))
            .andExpect(jsonPath("$[0].companyName").value("Example Studios"))
            .andExpect(jsonPath("$[0].jobTags[0]").value("Programming"));
    }
}