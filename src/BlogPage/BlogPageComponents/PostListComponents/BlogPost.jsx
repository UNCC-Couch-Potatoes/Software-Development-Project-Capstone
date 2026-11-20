import React from 'react';
import Top from './BlogPostComponents/Top.jsx';
import Content from './BlogPostComponents/Content.jsx';
import ActionBar from './BlogPostComponents/ActionBar.jsx';
import './BlogPost.css';


function BlogPost({post}) {  
  const name = post ? `User ${post.userId}` : '';
  const date = '';
  const pfpSource = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23ddd'/%3E%3Ccircle cx='32' cy='23' r='12' fill='%23888'/%3E%3Cpath d='M8 64a24 24 0 0148 0' fill='%23888'/%3E%3C/svg%3E";
  const header = post?.blogTitle || '';
  const content = post?.blogContent || '';

  return (
    <div className='Post'>
        {post != null ? (
          <>
            <Top
              className="Top"
              id = {post.blogId}
              author = {name}
              date = {date}
              pfpSource = {pfpSource}
            />
            <Content 
              className ="Content"
              header = {header}
              content = {content}
            />
            <ActionBar 
              className = "ActionBar" 
              postData = {post}
            />
          </>
        ) :
        ( 
          <>
            <p>NO CONTENT!</p>
          </>
        )
      }
    </div>
  )
}

export default BlogPost