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

    @Mock
    private com.ctrlf.api.repository.ResourceTagRepository resourceTagRepository;

    private ResourceService resourceService;

    @org.junit.jupiter.api.BeforeEach
    void initializeService() {
        org.mockito.Mockito.lenient().when(resourceTagRepository.findAllByOrderByGroupOrderAscTagOrderAsc())
            .thenReturn(List.of(
                new com.ctrlf.api.entity.ResourceTag("User Made", "User Made", 0, 0),
                new com.ctrlf.api.entity.ResourceTag("Art", "Art & assets", 2, 0),
                new com.ctrlf.api.entity.ResourceTag("Audio", "Audio", 3, 0)));
        resourceService = new ResourceService(resourceRepository,
            new com.ctrlf.api.service.ResourceTagService(resourceTagRepository));
    }

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

    @Test
    void persistsBodyTagsOwnerAndUniqueUrl() {
        when(resourceRepository.save(any(Resource.class))).thenAnswer(invocation -> {
            Resource r = invocation.getArgument(0);
            if (r.getResourceId() == null) {
                var field = Resource.class.getDeclaredField("resourceId");
                field.setAccessible(true);
                field.set(r, 42L);
            }
            return r;
        });
        var post = resourceService.savePost(null, 7L, new com.ctrlf.api.dto.ResourcePostRequest(
            " My guide ", "Overview", List.of("Art", "Art"), "## Heading\n**Bold**"));
        assertThat(post.siteName()).isEqualTo("My guide");
        assertThat(post.siteLink()).isEqualTo("/resources/42");
        assertThat(post.body()).isEqualTo("## Heading\n**Bold**");
        assertThat(post.ownerUserId()).isEqualTo(7L);
        assertThat(post.tags()).containsExactly("User Made", "Art");
    }

    @Test
    void rejectsEditingAnotherUsersPost() {
        Resource r = new Resource(42L, "Original", "Overview", "/resources/42", "");
        r.publish(7L, "Original", "Overview", "", "Body");
        when(resourceRepository.findById(42L)).thenReturn(java.util.Optional.of(r));
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> resourceService.savePost(42L, 8L,
            new com.ctrlf.api.dto.ResourcePostRequest("Changed", "Overview", List.of(), "Body")))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
            .hasMessageContaining("403");
        org.mockito.Mockito.verify(resourceRepository, org.mockito.Mockito.never()).save(any(Resource.class));
    }

    @Test
    void ownerCanUpdateWithoutChangingUrl() {
        Resource r = new Resource(42L, "Original", "Overview", "/resources/42", "");
        r.publish(7L, "Original", "Overview", "", "Body");
        when(resourceRepository.findById(42L)).thenReturn(java.util.Optional.of(r));
        when(resourceRepository.save(r)).thenReturn(r);
        var post = resourceService.savePost(42L, 7L,
            new com.ctrlf.api.dto.ResourcePostRequest("Changed", "New overview", List.of("Audio"), "New body"));
        assertThat(post.siteLink()).isEqualTo("/resources/42");
        assertThat(post.body()).isEqualTo("New body");
        assertThat(post.siteName()).isEqualTo("Changed");
    }

    @Test
    void rejectsMissingContent() {
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> resourceService.savePost(null, 7L,
            new com.ctrlf.api.dto.ResourcePostRequest("", "Overview", List.of(), "Body")))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
            .hasMessageContaining("400");
    }

    @Test
    void rejectsUnknownTagsWithoutSaving() {
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> resourceService.savePost(null, 7L,
            new com.ctrlf.api.dto.ResourcePostRequest("Title", "Overview", List.of("Unapproved tag"), "Body")))
            .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
            .hasMessageContaining("400");
        org.mockito.Mockito.verify(resourceRepository, org.mockito.Mockito.never()).save(any(Resource.class));
    }
}
