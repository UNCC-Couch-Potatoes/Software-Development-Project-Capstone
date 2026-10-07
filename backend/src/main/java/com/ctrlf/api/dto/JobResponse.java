package com.ctrlf.api.dto;
import java.util.List;
import com.ctrlf.api.entity.Job;

public record JobResponse(
   List<JobItem> jobs,
   int page,
   int pageSize,
   int totalPages,
   long totalElements,
   boolean first,
   boolean last
) {
    public record JobItem(
        Long jobId,
        String jobTitle,
        String companyName,
        String jobDescription,
        List<String> jobTags,
        String siteLink
    ) {
        public static JobItem from(Job job) {
            return new JobItem(
                job.getJobId(),
                job.getJobTitle(),
                job.getCompanyName(),
                job.getJobDescription(),
                DelimitedValues.parse(job.getJobTags()),
                job.getSiteLink()
            );
        }
    }
}