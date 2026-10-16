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
        <p>{author}</p>
        <p>{date}</p>
      </div>
      <input 
        type="button" 
        className="followButton" 
        value="Follow"
      />
    </div>
  )
}
