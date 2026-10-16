import React from 'react'
import './FollowingCard.css'

function FollowingCard({user}) {
    //Print out the user and the amount new posts they have 
    //For now have this dummy data 

    user = {
        id: 3,
        name: "Freddy Fazbear",
        profilePicture: "https://static.wikia.nocookie.net/vsdebating/images/d/dd/FREDDY.png",
    }
    const returnUserID = () => {
        return user.id;
    }

  return (
    <div className="followingCard" onClick={() => {console.log("Clicked on user: " + user.name)}}>
        <img src={user.profilePicture} alt={user.name} className="profileIcon"/>
        <p className="userName">{user.name}</p>
        <p className="newPostCount">1{/*TODO: find a way to know what posts were read */}</p>
    </div>
  )
}

export default FollowingCard