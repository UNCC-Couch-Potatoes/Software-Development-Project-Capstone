import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import './style.css'

function Blogs(){
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);

    const [query, setQuery] = useState('');
    
      const blogs = [
          {
              title: 'Project update',
              user: 'Example developer',
              description: 'Finally debugged this part of my game.'
          },
          {
              title: '3D Artist',
              user: 'Game making hobbyist',
              description: 'Just finished rendering this 3D model.'
          },
          {
              title: 'Sound Designer',
              user: 'Short term team',
              description: 'Done with the sound effects for this level.'
          }
      ];
    
      // Goes through blogs list and returns the blog(s) that have the typed words in them
      const visibleBlogs = blogs.filter((blog) => {
          const searchable = `${blog.title} ${blog.user} ${blog.description}`.toLowerCase();
          return searchable.includes(query.toLowerCase());
      });


    return(
    <>
      <nav id="navbar" aria-label="Main navigation">
      <Link to="/">Home</Link>
      <Link to="/blogs">Blogs</Link>
      <Link to="/jams">Jams</Link>
      <Link to="/jobs">Jobs</Link>
      <Link to="/profile">Profile</Link>
      {/* Dropdown feature for resources navbar */}
      {/* Dropdown will appear on hover */}
      <div className="navbar-resources" onMouseEnter={() => setResourceMenuOpen(true)} onMouseLeave={() => setResourceMenuOpen(false)}
      onFocus={
        event => {
          if (event.target.tagName === 'A')
            setResourceMenuOpen(true);
          }
        }
      onBlur={
        event => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setResourceMenuOpen(false);
          }
        }
      onKeyDown={
        event => {
          if (event.key === 'Escape'){
              setResourceMenuOpen(false); event.stopPropagation();
            }
          }
        }>

      {/* React elements for the resource tab and its dropdown*/}
      <div className="navbar-resources-heading">
        <Link to="/resources" onClick={() => setResourceMenuOpen(false)}>Resources</Link>
        {/* For mobile users who can't "hover" over the taskbar there is a physical button that can be pressed instead*/}
        <button type="button" className="navbar-dropdown-toggle" aria-label="Resource navigation" aria-expanded={resourceMenuOpen}
          aria-controls="navbar-resource-links" onClick={() => setResourceMenuOpen(value => !value)}>▾</button>
      </div>

      {/* The Dropdown elements */}
      <div id="navbar-resource-links" className="navbar-dropdown" hidden={!resourceMenuOpen}>
        <Link to="/resources" onClick={() => setResourceMenuOpen(false)}>All resources</Link>
        <Link to="/resources/manage" onClick={() => setResourceMenuOpen(false)}>My resources</Link>
        <Link to="/resources/new" onClick={() => setResourceMenuOpen(false)}>Create a post</Link>
      </div>
    </div>

            <div className="navbar-search">
                <input
                    type="search"
                    placeholder="Search blogs and posts..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
           </div>
        </nav>

        <main className="blogs-container">
              <header className="blogs-header">
                  <h1>Blogs</h1>
                  <p>
                      Find blogs and posts that others developers have made
                  </p>
              </header>
              {/* Shows how many blogs are currently being displayed */}
              <section className="blogs-results">
                  <p className="blogs-count">
                      {visibleBlogs.length}{' '}
                      {visibleBlogs.length === 1 ? 'blog' : 'blogs'} found
                  </p>
                  {/* Creates cards for each blog post */}
                  {visibleBlogs.map((blog) => (
                      <article className="blog-card" key={blog.title}>
                          <h2>{blog.title}</h2>
                          <h3>{blog.user}</h3>
                          <p>{blog.description}</p>
                      </article>
                  ))}
                  {visibleBlogs.length === 0 && (
                      <div className="blog-card">
                          <h2>No blogs found</h2>
                          <p>Try searching for another blog.</p>
                      </div>
                  )}
              </section>
          </main>
        </>
    )};

export default Blogs;