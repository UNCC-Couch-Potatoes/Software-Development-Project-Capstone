package com.ctrlf.api.service;

import com.ctrlf.api.dto.ResourceDetail;
import com.ctrlf.api.dto.ResourcePostRequest;
import com.ctrlf.api.dto.DelimitedValues;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.ctrlf.api.dto.ResourceResponse;
import com.ctrlf.api.entity.Resource;
import com.ctrlf.api.repository.ResourceRepository;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    static final int PAGE_SIZE = 20;

    private final ResourceRepository resourceRepository;

    private final ResourceTagService resourceTagService;

    public ResourceService(ResourceRepository resourceRepository, ResourceTagService resourceTagService) {
        this.resourceRepository = resourceRepository;
        this.resourceTagService = resourceTagService;
    }

    public ResourceResponse findResources(String query, List<String> tags, int page, String sort) {
        Pageable pageable = PageRequest.of(page, PAGE_SIZE, sortFor(sort));
        String normalizedQuery = query == null ? "" : query.trim();
        List<String> normalizedTags = normalizeTags(tags);
        Page<Resource> result = resourceRepository.findAll(
            buildSpecification(normalizedQuery, normalizedTags),
            pageable
        );

        List<ResourceResponse.ResourceItem> resources = result.getContent().stream()
            .map(ResourceResponse.ResourceItem::from)
            .toList();

        return new ResourceResponse(
            resources,
            result.getNumber(),
            result.getSize(),
            result.getTotalPages(),
            result.getTotalElements(),
            result.isFirst(),
            result.isLast()
        );
    }

    public List<ResourceDetail> mine(Long userId) {
        return resourceRepository.findByOwnerUserIdOrderByResourceIdDesc(userId).stream()
            .map(ResourceDetail::from).toList();
    }

    public ResourceDetail detail(Long id) {
        return ResourceDetail.from(find(id));
    }

    private Resource find(Long id) {
        return resourceRepository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found."));
    }

    @Transactional
    public ResourceDetail savePost(Long id, Long userId, ResourcePostRequest req) {
        Resource resource = id == null ? new Resource(null, "", "", "", "") : find(id);
        if (id != null && !userId.equals(resource.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator can edit this resource.");
        }
        if (req == null || req.title() == null || req.title().isBlank() || req.overview() == null
                || req.overview().isBlank() || req.body() == null || req.body().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, overview and body are required.");
        }
        String tags = DelimitedValues.join(resourceTagService.forUserPost(req.tags()));
        if (req.title().trim().length() > 255 || tags.length() > 1000
                || req.overview().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 65535
                || req.body().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 65535) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title or content exceeds the database limit.");
        }
        resource.publish(userId, req.title().trim(), req.overview().trim(), tags, req.body());
        resource = resourceRepository.save(resource);
        resource.setSiteLink("/resources/" + resource.getResourceId());
        return ResourceDetail.from(resourceRepository.save(resource));
    }

    @Transactional
    public void deletePost(Long id, Long userId) {
        Resource resource = find(id);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again.");
        }
        if (!userId.equals(resource.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator can delete this resource.");
        }
        resourceRepository.deleteUserLinks(id);
        resourceRepository.delete(resource);
    }

    private Specification<Resource> buildSpecification(String query, List<String> tags) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!query.isEmpty()) {
                String searchPattern = "%" + query.toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("siteName")), searchPattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("overview")), searchPattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("tags")), searchPattern)
                ));
            }

            if (!tags.isEmpty()) {
                Predicate[] tagPredicates = tags.stream()
                    .map(tag -> criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("tags")),
                        "%|" + tag + "|%"
                    ))
                    .toArray(Predicate[]::new);
                predicates.add(criteriaBuilder.or(tagPredicates));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private List<String> normalizeTags(List<String> tags) {
        if (tags == null) {
            return List.of();
        }

        return tags.stream()
            .map(String::trim)
            .filter(tag -> !tag.isEmpty())
            .map(tag -> tag.toLowerCase(Locale.ROOT))
            .distinct()
            .toList();
    }

    private Sort sortFor(String sort) {
        return switch (sort) {
            case "az" -> Sort.by(Sort.Direction.ASC, "siteName");
            case "za" -> Sort.by(Sort.Direction.DESC, "siteName");
            default -> Sort.by(Sort.Direction.ASC, "resourceId");
        };
    }
}
