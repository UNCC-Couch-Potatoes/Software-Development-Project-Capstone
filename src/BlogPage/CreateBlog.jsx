import React from 'react'
import './CreateBlog.css'

function CreateBlog({closeCreateBlog}) {

    const formToBody = (form) => ({
        blogTitle: form.title.value,
        blogContent: form.content.value
        // might need userId idk yet tho 
    });


    const saveBlog = async (form) => {
        //Use context
        //setSaving(true);
        //setFormError('');
        try {
            const res = await fetch('/api/blogs', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formToBody(form))
            });

            if (!res.ok) throw new Error(res.statusText);
            console.log("Blog post created successfully");
            //Use context here too
            //const newBlog = toBlog(await res.json());
            //setJams((current) => [newBlog, ...current]);
        } catch (err) {
            console.error(err);
            //setFormError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
        } finally {
            //Using context
            //setSaving(false);
        }
    };

    function handleSubmit(e){
        e.preventDefault();
        if (e.target.form.title.value === "" || e.target.form.content.value === ""){
            alert("Please fill out all fields");
            return;
        }
        
        //Submit the form data to the backend
        saveBlog(e.target.form);

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