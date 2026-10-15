import React from 'react'
import './FollowingList.css'
import FollowingCard from './FollowListComponents/FollowingCard'

function FollowingList(onFilterChosen) {
  //Filter feature for when one of these cards is clicked
  const handleFilterClick = (userID) => {
    onFilterChosen(userID);
  };

  return (
      <div id="following">
          <h1 id="followingTitle">FollowingList</h1>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
          <FollowingCard/>
      </div>
  )
}

export default FollowingList