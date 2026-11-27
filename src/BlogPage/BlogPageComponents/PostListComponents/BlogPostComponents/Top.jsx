import React, { Component } from 'react'
import './Top.css'

export default function Top({id, author, date, pfpSource}) {
  const simplyfyDate = ((date) => {
    if (date == null || !date) return '';

    console.log("Simplifying Date:" + date);

    let newDate = new Date(date);

    return `Posted: ${newDate.getFullYear()}/${newDate.getMonth()}/${newDate.getDate()}`;
  });

  return (
    <div className="topContainer">
      <img className ="profilePicture" 
        src = {pfpSource}
        alt = "Profile Picture"
      /> 
      <div className="postInfo">
        <p className='authorName'>{author}</p>
        <p className='datePosted'>{simplyfyDate(date)}</p>
      </div>
      <input 
        type="button" 
        className='button'
        id="followButton" 
        value="Follow"
      />
    </div>
  )
}
