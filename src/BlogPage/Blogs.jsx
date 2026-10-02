import React from 'react';
import { Link } from 'react-router-dom';
import BlogPost from './BlogPost.jsx';
import './Blogs.css';

/* 
 * Todos 
 * [x] Populate page with posts along a grid
 * [ ] Make seperate components for 
 *   [ ] Top 
 *   [ ] Content 
 *   [ ] Action Bar
 */
function Blogs(){
    return(
    <>
    <div id="navbar">
        <Link to="/">Home</Link>
        <Link to="/Blogs">Blogs</Link>
        <Link to="/Jams">Jams</Link>
        <Link to="/Jobs">Jobs</Link>
        <Link to="/Profile">Profile</Link>
        <Link to="/Resources">Resources</Link>
    </div>
    <div id="blog-page">
        <div id="following">
        Following
        </div>

        <div id="posts">
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        </div>
    </div>
    </>
    )};

export default Blogs;