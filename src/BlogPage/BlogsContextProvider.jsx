import React, { useEffect, useRef, useState } from 'react';
import { BlogsContext } from './BlogsContext.js';

async function responseError(res, fallback) {
    if (res.status === 401) return 'Please log in again before creating a post.';
    const error = await res.json().catch(() => null);
    return error?.detail || error?.message || `${fallback} (${res.status}). Please try again.`;
}

function BlogsContextProvider({ children }) {
    const [blogs, setBlogs] = useState([]);
    const [following] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState(null);
    const savingRef = useRef(false);
    const createdBlogs = useRef(new Map());

    //Make a call to set the current user id, no user id it is set to null
    useEffect(() => {
     let cancelled = false;
     fetch('/api/auth/me', { credentials: 'include' })
         .then((res) => (res.ok ? res.json() : null))
         .then((user) => { if (!cancelled && user) setUserId(user.userId); })
         .catch(() => {});
     return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        async function loadBlogs() {
            try {
                const res = await fetch('/api/blogs', {
                    credentials: 'include', signal: controller.signal
                });
                if (!res.ok) throw new Error(await responseError(res, 'Unable to load blog posts'));
                const data = await res.json();
                if (!controller.signal.aborted) {
                    const merged = new Map(data.map((blog) => [blog.blogId, blog]));
                    createdBlogs.current.forEach((blog, id) => merged.set(id, blog));
                    setBlogs([...merged.values()].sort((a, b) => b.blogId - a.blogId));
                }
            } catch (err) {
                if (!controller.signal.aborted) setLoadError(err.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadBlogs();
        return () => controller.abort();
    }, []);

    async function saveBlog({ blogTitle, blogContent }) {
        if (savingRef.current) throw new Error('A post is already being saved.');
        const body = {
            blogTitle: String(blogTitle || '').trim(),
            blogContent: String(blogContent || '').trim(),
            datePosted: new Date().toISOString(),
            userId: userId
        };

        console.log(body.datePosted);
        
        if (!body.blogTitle || !body.blogContent) throw new Error('Please fill out all fields.');
        if (body.blogTitle.length > 50) throw new Error('Title must be 1 to 50 characters.');
        savingRef.current = true;
        setSaving(true);
        try {
            const res = await fetch('/api/blogs', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(await responseError(res, 'Unable to create post'));
            const newBlog = await res.json();
            createdBlogs.current.set(newBlog.blogId, newBlog);
            setBlogs((current) => [newBlog, ...current.filter((blog) => blog.blogId !== newBlog.blogId)]);
            return newBlog;
        } catch (err) {
            if (err.message === 'Failed to fetch') {
                throw new Error('Unable to reach the server. Please try again.');
            }
            throw err;
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    return (
        <BlogsContext.Provider value={{ blogs, following, saveBlog, loading, loadError, saving }}>
            {children}
        </BlogsContext.Provider>
    );
}

export default BlogsContextProvider;
