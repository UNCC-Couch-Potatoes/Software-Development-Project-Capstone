import {React, useState} from 'react';
import { Link } from 'react-router-dom';
import PostList from './BlogPageComponents/PostList.jsx';
import FollowingList from './BlogPageComponents/FollowingList.jsx';
import './Blogs.css';
import CreateBlog from './CreateBlog.jsx';

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
    
    const [createPostVisible, setCreatePostVisible] = useState(false);
    //Grab a the length of the posts array, this will be our limit
    //We will "load" in a handful of posts, if the scroll value reaches
    //a certain point we will reload?
    var userFilteredID = null;
    //function for when a filter occurs 
    const handleFilter = (userID) => {
        userFilteredID = userID;
    }

    const showCreatePost = () => {
        setCreatePostVisible(true);
        console.log("Create Post Button Clicked");
        console.log("Create post form should be toggled to" + createPostVisible);
    };

    const  hideCreatePost = () => {
        setCreatePostVisible(false);
        console.log("Outside clicked");
        console.log("Create post form should be toggled to" + createPostVisible);
    };

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
        {createPostVisible ? (
            <CreateBlog id="blog-creation" 
                closeCreateBlog={hideCreatePost} 
            />
        ):(<></>)}
    
        <div id="blog-page">
            <FollowingList onFilterChosen={handleFilter}/>
            <PostList 
                userFiltered={userFilteredID}
                showCreatePost={showCreatePost}
            />
        </div>
    </>
    );
}

export default Blogs;