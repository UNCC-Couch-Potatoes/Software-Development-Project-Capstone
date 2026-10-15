import useResourceTags from './useResourceTags';
import ResourceTagGroup from './ResourceTagGroup';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import './resources.css';

//shortening website link 
function getDomain(siteLink) {
  try {
    return new URL(siteLink).hostname.replace(/^www\./, '');
  } catch {
    return siteLink;
  }
}

//logic for displaying page numbers (max 5 at a time)
function getPageNumbers(currentPage, totalPages) {
  const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  const lastPage = Math.min(totalPages, firstPage + 5);

  return Array.from(
    { length: Math.max(0, lastPage - firstPage) },
    (_, index) => firstPage + index
  );
}


function Resources() {
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  const { groups: tagGroups, status: tagsStatus, error: tagsError } = useResourceTags();
  // stores db results
  const [resources, setResources] = useState([]);
  // stores user query results
  const [query, setQuery] = useState('');
  // stores the selected sorting method
  const [sort, setSort] = useState('featured');
  // bool for hiding and revealing tags sidebar
  const [filtersOpen, setFiltersOpen] = useState(true);
  // stores user selected tags
  const [selectedTags, setSelectedTags] = useState([]);
  // stores current page number
  const [page, setPage] = useState(0);
  //stores info for what resources to display based on page 
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    pageSize: 20,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  });

  // storing loading and error logic
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // loading resources from spring boot
  // used when page first opens, when we move to a new page number, or when query, tags, or sorting changes
  useEffect(() => {
    const controller = new AbortController();
    const delay = setTimeout(() => {
      const parameters = new URLSearchParams({
        page: String(page),
        query: query.trim(),
        sort,
      });
      selectedTags.forEach((tag) => parameters.append('tags', tag));

      setLoading(true);
      setError('');

      fetch(`/api/resources?${parameters}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Unable to load resources.');
          }

          return response.json();
        })
        .then((data) => {
          setResources(data.resources);
          setPageInfo(data);
        })
        .catch((requestError) => {
          if (requestError.name !== 'AbortError') {
            setResources([]);
            setError(requestError.message);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [page, query, selectedTags, sort]);


// whenever the query changes
  function handleQueryChange(event) {
    setQuery(event.target.value);
    setPage(0);
  }

// whenver sort method is changed
  function handleSortChange(event) {
    setSort(event.target.value);
    setPage(0);
  }

// handle tag selection logic
  function toggleTag(tag) {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    );
    setPage(0);
  }


  // for clearing all filters button
  function clearFilters() {
    setQuery('');
    setSelectedTags([]);
    setPage(0);
  }

  // getting the total amt of page nums based on resources and pages
  const pageNumbers = getPageNumbers(pageInfo.page, pageInfo.totalPages);

  return (
    <>
      {/* Main navigation */}
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
               placeholder="Search tools, topics, or skills..."
               value={query}
               onChange={handleQueryChange}
           />
       </div>
      </nav>

      {/*Making the initial resources title card */}
      <main className="resources-container">
        <header className="profile-header resources-header">
          <h1>Resources</h1>
          <p>A little help for your next big idea.</p>
          <p>Discover tools, assets, and guides for every stage of making a game.</p>
        </header>

        <div className="resources-toolbar">
          <Link className="resources-button" to="/resources/manage">Create a post</Link>
          {/*button to toggle filters */}
          <button
            type="button"
            className="resources-button"
            aria-expanded={filtersOpen}
            aria-controls="resource-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Show filters'}
            {selectedTags.length > 0 && ` (${selectedTags.length})`}
          </button>

          {/* Sorting tab thing */}
          <div className="resources-sort">
            <label htmlFor="resource-sort">Sort by</label>
            <select id="resource-sort" value={sort} onChange={handleSortChange}>
              <option value="featured">Featured</option>
              <option value="az">Name: A–Z</option>
              <option value="za">Name: Z–A</option>
            </select>
          </div>
        </div>

        {/* Filter tags sidebar (collapsable) */}
        <div className={`resources-layout${filtersOpen ? '' : ' resources-layout-collapsed'}`}>
          <aside
            id="resource-filters"
            className="resources-sidebar"
            hidden={!filtersOpen}
            aria-label="Resource filters"
          >
            <h2>Browse by tag</h2>
            <p>Find resources matching any selected tag.</p>

            <section className="resource-user-made-filter" aria-label="User made resources">
              <h3>Community resources</h3>
              <button type="button" className="tag resources-filter-tag"
                disabled={tagsStatus !== 'ready'} aria-pressed={selectedTags.includes('User Made')}
                onClick={() => toggleTag('User Made')}>User Made</button>
            </section>
            {tagsStatus === 'loading' && <p role="status">Loading tags…</p>}
            {tagsError && <p role="alert">{tagsError}</p>}
            {tagGroups.filter(group => group.title !== 'User Made').map(group => (
              <ResourceTagGroup key={group.title} group={group} selectedTags={selectedTags} onToggle={toggleTag} />
            ))}
            {/* gives user easy way to clear all filters instead of untoggling one by one */}
            <button
              type="button"
              className="resources-button"
              disabled={!selectedTags.length && !query}
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </aside>

          {/*for the actual resources */}
          <section className="resources-results" aria-label="Resources" aria-busy={loading}>
          {!loading && !error && (
            <p className="resources-count" role="status">
              Showing {resources.length} of {pageInfo.totalElements} resources
            </p>
          )}
          {/* displays which tags are currently active*/}
          {!loading && !error && selectedTags.length > 0 && (
            <div className="tag-container resources-selected" aria-label="Selected tags">
              {selectedTags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag} filter`}
                    onClick={() => toggleTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {loading && <p className="resources-message" role="status">Loading resources…</p>}

          {!loading && error && (
            <div className="profile-section resources-empty" role="alert">
              <h2>Resources could not be loaded</h2>
              <p>{error} Make sure the Spring Boot API and MySQL database are running.</p>
            </div>
          )}
          {/* Generating resources that meet criteria */}
          {!loading && !error && resources.map((resource) => (
            <article className="profile-section resource-card" key={resource.resourceId}>
              <h2>
                {resource.siteLink.startsWith('/resources/') ? <Link to={resource.siteLink}>{resource.siteName}</Link> : <a href={resource.siteLink} target="_blank" rel="noopener noreferrer">
                  {resource.siteName}
                  <span className="resources-sr-only"> (opens in a new tab)</span>{' '}
                  <span aria-hidden="true">↗</span>
                </a>}
              </h2>
              <span className="resource-domain" aria-hidden={resource.siteLink.startsWith('/resources/') ? true : undefined}>
                {resource.siteLink.startsWith('/resources/') ? '\u00a0' : getDomain(resource.siteLink)}
              </span>
              <p>{resource.overview}</p>
              <div className="tag-container">
                {resource.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
              </div>
            </article>
          ))}
          {/* If no resources match current criteria letting the user know */}
          {!loading && !error && resources.length === 0 && (
            <div className="profile-section resources-empty">
              <h2>No resources found</h2>
              <p>Try another search or clear your search to see all resources.</p>
              <button type="button" className="resources-button" onClick={clearFilters}>
                Show all resources
              </button>
            </div>
          )}
          {/* If there is more than one page we acn set that up*/}
          {!loading && !error && pageInfo.totalPages > 1 && (
            <nav className="resources-pagination" aria-label="Resource pages">
              <button
                type="button"
                className="resources-button"
                disabled={pageInfo.first}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Previous
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  type="button"
                  className="resources-button resources-page-button"
                  aria-current={pageNumber === pageInfo.page ? 'page' : undefined}
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber + 1}
                </button>
              ))}

              <button
                type="button"
                className="resources-button"
                disabled={pageInfo.last}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </button>
            </nav>
          )}
          </section>
        </div>
      </main>
    </>
  );
}

export default Resources;