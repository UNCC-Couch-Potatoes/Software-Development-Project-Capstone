package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Notification;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC, n.notificationId DESC")
    List<Notification> findNewest(@Param("userId") Long userId, Pageable page);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.readAt IS NULL")
    long countUnread(@Param("userId") Long userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.readAt IS NULL"
            + " AND n.linkPath = :link AND n.message = :message")
    long countUnreadDuplicates(@Param("userId") Long userId, @Param("link") String link,
            @Param("message") String message);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.readAt = :now WHERE n.notificationId = :id"
            + " AND n.userId = :userId AND n.readAt IS NULL")
    int markRead(@Param("id") Long id, @Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.readAt = :now WHERE n.userId = :userId AND n.readAt IS NULL")
    int markAllRead(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query(value = "SELECT FollowerUser FROM Followers WHERE FollowingUser = :userId", nativeQuery = true)
    List<Long> findFollowerIds(@Param("userId") Long userId);

    @Query(value = "SELECT UserId FROM JamEntrants WHERE JamId = :jamId", nativeQuery = true)
    List<Long> findJamEntrantIds(@Param("jamId") Long jamId);

    @Query(value = "SELECT DISTINCT UserId FROM JobApplication WHERE JobId = :jobId", nativeQuery = true)
    List<Long> findJobApplicantIds(@Param("jobId") Long jobId);
}