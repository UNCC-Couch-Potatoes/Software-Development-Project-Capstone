import { Link } from 'react-router-dom';
// useState imported so the words being searched gets updated
import React, { useState } from 'react';
import './style.css';
// Link imported so website isn't reloaded between pages

// Each filter chip has a label and the keywords that make a job match it
const FILTER_GROUPS = [
    {
        name: 'Role',
        options: [
            { label: 'Programming', keywords: ['programming', 'programmer', 'developer', 'engineer', 'gameplay', 'coding', 'scripting'] },
            { label: 'Art', keywords: ['art', 'artist', '2d', '3d', 'modeling', 'texture', 'animation', 'animator', 'illustration', 'concept'] },
            { label: 'Audio', keywords: ['audio', 'sound', 'music', 'composer', 'sfx'] },
            { label: 'Design', keywords: ['design', 'designer', 'level', 'ui', 'ux', 'systems'] },
            { label: 'Writing', keywords: ['writer', 'writing', 'narrative', 'story', 'dialogue'] },
            { label: 'QA', keywords: ['qa', 'testing', 'tester', 'quality assurance', 'bug'] },
            { label: 'Production', keywords: ['producer', 'production', 'project manager', 'scrum'] },
            { label: 'Marketing', keywords: ['marketing', 'community', 'social media', 'publishing'] }
        ]
    },
    {
        name: 'Job type',
        options: [
            { label: 'Remote', keywords: ['remote', 'work from home'] },
            { label: 'On-site', keywords: ['on-site', 'onsite', 'in-person'] },
            { label: 'Full-time', keywords: ['full-time'] },
            { label: 'Part-time', keywords: ['part-time'] },
            { label: 'Contract', keywords: ['contract', 'freelance'] },
            { label: 'Internship', keywords: ['intern', 'internship', 'entry level', 'junior'] }
        ]
    },
    {
        name: 'Tools',
        options: [
            { label: 'Unity', keywords: ['unity'] },
            { label: 'Unreal', keywords: ['unreal'] },
            { label: 'Godot', keywords: ['godot'] },
            { label: 'Blender', keywords: ['blender'] },
            { label: 'VR/AR', keywords: ['vr', 'ar', 'virtual reality', 'augmented reality'] },
            { label: 'Mobile', keywords: ['mobile', 'ios', 'android'] }
        ]
    }
];

// Whole-word match so "art" doesn't match "start" or "party"
const hasKeyword = (text, keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
};

function Jobs() {
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const jobs = [
      {
          title: 'Game Developer',
          company: 'Example Studios',
          type: 'Full-time',
          location: 'Remote',
          description: 'Develop and maintain games using programming and game development tools. Experience with Unity preferred.'
      },
      {
          title: '3D Artist',
          company: 'Pixel Games',
          type: 'Full-time',
          location: 'On-site',
          description: 'Create 3D models, environments, and assets for games using Blender.'
      },
      {
          title: 'Sound Designer',
          company: 'Indie Games Co.',
          type: 'Contract',
          location: 'Remote',
          description: 'Create sound effects and audio for video games.'
      },
      {
          title: 'Gameplay Engineer',
          company: 'Nova Interactive',
          type: 'Full-time',
          location: 'Remote',
          description: 'Build gameplay systems and tools in Unreal Engine with a small team.'
      },
      {
          title: 'Narrative Writer',
          company: 'Storyforge',
          type: 'Part-time',
          location: 'Remote',
          description: 'Write dialogue, quests, and story content for an RPG.'
      },
      {
          title: 'QA Tester Intern',
          company: 'Bright Byte Studios',
          type: 'Internship',
          location: 'On-site',
          description: 'Test builds, report bugs, and help the team ship a mobile game on iOS and Android.'
      },
      {
          title: 'Level Designer',
          company: 'Lantern Labs',
          type: 'Contract',
          location: 'Remote',
          description: 'Design and prototype levels in Godot for a 2D platformer.'
      },
      {
          title: 'Community Manager',
          company: 'Ember Publishing',
          type: 'Full-time',
          location: 'Remote',
          description: 'Run social media and community events for our indie publishing label.'
      },
      {
          title: 'VR Animator',
          company: 'Orbit Reality',
          type: 'Contract',
          location: 'On-site',
          description: 'Animate characters and create 3D assets for virtual reality experiences.'
      }
  ];

  // Adds or removes a filter from the selected list
  const toggleFilter = (label) => {
      setSelectedFilters((current) =>
          current.includes(label)
              ? current.filter((f) => f !== label)
              : [...current, label]
      );
  };

  // Job must match the typed words AND every filter group that has something selected
  const visibleJobs = jobs.filter((job) => {
      const searchable = `${job.title} ${job.company} ${job.type} ${job.location} ${job.description}`;
      const matchesQuery = searchable.toLowerCase().includes(query.toLowerCase());

      const matchesFilters = FILTER_GROUPS.every((group) => {
          const active = group.options.filter((option) => selectedFilters.includes(option.label));
          if (active.length === 0) return true;
          return active.some((option) =>
              option.keywords.some((keyword) => hasKeyword(searchable, keyword))
          );
      });

      return matchesQuery && matchesFilters;
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
              <section className="jobs-results">
                  {/* Filter button and clear button */}
                  <div className="jobs-toolbar">
                      <button
                          type="button"
                          className="filter-button"
                          aria-expanded={filterOpen}
                          aria-controls="jobs-filter-panel"
                          onClick={() => setFilterOpen((value) => !value)}
                      >
                          Filter{selectedFilters.length > 0 && ` (${selectedFilters.length})`}
                      </button>
                      {selectedFilters.length > 0 && (
                          <button
                              type="button"
                              className="filter-clear"
                              onClick={() => setSelectedFilters([])}
                          >
                              Clear filters
                          </button>
                      )}
                  </div>

                  {/* Filter panel, opened by the filter button */}
                  <div id="jobs-filter-panel" className="filter-panel" hidden={!filterOpen}>
                      {FILTER_GROUPS.map((group) => (
                          <div className="filter-group" key={group.name}>
                              <span className="filter-group-label">{group.name}</span>
                              <div className="filter-group-chips">
                                  {group.options.map((option) => (
                                      <button
                                          type="button"
                                          key={option.label}
                                          className={`filter-chip ${selectedFilters.includes(option.label) ? 'active' : ''}`}
                                          aria-pressed={selectedFilters.includes(option.label)}
                                          onClick={() => toggleFilter(option.label)}
                                      >
                                          {option.label}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Shows how many jobs are currently being displayed */}
                  <p className="jobs-count">
                      {visibleJobs.length}{' '}
                      {visibleJobs.length === 1 ? 'job' : 'jobs'} found
                  </p>
                  {/* Creates cards for each job listing */}
                  {visibleJobs.map((job) => (
                      <article className="job-card" key={job.title}>
                          <h2>{job.title}</h2>
                          <h3>{job.company} · {job.type} · {job.location}</h3>
                          <p>{job.description}</p>
                      </article>
                  ))}
                  {visibleJobs.length === 0 && (
                      <div className="job-card">
                          <h2>No jobs found</h2>
                          <p>Try searching for another position or clearing your filters.</p>
                      </div>
                  )}
              </section>
          </main>
      </>
  );
}
export default Jobs;