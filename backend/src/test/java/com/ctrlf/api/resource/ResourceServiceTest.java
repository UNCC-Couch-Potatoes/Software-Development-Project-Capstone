package com.ctrlf.api.resource;

import com.ctrlf.api.dto.ResourceResponse;
import com.ctrlf.api.entity.Resource;
import com.ctrlf.api.repository.ResourceRepository;
import com.ctrlf.api.service.ResourceService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    @Test
    void searchesUsingPagesOfTwentyRows() {
        Resource resource = new Resource(
            21L,
            "Godot Engine",
            "An open-source game engine.",
            "https://godotengine.org/",
            "|Programming|Game Engines|"
        );
        when(resourceRepository.findAll(
            any(Specification.class),
            any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(resource), PageRequest.of(1, 20), 41));

        ResourceResponse response = resourceService.findResources(
            " engine ",
            List.of("Programming"),
            1,
            "az"
        );

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(resourceRepository).findAll(
            any(Specification.class),
            pageable.capture()
        );

        assertThat(pageable.getValue().getPageNumber()).isEqualTo(1);
        assertThat(pageable.getValue().getPageSize()).isEqualTo(20);
        assertThat(pageable.getValue().getSort().getOrderFor("siteName").isAscending()).isTrue();
        assertThat(response.totalPages()).isEqualTo(3);
        assertThat(response.totalElements()).isEqualTo(41);
        assertThat(response.resources()).hasSize(1);
        assertThat(response.resources().get(0).tags())
            .containsExactly("Programming", "Game Engines");
    }
}
