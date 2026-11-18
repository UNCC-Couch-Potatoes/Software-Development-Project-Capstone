package com.ctrlf.api.service;

import com.ctrlf.api.dto.NotificationFeed;
import com.ctrlf.api.dto.NotificationResponse;
import com.ctrlf.api.entity.Jam;
import com.ctrlf.api.entity.Job;
import com.ctrlf.api.entity.Notification;
import com.ctrlf.api.repository.NotificationRepository;
import com.ctrlf.api.repository.UserProfileRepository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final int FEED_SIZE = 30;

    public static final String POST = "POST";
    public static final String JAM = "JAM";
    public static final String JOB = "JOB";

    private final NotificationRepository repository;
    private final UserProfileRepository users;
    private final TransactionTemplate separateTransaction;

    public NotificationService(NotificationRepository repository, UserProfileRepository users,
            PlatformTransactionManager transactionManager) {
        this.repository = repository;
        this.users = users;
        this.separateTransaction = new TransactionTemplate(transactionManager);
        this.separateTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public NotificationFeed feed(Long userId) {
        List<NotificationResponse> items = repository.findNewest(userId, PageRequest.of(0, FEED_SIZE))
                .stream().map(NotificationResponse::from).toList();
        return new NotificationFeed(repository.countUnread(userId), items);
    }

    public void markRead(Long id, Long userId) {
        repository.markRead(id, userId, LocalDateTime.now(ZoneOffset.UTC));
    }

    public void markAllRead(Long userId) {
        repository.markAllRead(userId, LocalDateTime.now(ZoneOffset.UTC));
    }


    public void jamPosted(Jam jam) {
        deliver(() -> notifyUsers(repository.findFollowerIds(jam.getOwnerUserId()), jam.getOwnerUserId(), JAM,
                nameOf(jam.getOwnerUserId()) + " posted a new jam: " + jam.getJamTitle(), "/jams/" + jam.getJamId()));
    }

    public void jamUpdated(Jam jam) {
        deliver(() -> notifyUsers(repository.findJamEntrantIds(jam.getJamId()), jam.getOwnerUserId(), JAM,
                "The jam you joined was updated: " + jam.getJamTitle(), "/jams/" + jam.getJamId()));
    }

    public void jamJoined(Jam jam, Long joinerId) {
        if (jam.getOwnerUserId() == null) return;
        deliver(() -> notifyUsers(List.of(jam.getOwnerUserId()), joinerId, JAM,
                nameOf(joinerId) + " joined your jam: " + jam.getJamTitle(), "/jams/" + jam.getJamId()));
    }

    public void jobPosted(Job job) {
        if (job.getOwnerUserId() == null) return;
        deliver(() -> notifyUsers(repository.findFollowerIds(job.getOwnerUserId()), job.getOwnerUserId(), JOB,
                nameOf(job.getOwnerUserId()) + " posted a new job: " + job.getJobTitle(), "/jobs"));
    }

    public void jobUpdated(Job job) {
        deliver(() -> notifyUsers(repository.findJobApplicantIds(job.getJobId()), job.getOwnerUserId(), JOB,
                "A job you applied to was updated: " + job.getJobTitle(), "/jobs"));
    }

    public void postPublished(Long authorId, String title, String linkPath) {
        deliver(() -> notifyUsers(repository.findFollowerIds(authorId), authorId, POST,
                nameOf(authorId) + " published a new post: " + title, linkPath));
    }

    private void deliver(Runnable work) {
        try {
            separateTransaction.executeWithoutResult(status -> work.run());
        } catch (RuntimeException ex) {
            log.warn("Could not create notifications", ex);
        }
    }

    private void notifyUsers(Collection<Long> recipients, Long actorId, String type, String message, String link) {
        String text = message.length() > 500 ? message.substring(0, 497) + "..." : message;
        Set<Long> unique = new LinkedHashSet<>(recipients);
        unique.remove(null);
        unique.removeIf(id -> Objects.equals(id, actorId));
        for (Long userId : unique) {
            if (repository.countUnreadDuplicates(userId, link, text) == 0) {
                repository.save(new Notification(userId, type, text, link));
            }
        }
    }

    private String nameOf(Long userId) {
        return users.findById(userId).map(user -> user.getUsername()).orElse("Someone");
    }
}