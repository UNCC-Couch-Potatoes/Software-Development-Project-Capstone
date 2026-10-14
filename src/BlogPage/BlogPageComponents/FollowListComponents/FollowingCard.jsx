import React from 'react'
import './FollowingCard.css'

function FollowingCard({user}) {
    //Print out the user and the amount new posts they have 
    //For now have this dummy data 
    user = {
        name: "Freddy Fazbear Freddy Fazbear Freddy Fazbear",
        profilePicture: "https://static.wikia.nocookie.net/vsdebating/images/d/dd/FREDDY.png",
    }

  return (
    <div className="followingCard">
         <img src={user.profilePicture} alt={user.name} className="profilePicture"/>
        <p className="userName">{user.name}</p>
    </div>
  )
}

export default FollowingCard