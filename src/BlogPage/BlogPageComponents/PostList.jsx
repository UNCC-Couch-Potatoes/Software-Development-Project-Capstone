import React from 'react';
import BlogPost from './PostListComponents/BlogPost.jsx';
import './PostList.css';
import blogsData from './PostListComponents/blogs.json';


function PostList({
    userFiltered = null,
    showCreatePost
  }) {
  //Grab a the length of the posts array, this will be our limit
  //We will "load" in a handful of posts, if the scroll value reaches
  //a certain point we will reload?
  const postCount = blogsData.posts.length;
  const postsData = blogsData.posts;

  return (
    <div id="posts">
      <div id="postsTitle">
        <h1>Posts</h1>
        {/*TODO: Make a component for post creation */}
        <input 
          type="button"
          value="Create Post"
          id ="CreatePostButton"
          onClick={() => {showCreatePost()}}
        />
      </div>
      {/* Populate with posts and ID */}
      {postsData.map((post, index) => (
          <div className='postListing' key={index}>
            <BlogPost 
              post = {post}
            />
          </div>
        ))}
    </div>
  )
}

export default PostList