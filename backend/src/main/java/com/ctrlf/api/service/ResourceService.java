package com.ctrlf.api.service;

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

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
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
