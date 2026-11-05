import React from 'react'
import './CreateBlog.css'

function CreateBlog({closeCreateBlog}) {
  return (
    <div>
        <div className="pop-up-container" onClick={(e) => closeCreateBlog()}></div>
        <div id="blog-creation">
            <h1>Create a Blog Post</h1>
            <form>
                <p>Title</p>
            </form>
        </div>
    </div>
  )
}

export default CreateBlog