package com.ctrlf.api.dto;

import java.util.List;

import com.ctrlf.api.entity.Resource;

public record ResourceResponse(
    List<ResourceItem> resources,
    int page,
    int pageSize,
    int totalPages,
    long totalElements,
    boolean first,
    boolean last
) {
    public record ResourceItem(
        Long resourceId,
        String siteName,
        String overview,
        String siteLink,
        List<String> tags
    ) {
        public static ResourceItem from(Resource resource) {
            return new ResourceItem(
                resource.getResourceId(),
                resource.getSiteName(),
                resource.getOverview(),
                resource.getSiteLink(),
                DelimitedValues.parse(resource.getTags())
            );
        }
    }
}
