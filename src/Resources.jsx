
import './style.css'
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
const programming_filters = [
  { id: '1', label: 'Programming' },
  { id: '2', label: 'Music' },
  { id: '3', label: 'Art' },
  { id: '4', label: '...' } 
];
const music_filters = [
  { id: '5', label: 'Basics' },
  { id: '6', label: 'Leads' },
  { id: '7', label: 'Sound Design' },
  { id: '8', label: 'Mixing' },
  { id: '9', label: '...' }
];
const art_filters = [
  { id: '5', label: 'Pixel Art' },
  { id: '6', label: 'Background Design' },
  { id: '7', label: 'Color Theory' },
  { id: '9', label: '...' }
];


function Resources(){
    const [checkedIds, setCheckedIds] = useState([]);
    // 3. Handle checking and unchecking
  const handleCheckboxChange = (id) => {
    setCheckedIds((prevCheckedIds) => {
      if (prevCheckedIds.includes(id)) {
        // Remove ID if it's already in the array
        return prevCheckedIds.filter((itemIds) => itemIds !== id);
      } else {
        // Add ID if it's not in the array
        return [...prevCheckedIds, id];
      }
    });
  };
    return(
    <>
       <div>
         <div id="navbar">
          <Link to="/">Home</Link>
          <Link to="/Blogs">Blogs</Link>
          <Link to="/Jams">Jams</Link>
          <Link to="/Jobs">Jobs</Link>
          <Link to="/Profile">Profile</Link>
          <Link to="/Resources">Resources</Link>
        </div>

        
       </div>
        </>
    )};

export default Resources;