package com.ctrlf.api.dto;
import com.ctrlf.api.entity.Resource;
import java.util.List;
public record ResourceDetail(Long resourceId, String siteName, String overview, String siteLink,
                             List<String> tags, String body, Long ownerUserId) {
    public static ResourceDetail from(Resource r) {
        return new ResourceDetail(r.getResourceId(), r.getSiteName(), r.getOverview(), r.getSiteLink(),
            DelimitedValues.parse(r.getTags()), r.getBody(), r.getOwnerUserId());
    }
}
