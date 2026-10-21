package com.ctrlf.api.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import com.ctrlf.api.dto.UpdateProfileRequest;
import com.ctrlf.api.dto.UserProfileResponse;
import com.ctrlf.api.entity.UserProfile;
import com.ctrlf.api.repository.UserProfileRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class AuthProfilePictureTest {
    @Test
    void savesReturnsAndRemovesPicture() {
        UserProfileRepository repo = mock(UserProfileRepository.class);
        UserProfile user = new UserProfile("tester", "test@example.com", "hash", "Test", "User");
        when(repo.findById(1L)).thenReturn(Optional.of(user));
        when(repo.save(user)).thenReturn(user);
        AuthController controller = new AuthController(repo);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession().setAttribute("userId", 1L);
        String picture = "data:image/png;base64,aGVsbG8=";
        var response = controller.updateMe(new UpdateProfileRequest(
            "Test", "User", "", List.of(), List.of(), picture), request);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(picture, user.getProfilePicture());
        assertEquals(picture, ((UserProfileResponse) response.getBody()).profilePicture());
        assertEquals(picture, ((UserProfileResponse) controller.me(request).getBody()).profilePicture());
        controller.updateMe(new UpdateProfileRequest(
            "Test", "User", "", List.of(), List.of(), null), request);
        assertNull(user.getProfilePicture());
    }

    @Test
    void rejectsInvalidOrOversizedPicture() {
        UserProfileRepository repo = mock(UserProfileRepository.class);
        when(repo.findById(1L)).thenReturn(Optional.of(
            new UserProfile("tester", "test@example.com", "hash", "Test", "User")));
        AuthController controller = new AuthController(repo);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession().setAttribute("userId", 1L);
        for (String picture : List.of("https://example.com/image.png", "x".repeat(2_800_001))) {
            var response = controller.updateMe(new UpdateProfileRequest(
                "Test", "User", "", List.of(), List.of(), picture), request);
            assertEquals(400, response.getStatusCode().value());
        }
        verify(repo, never()).save(any());
    }
}
