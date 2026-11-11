import React from 'react'
import './CreateBlog.css'

function CreateBlog({closeCreateBlog}) {

    function handleSubmit(e){
        e.preventDefault();
        if (e.target.form.title.value === "" || e.target.form.content.value === ""){
            alert("Please fill out all fields");
            return;
        }

        closeCreateBlog();
    }
    return (
        <div>
            <div className="pop-up-container" onClick={(e) => closeCreateBlog()}></div>
            <div id="blog-creation">
                <form className="blog-form" onSubmit={(e) => handleSubmit(e)}>
                    <div className="HeaderBar">
                        <h1>Create a Blog Post</h1>
                        <input 
                            type="submit" 
                            value="Submit" 
                            id="blog-submit"
                            onClick={(e) => handleSubmit(e)}
                        />
                    </div>
                    <label>
                        <input type="text" name="title" placeholder="Title" />
                    </label>
                    <label>
                        <textarea name="content" placeholder="Content"></textarea>
                    </label>
                </form>
            </div>
        </div>
    )
}

export default CreateBlog