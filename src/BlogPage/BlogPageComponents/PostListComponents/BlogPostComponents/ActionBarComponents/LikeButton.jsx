import React from 'react'
import './LikeButton.css'

function LikeButton({postData}) {
  //Get the number likes in this array 
  const likeCount = postData.likes ?? postData.usersLiked?.length ?? 0;
  console.log(likeCount);
  return (
    <div className="LikeBox">
        <input 
            type="button"
            value="Like"
            className='button'
            id="LikeButton"
        />
        <p className='Likes'>{likeCount}</p>
    </div>
  )
}

export default LikeButton