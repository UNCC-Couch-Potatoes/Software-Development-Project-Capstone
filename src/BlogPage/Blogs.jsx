import React from 'react';
import { Link } from 'react-router-dom';
import PostList from './BlogPageComponents/PostList.jsx';
import FollowingList from './BlogPageComponents/FollowingList.jsx';
import './Blogs.css';

/* 
 * Todos 
 * [x] Populate page with posts along a grid
 * [ ] Make seperate components for 
 *   [/] Top 
 *   [/] Content 
 *   [/] Action Bar
 * [] Start pulling from array for post information 
 * [] Make a following Bar, this should include 
 *      everyone and anyone you follow
 * [] When clicking on a person you following 
 *      filter to be that person
 */
function Blogs(){

    //Grab a the length of the posts array, this will be our limit
    //We will "load" in a handful of posts, if the scroll value reaches
    //a certain point we will reload?

    var userFilteredID = null;
    //function for when a filter occurs 
    const handleFilter = (userID) => {
        userFilteredID = userID;
    }

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
        <FollowingList onFilterChosen={handleFilter}/>
        <PostList userFiltered={userFilteredID}/>
    </div>
    </>
    )};

export default Blogs;