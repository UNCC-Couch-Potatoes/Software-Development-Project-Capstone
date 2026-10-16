import React from 'react'
import LikeButton from './ActionBarComponents/LikeButton.jsx'
import './ActionBar.css'

function ActionBar({postData}) {
  return (
    <div className='ActionBar'> 
        <LikeButton
             className='LikeButton'
             postData = {postData}
         />
    </div>
  )
}

export default ActionBar