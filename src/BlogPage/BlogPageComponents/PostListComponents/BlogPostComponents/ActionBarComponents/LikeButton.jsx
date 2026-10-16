import React from 'react'
import './LikeButton.css'

function LikeButton({postData}) {
  //Get the number likes in this array 
  var likeCount = postData.usersLiked.length;
  console.log(likeCount);
  return (
    <div className="LikeBox">
        <input 
            type="button"
            value="Like"
            className="LikeButton"
        />
        <p className='Likes'>{likeCount}</p>
    </div>
  )
}

export default LikeButton