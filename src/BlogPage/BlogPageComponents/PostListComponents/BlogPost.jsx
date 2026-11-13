import React, {useState, useEffect } from 'react';
import Top from './BlogPostComponents/Top.jsx';
import Content from './BlogPostComponents/Content.jsx';
import ActionBar from './BlogPostComponents/ActionBar.jsx';
import './BlogPost.css';
import blogsData from './blogs.json';


function BlogPost({post}) {  
  //Objects
  var author = null;

  //Top
  var name = "";
  var date = "";
  var pfpSource = "";

  //Content 
  var header = "";
  var content = "";

  if (post != null){
    author = blogsData.users[parseInt(post.userID)];
    name = author.name;
    date = post.datePosted;
    pfpSource = author.profilePicture;
    header = post.title;
    content = post.content
  }

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