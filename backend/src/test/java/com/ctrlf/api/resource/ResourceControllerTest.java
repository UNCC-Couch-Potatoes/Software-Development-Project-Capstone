package com.ctrlf.api.resource;

import com.ctrlf.api.controller.ResourceController;
import com.ctrlf.api.dto.ResourceResponse;
import com.ctrlf.api.service.ResourceService;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ResourceController.class)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResourceService resourceService;

    @Test
    void returnsAResourcePage() throws Exception {
        ResourceResponse response = new ResourceResponse(
            List.of(new ResourceResponse.ResourceItem(
                21L,
                "Godot Engine",
                "An open-source game engine.",
                "https://godotengine.org/",
                List.of("Programming", "Game Engines")
            )),
            1,
            20,
            3,
            41,
            false,
            false
        );

        when(resourceService.findResources(
            "engine",
            List.of("Programming", "Game Engines"),
            1,
            "az"
        )).thenReturn(response);

        mockMvc.perform(get("/api/resources")
                .queryParam("query", "engine")
                .queryParam("tags", "Programming", "Game Engines")
                .queryParam("page", "1")
                .queryParam("sort", "az"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.resources[0].resourceId").value(21))
            .andExpect(jsonPath("$.resources[0].siteName").value("Godot Engine"))
            .andExpect(jsonPath("$.resources[0].tags[0]").value("Programming"))
            .andExpect(jsonPath("$.resources[0].tags[1]").value("Game Engines"))
            .andExpect(jsonPath("$.page").value(1))
            .andExpect(jsonPath("$.pageSize").value(20))
            .andExpect(jsonPath("$.totalPages").value(3))
            .andExpect(jsonPath("$.totalElements").value(41));
    }
}
