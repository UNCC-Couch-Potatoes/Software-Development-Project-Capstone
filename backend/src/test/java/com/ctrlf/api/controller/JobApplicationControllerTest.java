package com.ctrlf.api.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ctrlf.api.service.JobApplicationService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(JobApplicationController.class)
class JobApplicationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobApplicationService service;

    @Test
    void listsJobsTheUserAppliedTo() throws Exception {
        when(service.appliedJobIds(5L)).thenReturn(List.of(4L));
        mockMvc.perform(get("/api/job-applications/mine").sessionAttr("userId", 5L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value(4));
    }

    @Test
    void appliesToAJob() throws Exception {
        mockMvc.perform(post("/api/job-applications/job/4").sessionAttr("userId", 5L))
            .andExpect(status().isNoContent());
        verify(service).apply(4L, 5L);
    }

    @Test
    void requiresLogin() throws Exception {
        mockMvc.perform(post("/api/job-applications/job/4")).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
}