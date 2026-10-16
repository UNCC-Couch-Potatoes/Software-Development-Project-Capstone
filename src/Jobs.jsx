import { Link } from 'react-router-dom';
// useState imported so the words being searched gets updated
import React, { useState } from 'react';
import './style.css';
// Link imported so website isn't reloaded between pages




function Jobs() {
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Filter panel open/closed and which tags are currently selected
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const jobs = [
      {
          title: 'Game Developer',
          company: 'Example Studios',
          description: 'Develop and maintain games using programming and game development tools.',
          tags: ['Programming', 'Game Development']
      },
      {
          title: '3D Artist',
          company: 'Pixel Games',
          description: 'Create 3D models, environments, and assets for games.',
          tags: ['Art', '3D']
      },
      {
          title: 'Sound Designer',
          company: 'Indie Games Co.',
          description: 'Create sound effects and audio for video games.',
          tags: ['Audio', 'Design']
      }
  ];

  // Every unique tag across all jobs, sorted, used to build the filter buttons
  const allTags = [...new Set(jobs.flatMap((job) => job.tags))].sort();

  // Adds the tag if it isn't selected, removes it if it is
  const toggleTag = (tag) => {
      setSelectedTags((current) =>
          current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
      );
  };

  // Goes through jobs list and returns job(s) that match the typed words
  // AND have at least one of the selected tags (no tags selected = show all)
  const visibleJobs = jobs.filter((job) => {
      const searchable = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      const matchesQuery = searchable.includes(query.toLowerCase());
      const matchesTags =
          selectedTags.length === 0 || job.tags.some((tag) => selectedTags.includes(tag));
      return matchesQuery && matchesTags;
  });

  return (
      <>
          {/* Navbar */}
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
                      placeholder="Search jobs..."
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                  />
              </div>
          </nav>
          <main className="jobs-container">
              <header className="jobs-header">
                  <h1>Jobs</h1>
                  <p>
                      Find jobs and opportunities in game development,
                      art, design, audio, and more.
                  </p>
              </header>
              {/* Filter button that opens/closes the tag panel */}
              <div className="jobs-filter">
                  <button
                      type="button"
                      className="jobs-filter-button"
                      aria-expanded={filterOpen}
                      aria-controls="jobs-filter-panel"
                      onClick={() => setFilterOpen((value) => !value)}
                  >
                      Filter{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
                  </button>
                  {selectedTags.length > 0 && (
                      <button
                          type="button"
                          className="jobs-filter-clear"
                          onClick={() => setSelectedTags([])}
                      >
                          Clear filters
                      </button>
                  )}
                  <div id="jobs-filter-panel" className="jobs-filter-panel" hidden={!filterOpen}>
                      <div className="tag-container">
                          {allTags.map((tag) => (
                              <button
                                  key={tag}
                                  type="button"
                                  className="tag jobs-filter-tag"
                                  aria-pressed={selectedTags.includes(tag)}
                                  onClick={() => toggleTag(tag)}
                              >
                                  {tag}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
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
                          <div className="tag-container">
                              {job.tags.map((tag) => (
                                  <span className="tag" key={tag}>{tag}</span>
                              ))}
                          </div>
                      </article>
                  ))}
                  {visibleJobs.length === 0 && (
                      <div className="job-card">
                          <h2>No jobs found</h2>
                          <p>Try searching for another position or changing your filters.</p>
                      </div>
                  )}
              </section>
          </main>
      </>
  );
}
export default Jobs;