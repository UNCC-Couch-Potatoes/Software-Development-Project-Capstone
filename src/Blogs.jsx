import React, { useState } from 'react';
import './style.css'
import { Link } from 'react-router-dom';

function Blogs(){

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
        <div id="navbar">
          <Link to="/">Home</Link>
          <Link to="/Blogs">Blogs</Link>
          <Link to="/Jams">Jams</Link>
          <Link to="/Jobs">Jobs</Link>
          <Link to="/Profile">Profile</Link>
          <Link to="/Resources">Resources</Link>

          <div className="navbar-search">
           <input
               type="search"
               placeholder="Search blogs and posts..."
               value={query}
               onChange={(event) => setQuery(event.target.value)}
           />
           </div>
        </div>

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