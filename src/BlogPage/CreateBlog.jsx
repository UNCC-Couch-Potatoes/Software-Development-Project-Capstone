import React, { useState } from 'react'
import './CreateBlog.css'
import { useBlogs } from './BlogsContext.js';

function CreateBlog({closeCreateBlog}) {
    const { saveBlog, saving } = useBlogs();
    const [formError, setFormError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (saving) return;
        const data = new FormData(e.currentTarget);
        const body = {
            blogTitle: String(data.get('title') || '').trim(),
            blogContent: String(data.get('content') || '').trim()
        };
        if (!body.blogTitle || !body.blogContent) {
            setFormError('Please fill out all fields.');
            return;
        }
        setFormError('');
        try {
            await saveBlog(body);
            closeCreateBlog();
        } catch (err) {
            setFormError(err.message === 'Failed to fetch'
                ? 'Unable to reach the server. Please try again.' : err.message);
        }
    }
    return (
        <div>
            <div className="pop-up-container" onClick={() => { if (!saving) closeCreateBlog(); }}></div>
            <div id="blog-creation">
                <form className="blog-form" onSubmit={handleSubmit}>
                    <div className="HeaderBar">
                        <h1>Create a Blog Post</h1>
                        <input 
                            type="submit" 
                            value={saving ? 'Saving...' : 'Submit'}
                            disabled={saving}
                            className='button'
                            id="blog-submit"
                        />
                    </div>
                    {formError && <p role="alert">{formError}</p>}
                    <label>
                        <input 
                            type="text" 
                            name="title" 
                            placeholder="Title" 
                            required
                            disabled={saving}
                            minLength={1}
                            maxLength={50}
                        />
                    </label>
                    <label>
                        <textarea
                            name="content" 
                            placeholder="Content"
                            required
                            disabled={saving}
                            minLength={1}
                            maxLength={2000}
                        />
                    </label>
                </form>
            </div>
        </div>
    )
}

export default CreateBlog