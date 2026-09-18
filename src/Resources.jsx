import { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';


// Curated summaries keep previews reliable without fetching third-party pages.
const resources = [
  { name: 'Godot Engine', url: 'https://godotengine.org/', tags: ['Programming', 'Game Engines', '2D', '3D'], description: 'An open-source engine for creating 2D and 3D games. Explore its scene-based workflow, scripting tools, documentation, and community resources to bring your next project to life.' },
  { name: 'Kenney', url: 'https://kenney.nl/', tags: ['Art', 'Assets', '2D', '3D'], description: 'Browse game assets, starter kits, and tools for building your next game. A useful starting point when you need artwork for a prototype or a foundation for a new project.' },
  { name: 'Red Blob Games', url: 'https://www.redblobgames.com/', tags: ['Programming', 'Tutorials', 'Game Design'], description: 'Interactive explanations of the math and algorithms behind games. Learn about pathfinding, hexagonal grids, procedural maps, and more through visual examples and implementation guides.' },
  { name: 'Freesound', url: 'https://freesound.org/', tags: ['Audio', 'Sound Design', 'Assets'], description: 'Explore a community library of sound recordings for effects, ambience, and audio experiments. Check each sound’s license and attribution requirements before using it in your game.' },
];

// tags for any categories that we may want to have
const tagGroups = [
  { title: 'Development', tags: ['Programming', 'Game Engines', 'Game Design', 'Tutorials'] },
  { title: 'Art & assets', tags: ['Art', 'Assets', '2D', '3D'] },
  { title: 'Audio', tags: ['Audio', 'Sound Design'] },
];

function Resources() {
  // checking which filters are available to choose
  const [filtersOpen, setFiltersOpen] = useState(true);
  // storing which tags user has selected
  const [selectedTags, setSelectedTags] = useState([]);
  //for searching
  const [query, setQuery] = useState('');
  // sorting resources by the specified constraint
  const [sort, setSort] = useState('featured');

  // logic for selecting and unselecting a tag
  const toggleTag = (tag) => setSelectedTags((current) =>
    current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
  );

  // for the reset filters button
  const resetFilters = () => { setSelectedTags([]); setQuery(''); };

  // constraints for showing resources based on tags selected and search query
  const visibleResources = resources.filter((resource) => {
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => resource.tags.includes(tag));
    const searchable = `${resource.name} ${resource.description} ${resource.tags.join(' ')}`.toLowerCase();
    return matchesTags && searchable.includes(query.trim().toLowerCase());
  });

  // changning between sorting constraints
  if (sort !== 'featured') visibleResources.sort((a, b) =>
    sort === 'az' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  return (
    <>
      {/* navbar (will be switched to its own file once we get around to it :p) */}
      <div id="navbar">
        <Link to="/">Home</Link>
        <Link to="/Blogs">Blogs</Link>
        <Link to="/Jams">Jams</Link>
        <Link to="/Jobs">Jobs</Link>
        <Link to="/Profile" >Profile</Link>
        <Link to="/Resources">Resources</Link>
      </div>

      {/*Making the initial resources title card */}
      <main className="resources-container">
        <header className="profile-header resources-header">
          <h1>Resources</h1>
          <p>A little help for your next big idea.</p>
          <p>Discover tools, assets, and guides for every stage of making a game.</p>
        </header>

        <div className="resources-toolbar">
          {/*button to toggle filters */}
          <button type="button" className="resources-button" aria-expanded={filtersOpen}
            aria-controls="resource-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
            {filtersOpen ? 'Hide filters' : 'Show filters'}{selectedTags.length > 0 && ` (${selectedTags.length})`}
          </button>

          {/*Search bar space */}
          <div className="resources-search">
            <label htmlFor="resource-search">Search resources</label>
            <input id="resource-search" type="search" placeholder="Search tools, topics, or skills…"
              value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>

          {/* Sorting tab thing */}
          <div className="resources-sort">
            <label htmlFor="resource-sort">Sort by</label>
            <select id="resource-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="az">Name: A–Z</option>
              <option value="za">Name: Z–A</option>
            </select>
          </div>
        </div>
        {/* Filter tags sidebar (collapsable) */}
        <div className={`resources-layout${filtersOpen ? '' : ' resources-layout-collapsed'}`}>
          <aside id="resource-filters" className="resources-sidebar" hidden={!filtersOpen} aria-label="Resource filters">
            
            <h2>Browse by tag</h2>
            <p>Find resources matching any selected tag.</p>
            
            {/*Makes a space for each tag category and individual tags */}
            {tagGroups.map((group) => (
              <details key={group.title} open className="resources-filter-group">
                <summary>{group.title}</summary>
                <div className="tag-container">
                  {group.tags.map((tag) => (
                    <button key={tag} type="button" className="tag resources-filter-tag"
                      aria-pressed={selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>{tag}</button>
                  ))}
                </div>
              </details>
            ))}

            {/* gives user easy way to clear all filters instead of untoggling one by one */}
            <button type="button" className="resources-button" disabled={!selectedTags.length && !query}
              onClick={resetFilters}>Clear filters</button>
          </aside>
          
          {/*for the actual resources */}
          <section className="resources-results" aria-label="Resources">

            {/* displays current amount of resources being displayed*/}
            <p className="resources-count" role="status">{visibleResources.length} {visibleResources.length === 1 ? 'resource' : 'resources'} found</p>
            
            {/* displays which tags are currently active*/}
            {selectedTags.length > 0 && (
              <div className="tag-container resources-selected" aria-label="Selected tags">
                {selectedTags.map((tag) => (
                  <span className="tag" key={tag}>{tag}<button type="button" aria-label={`Remove ${tag} filter`}
                    onClick={() => toggleTag(tag)}>×</button></span>
                ))}
              </div>
            )}

            {/* Generating resources that meet criteria */}
            {visibleResources.map((resource) => (
              <article className="profile-section resource-card" key={resource.url}>
                <h2><a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.name}<span className="resources-sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span></a></h2>
                <span className="resource-domain">{new URL(resource.url).hostname.replace(/^www\./, '')}</span>
                <p>{resource.description}</p>
                <div className="tag-container">{resource.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
              </article>
            ))}

            {/* If no resources match current criteria letting the user know */}
            {visibleResources.length === 0 && (
              <div className="profile-section resources-empty">
                <h2>No resources found</h2>
                <p>Try another search or clear your filters to explore all resources.</p>
                <button type="button" className="resources-button" onClick={resetFilters}>Show all resources</button>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default Resources;
