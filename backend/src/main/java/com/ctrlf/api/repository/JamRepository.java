package com.ctrlf.api.repository;

import com.ctrlf.api.entity.Jam;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface JamRepository extends JpaRepository<Jam, Long> {
    // One row per jam that has entrants: [JamId, count]
    @Query(value = "SELECT JamId, COUNT(*) FROM JamEntrants GROUP BY JamId", nativeQuery = true)
    List<Object[]> countEntrantsByJam();

    @Query(value = "SELECT COUNT(*) FROM JamEntrants WHERE JamId = :jamId", nativeQuery = true)
    long countEntrants(@Param("jamId") Long jamId);

    @Query(value = "SELECT COUNT(*) FROM JamEntrants WHERE UserId = :userId AND JamId = :jamId", nativeQuery = true)
    long countEntry(@Param("userId") Long userId, @Param("jamId") Long jamId);

    @Query(value = "SELECT JamId FROM JamEntrants WHERE UserId = :userId", nativeQuery = true)
    List<Long> findJamIdsEnteredBy(@Param("userId") Long userId);

    // Each write is its own transaction, so a failure here can be caught in the service
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO JamEntrants (UserId, JamId) VALUES (:userId, :jamId)", nativeQuery = true)
    int addEntrant(@Param("userId") Long userId, @Param("jamId") Long jamId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM JamEntrants WHERE UserId = :userId AND JamId = :jamId", nativeQuery = true)
    int removeEntrant(@Param("userId") Long userId, @Param("jamId") Long jamId);
}