import React from 'react';
import './style.css'
import { Link } from 'react-router-dom';

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
        </>
    )};

export default Blogs;