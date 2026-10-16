package com.ctrlf.api.resource;

import com.ctrlf.api.entity.ResourceTag;
import com.ctrlf.api.repository.ResourceTagRepository;
import com.ctrlf.api.service.ResourceTagService;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceTagServiceTest {
    @Mock ResourceTagRepository repository;
    ResourceTagService service;
    @BeforeEach void setup() { service = new ResourceTagService(repository); }

    private void catalog() {
        when(repository.findAllByOrderByGroupOrderAscTagOrderAsc()).thenReturn(List.of(
            new ResourceTag("User Made", "User Made", 0, 0),
            new ResourceTag("Programming", "Development", 1, 0),
            new ResourceTag("Godot", "Development", 1, 1),
            new ResourceTag("Art", "Art & assets", 2, 0)));
    }

    @Test void groupsTagsInCatalogOrder() {
        catalog();
        assertThat(service.groups()).containsExactly(
            new ResourceTagService.TagGroup("User Made", List.of("User Made")),
            new ResourceTagService.TagGroup("Development", List.of("Programming", "Godot")),
            new ResourceTagService.TagGroup("Art & assets", List.of("Art")));
    }

    @Test void mandatoryTagCannotBeOmitted() {
        catalog();
        assertThat(service.forUserPost(null)).containsExactly("User Made");
        assertThat(service.forUserPost(List.of())).containsExactly("User Made");
    }

    @Test void canonicalizesAndDeduplicatesApprovedTags() {
        catalog();
        assertThat(service.forUserPost(List.of(" godot ", "GODOT", "user made", "Art")))
            .containsExactly("User Made", "Godot", "Art");
    }

    @Test void rejectsUnknownOrMalformedTags() {
        catalog();
        for (var tags : List.of(List.of("Custom"), List.of(""), List.of("Godot|Custom"), Arrays.asList((String) null))) {
            assertThatThrownBy(() -> service.forUserPost(tags)).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400");
        }
    }

    @Test void failsClosedWhenCatalogIsNotSeeded() {
        when(repository.findAllByOrderByGroupOrderAscTagOrderAsc()).thenReturn(List.of());
        assertThatThrownBy(() -> service.forUserPost(List.of("Art"))).isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("503");
    }
}
