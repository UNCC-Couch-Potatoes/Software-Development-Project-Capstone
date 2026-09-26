// useState imported so the words being searched gets updated
import React, { useState } from 'react';
import './style.css';
// Link imported so website isn't reloaded between pages
import { Link } from 'react-router-dom';




function Jobs() {
  const [query, setQuery] = useState('');




  const jobs = [
      {
          title: 'Game Developer',
          company: 'Example Studios',
          description: 'Develop and maintain games using programming and game development tools.'
      },
      {
          title: '3D Artist',
          company: 'Pixel Games',
          description: 'Create 3D models, environments, and assets for games.'
      },
      {
          title: 'Sound Designer',
          company: 'Indie Games Co.',
          description: 'Create sound effects and audio for video games.'
      }
  ];




  // Goes through jobs list and returns job(s) that have the typed words in them
  const visibleJobs = jobs.filter((job) => {
      const searchable = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      return searchable.includes(query.toLowerCase());
  });




  return (
      <>
          {/* Navbar */}
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
                      placeholder="Search jobs..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                  />
              </div>
          </div>




          <main className="jobs-container">




              <header className="jobs-header">
                  <h1>Jobs</h1>
                  <p>
                      Find jobs and opportunities in game development,
                      art, design, audio, and more.
                  </p>
              </header>




              {/* Shows how many jobs are currently being displayed */}
              <section className="jobs-results">
                  <p className="jobs-count">
                      {visibleJobs.length}{' '}
                      {visibleJobs.length === 1 ? 'job' : 'jobs'} found
                  </p>




                  {/* Creates cards for each job listing */}
                  {visibleJobs.map((job) => (
                      <article className="job-card" key={job.title}>
                          <h2>{job.title}</h2>
                          <h3>{job.company}</h3>
                          <p>{job.description}</p>
                      </article>
                  ))}




                  {visibleJobs.length === 0 && (
                      <div className="job-card">
                          <h2>No jobs found</h2>
                          <p>Try searching for another position.</p>
                      </div>
                  )}
              </section>
          </main>
      </>
  );
}
export default Jobs;