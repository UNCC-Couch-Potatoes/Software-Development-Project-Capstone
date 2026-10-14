import React from 'react'

export default function Content({id, header, content}) {
  // const charLimit = 100;
  // //ensure content preview doesnt go above char limit 
  // if (content.length > charLimit) { 
  //     //Slice and add '...' to convey there is more to read
  //     content = content.slice(0, charLimit) + '...';
  // } 

  return (
    <div className='Content'>
      <h2 className='Header'> {header} </h2>
      <p className='BlogParagraph'> {content} </p>
  </div>
)
}


