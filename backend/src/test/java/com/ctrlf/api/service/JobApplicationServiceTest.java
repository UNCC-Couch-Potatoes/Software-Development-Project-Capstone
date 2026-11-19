package com.ctrlf.api.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ctrlf.api.entity.Job;
import com.ctrlf.api.entity.JobApplication;
import com.ctrlf.api.repository.JobApplicationRepository;
import com.ctrlf.api.repository.JobRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {
    @Mock private JobApplicationRepository applications;
    @Mock private JobRepository jobs;
    @Mock private NotificationService notifications;
    @InjectMocks private JobApplicationService service;

    private Job jobOwnedBy(Long owner) {
        return new Job(owner, "Artist", "Draw things", "", "");
    }

    @Test
    void savesTheApplicationAndNotifiesThePoster() {
        Job job = jobOwnedBy(2L);
        when(jobs.findById(4L)).thenReturn(Optional.of(job));
        when(applications.countApplication(5L, 4L)).thenReturn(0L);

        service.apply(4L, 5L);

        verify(applications).save(any(JobApplication.class));
        verify(notifications).jobApplied(job, 5L);
    }

    @Test
    void ignoresARepeatApplication() {
        when(jobs.findById(4L)).thenReturn(Optional.of(jobOwnedBy(2L)));
        when(applications.countApplication(5L, 4L)).thenReturn(1L);

        service.apply(4L, 5L);

        verify(applications, never()).save(any(JobApplication.class));
        verify(notifications, never()).jobApplied(any(), any());
    }

    @Test
    void rejectsApplyingToYourOwnJob() {
        when(jobs.findById(4L)).thenReturn(Optional.of(jobOwnedBy(5L)));
        assertThatThrownBy(() -> service.apply(4L, 5L)).isInstanceOf(ResponseStatusException.class);
        verify(applications, never()).save(any(JobApplication.class));
    }

    @Test
    void rejectsAMissingJob() {
        when(jobs.findById(4L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.apply(4L, 5L)).isInstanceOf(ResponseStatusException.class);
    }
}