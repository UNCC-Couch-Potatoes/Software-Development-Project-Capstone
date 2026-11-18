import React, { Component } from 'react'
import './Top.css'

export default function Top({id, author, date, pfpSource}) {
  return (
    <div className="topContainer">
      <img className ="profilePicture" 
        src = {pfpSource}
        alt = "Profile Picture"
      /> 
      <div className="postInfo">
        <p className='authorName'>{author}</p>
        <p className='datePosted'>{date}</p>
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
