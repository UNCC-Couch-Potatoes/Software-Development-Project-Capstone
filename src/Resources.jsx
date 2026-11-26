import useResourceTags from './useResourceTags';
import NotificationBell from './NotificationBell';
import ResourceTagGroup from './ResourceTagGroup';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import './resources.css';
import './listings.css';
import './resources-ui.css';

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

// Sort options shown as tabs
const SORT_TABS = [
  { value: 'featured', label: 'Featured' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' }
];

// Picks one of 4 icon colors based on the resource name, so each resource keeps the same color
function iconTone(name) {
  let total = 0;
  for (const char of name || '') total += char.charCodeAt(0);
  return `res-icon-${total % 4}`;
}

// Resources posted on this site start with /resources/
const isInternal = (resource) => resource.siteLink.startsWith('/resources/');


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

  // which resource's link was just copied (shows "Copied!" for a moment)
  const [copiedId, setCopiedId] = useState(null);

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

// whenever sort method is changed
  function changeSort(value) {
    setSort(value);
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

  // copies a resource's link and shows "Copied!" for 2 seconds
  async function copyLink(resource) {
    const link = isInternal(resource)
      ? `${window.location.origin}${resource.siteLink}`
      : resource.siteLink;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(resource.resourceId);
      setTimeout(() => setCopiedId((current) => (current === resource.resourceId ? null : current)), 2000);
    } catch {
      window.prompt('Copy this link:', link);
    }
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
      <NotificationBell />
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
      </nav>

      <main className="listing-page">
        {/* Header banner */}
        <header className="listing-hero">
          <div>
            <span className="listing-kicker">CtrlF · Resource Library</span>
            <h1>A little help for your next big idea.</h1>
            <p>Discover tools, assets, and guides for every stage of making a game.</p>
          </div>
          <div className="listing-hero-actions">
            <Link className="listing-btn listing-btn-primary" to="/resources/new">Share a resource</Link>
            <Link className="listing-btn" to="/resources/manage">My resources</Link>
          </div>
        </header>

        {/* Search, filter toggle, and sort tabs */}
        <section className="listing-toolbar" aria-label="Search and sort">
          <div className="listing-search">
            <label htmlFor="resource-search">Search resources</label>
            <input
              id="resource-search"
              type="search"
              placeholder="Tools, topics, or skills"
              value={query}
              onChange={handleQueryChange}
            />
          </div>

          <button
            type="button"
            className="listing-btn"
            aria-expanded={filtersOpen}
            aria-controls="resource-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Show filters'}
            {selectedTags.length > 0 && ` (${selectedTags.length})`}
          </button>

          <div className="listing-tabs" role="tablist" aria-label="Sort resources">
            {SORT_TABS.map((tab) => (
              <button
                type="button"
                role="tab"
                key={tab.value}
                className="listing-tab"
                aria-selected={sort === tab.value}
                onClick={() => changeSort(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Filter tags sidebar (collapsable) */}
        <div className={`resources-layout res-layout${filtersOpen ? '' : ' resources-layout-collapsed'}`}>
          <aside
            id="resource-filters"
            className="resources-sidebar res-sidebar"
            hidden={!filtersOpen}
            aria-label="Resource filters"
          >
            <h2>Filter by tag</h2>
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
              className="listing-btn"
              disabled={!selectedTags.length && !query}
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </aside>

          {/*for the actual resources */}
          <section className="resources-results res-results" aria-label="Resources" aria-busy={loading}>

          {/* Active filters and result count */}
          <div className="res-active">
            {selectedTags.length > 0 && (
              <>
                <span className="res-active-label">Active:</span>
                {selectedTags.map((tag) => (
                  <button
                    type="button"
                    className="res-chip"
                    key={tag}
                    aria-label={`Remove ${tag} filter`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} <span aria-hidden="true">×</span>
                  </button>
                ))}
                <button type="button" className="res-clear" onClick={clearFilters}>Clear all</button>
              </>
            )}
            {!loading && !error && (
              <p className="listing-count res-count" role="status">
                Showing {resources.length} of {pageInfo.totalElements} resources
              </p>
            )}
          </div>

          {loading && <p className="listing-count" role="status">Loading resources…</p>}

          <div className="res-grid">
            {!loading && error && (
              <div className="listing-card listing-full res-full" role="alert">
                <h2>Resources could not be loaded</h2>
                <p className="listing-description">{error} Make sure the Spring Boot API and MySQL database are running.</p>
              </div>
            )}

            {/* Generating resources that meet criteria */}
            {!loading && !error && resources.map((resource) => {
              const internal = isInternal(resource);
              const userMade = resource.tags.includes('User Made');
              const otherTags = resource.tags.filter((tag) => tag !== 'User Made');

              return (
                <article className="listing-card res-card" key={resource.resourceId}>
                  <div className="res-card-head">
                    <span className={`res-icon ${iconTone(resource.siteName)}`} aria-hidden="true">
                      {(resource.siteName || '?').trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="res-card-title">
                      <h2>
                        {internal ? (
                          <Link to={resource.siteLink}>{resource.siteName}</Link>
                        ) : (
                          <a href={resource.siteLink} target="_blank" rel="noopener noreferrer">
                            {resource.siteName}
                            <span className="resources-sr-only"> (opens in a new tab)</span>
                          </a>
                        )}
                      </h2>
                      <span className="listing-meta">
                        {internal ? 'Posted on CtrlF' : getDomain(resource.siteLink)}
                      </span>
                    </div>
                  </div>

                  {userMade && <span className="res-badge">User made</span>}

                  <p className="listing-description">{resource.overview}</p>

                  {otherTags.length > 0 && (
                    <div className="listing-tags">
                      {otherTags.map((tag) => <span className="listing-tag" key={tag}>{tag}</span>)}
                    </div>
                  )}

                  <div className="listing-footer">
                    {internal ? (
                      <Link className="listing-btn listing-btn-primary" to={resource.siteLink}>Open</Link>
                    ) : (
                      <a
                        className="listing-btn listing-btn-primary"
                        href={resource.siteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open <span aria-hidden="true">↗</span>
                        <span className="resources-sr-only"> {resource.siteName} (opens in a new tab)</span>
                      </a>
                    )}
                    <button type="button" className="listing-btn" onClick={() => copyLink(resource)}>
                      {copiedId === resource.resourceId ? 'Copied!' : 'Copy link'}
                    </button>
                  </div>
                </article>
              );
            })}

            {/* If no resources match current criteria letting the user know */}
            {!loading && !error && resources.length === 0 && (
              <div className="listing-card listing-full res-full">
                <h2>No resources found</h2>
                <p className="listing-description">Try another search or clear your filters to see all resources.</p>
                <div>
                  <button type="button" className="listing-btn" onClick={clearFilters}>
                    Show all resources
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* If there is more than one page we can set that up*/}
          {!loading && !error && pageInfo.totalPages > 1 && (
            <nav className="jobs-pagination res-pagination" aria-label="Resource pages">
              <button
                type="button"
                className="listing-btn"
                disabled={pageInfo.first}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                ← Previous
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  type="button"
                  className={`listing-btn ${pageNumber === pageInfo.page ? 'listing-btn-primary' : ''}`}
                  aria-current={pageNumber === pageInfo.page ? 'page' : undefined}
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber + 1}
                </button>
              ))}

              <button
                type="button"
                className="listing-btn"
                disabled={pageInfo.last}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next →
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