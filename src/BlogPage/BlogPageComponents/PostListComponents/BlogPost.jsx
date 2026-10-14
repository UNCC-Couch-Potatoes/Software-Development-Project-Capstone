import React, {useState, useEffect } from 'react';
import Top from './BlogPostComponents/Top.jsx';
import Content from './BlogPostComponents/Content.jsx';
import ActionBar from './BlogPostComponents/ActionBar.jsx';
import './BlogPost.css';
import blogsData from './blogs.json';


function BlogPost({id}) {
  //Go into the JS and pull out the info with the correct ID.
  console.log(blogsData.posts);
  
  const foundPost = blogsData.posts.find(
      post => post.userID === id
  );
  
  //Objects
  var post = null;
  var author = null;

  //Top
  var name = "";
  var date = "";
  var pfpSource = "";

  //Content 
  var header = "";
  var content = "";

  if (foundPost) {
    post = blogsData.posts[id];
    author = blogsData.users[parseInt(post.userID)];
    name = author.name;
    date = post.datePosted;
    pfpSource = author.profilePicture;
    header = post.title;
    content = post.content
  }

  return (
    <div className='Post'>
        {foundPost ? (
          <>
            <Top
              className="Top"
              id = {id}
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