package com.ctrlf.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ctrlf.api.entity.Blog;
import com.ctrlf.api.repository.BlogRepository;
import com.ctrlf.api.repository.CommentRepository;
import com.ctrlf.api.repository.CommentThreadRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class BlogServiceDeleteTest {
    private final BlogRepository blogs = mock(BlogRepository.class);
    private final CommentRepository comments = mock(CommentRepository.class);
    private final CommentThreadRepository threads = mock(CommentThreadRepository.class);
    private final BlogService service = new BlogService(blogs, comments, threads);

    @Test
    void deletesLikesRepliesCommentsThenBlog() {
        Blog blog = new Blog("Title", "Body", "", 0, 3, 5L);
        when(blogs.findById(1L)).thenReturn(Optional.of(blog));

        service.delete(1L, 5L);

        InOrder order = inOrder(threads, comments, blogs);
        order.verify(blogs).deleteLikesByBlogId(1L);
        order.verify(threads).deleteByBlogId(1L);
        order.verify(comments).deleteByBlogId(1L);
        order.verify(blogs).delete(blog);
    }

    @Test
    void rejectsDeleteByAnotherUser() {
        when(blogs.findById(1L)).thenReturn(Optional.of(new Blog("T", "B", "", 0, 0, 5L)));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service.delete(1L, 9L));

        assertEquals(HttpStatus.FORBIDDEN, e.getStatusCode());
        verify(comments, never()).deleteByBlogId(1L);
        verify(blogs, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void returnsNotFoundForUnknownBlog() {
        when(blogs.findById(404L)).thenReturn(Optional.empty());

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> service.delete(404L, 5L));

        assertEquals(HttpStatus.NOT_FOUND, e.getStatusCode());
    }
}