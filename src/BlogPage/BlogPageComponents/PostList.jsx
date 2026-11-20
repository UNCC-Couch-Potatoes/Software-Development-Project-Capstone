import React from 'react';
import BlogPost from './PostListComponents/BlogPost.jsx';
import './PostList.css';
import { useBlogs } from '../BlogsContext.js';


function PostList({
    userFiltered = null,
    showCreatePost
  }) {
  const { blogs: posts, loading, loadError } = useBlogs();
  const postsData = userFiltered == null ? posts
    : posts.filter((post) => String(post.userId) === String(userFiltered));

  return (
    <div id="posts">
      <div id="postsTitle">
        <h1>Posts</h1>
        {/*TODO: Make a component for post creation */}
        <input 
          type="button"
          value="Create Post"
          className='button'
          id ="CreatePostButton"
          onClick={() => {showCreatePost()}}
        />
      </div>
      {loading && <p role="status">Loading posts...</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {!loading && !loadError && postsData.length === 0 && <p>No posts yet.</p>}
      {/* Populate with posts and ID */}
      {postsData.map((post) => (
          <div className='postListing' key={post.blogId}>
            <BlogPost 
              post = {post}
            />
          </div>
        ))}
    </div>
  )
}

export default PostList