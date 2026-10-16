package com.ctrlf.api.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import com.ctrlf.api.dto.JobResponse;
import com.ctrlf.api.entity.Job;
import com.ctrlf.api.repository.JobRepository;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class JobService {
   static final int PAGE_SIZE = 20;
   private final JobRepository jobRepository;

   public JobService(JobRepository jobRepository) {
       this.jobRepository = jobRepository;
   }

   public Optional<JobResponse.JobItem> findById(Long id) {
       return jobRepository.findById(id).map(JobResponse.JobItem::from);
   }
   public JobResponse findJobs(String query, List<String> tags, int page, String sort) {
    // Gets page by number, size, and sorting
    Pageable pageable = PageRequest.of(page, PAGE_SIZE, sortFor(sort));
    // if query is null, make normalizedQuery "", else make it query.trim()
    String normalizedQuery = query == null ? "" : query.trim();
    List<String> normalizedTags = normalizeTags(tags);
    // Search and display jobs based on query and tags
    Page<Job> result = jobRepository.findAll(buildSpecification(normalizedQuery, normalizedTags), pageable);
    // Processes list of jobs, converts each job into a job item
    List<JobResponse.JobItem> jobs = result.getContent().stream().map(JobResponse.JobItem::from).toList();
    return new JobResponse(
        jobs,
        result.getNumber(),
        result.getSize(),
        result.getTotalPages(),
        result.getTotalElements(),
        result.isFirst(),
        result.isLast()
    );
}


   private Specification<Job> buildSpecification(
       String query,
       List<String> tags
   ) {
       return (root, criteriaQuery, criteriaBuilder) -> {


           List<Predicate> predicates =
               new ArrayList<>();


           // Search title, company, description, or tags
           if (!query.isEmpty()) {
               String searchPattern =
                   "%" + query.toLowerCase(Locale.ROOT) + "%";


               predicates.add(criteriaBuilder.or(
                   criteriaBuilder.like(
                       criteriaBuilder.lower(
                           root.get("jobTitle")
                       ),
                       searchPattern
                   ),
                   criteriaBuilder.like(
                       criteriaBuilder.lower(
                           root.get("companyName")
                       ),
                       searchPattern
                   ),
                   criteriaBuilder.like(
                       criteriaBuilder.lower(
                           root.get("jobDescription")
                       ),
                       searchPattern
                   ),
                   criteriaBuilder.like(
                       criteriaBuilder.lower(
                           root.get("jobTags")
                       ),
                       searchPattern
                   )
               ));
           }


           // Filter by selected tags
           if (!tags.isEmpty()) {
               Predicate[] tagPredicates =
                   tags.stream()
                       .map(tag -> criteriaBuilder.like(
                           criteriaBuilder.lower(
                               root.get("jobTags")
                           ),
                           "%|" + tag + "|%"
                       ))
                       .toArray(Predicate[]::new);


               predicates.add(
                   criteriaBuilder.or(tagPredicates)
               );
           }


           return criteriaBuilder.and(
               predicates.toArray(new Predicate[0])
           );
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
           case "az" ->
               Sort.by(
                   Sort.Direction.ASC,
                   "jobTitle"
               );


           case "za" ->
               Sort.by(
                   Sort.Direction.DESC,
                   "jobTitle"
               );


           default ->
               Sort.by(
                   Sort.Direction.ASC,
                   "jobId"
               );
       };
   }
}