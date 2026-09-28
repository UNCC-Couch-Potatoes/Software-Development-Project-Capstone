import React, { Component } from 'react';
import './BlogPost.css';

export default class BlogPost extends Component {
  render() {
    return (
      <div className='Post'>
        <div className='User'>
          <p>username</p>
        </div>
        <div className='Content'>
          <h2 className='Header'> I am the header </h2>
          <p className='BlogParagraph'> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </div>
        <div className='ActionBar'> 
          <p className='Likes'>like: 123</p>
        </div>
      </div>
    )
  }
}
