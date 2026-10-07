import React, { useEffect, useState } from 'react';
// Lets you access other pages without reloading
import { Link } from 'react-router-dom';
import './jobs.css';



const jobTagGroups = [
 { title: 'Development', tags: ['Programming', 'Game Engines'], },
 { title: 'Design', tags: [ '2D/Pixel/Sprite Art', '3D Modeling', '2D Animation', '3D Animation', ], },
 { title: 'Audio', tags: ['Audio', 'Sound Design'], },
];



function Jobs() {
 const [jobs, setJobs] = useState([]);
 const [query, setQuery] = useState('');
 const [selectedTags, setSelectedTags] = useState([]);
 const [filtersOpen, setFiltersOpen] = useState(true);
 const [sort, setSort] = useState('featured');
 const [page, setPage] = useState(0);
 const [pageInfo, setPageInfo] = useState({
   page: 0,
   pageSize: 20,
   totalPages: 0,
   totalElements: 0,
   first: true,
   last: true,
 });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');



 useEffect(() => {
  // For replacing requests as query updates
  const controller = new AbortController();
  const delay = setTimeout(() => {
    const parameters = new URLSearchParams({
      page: String(page),
      query: query.trim(),
      sort,
    });
    
    selectedTags.forEach((tag) => {
      parameters.append('tags', tag);
    });
    
    setLoading(true);
    setError('');

    // Goes to url that matches parameters (converted to a string)
    fetch(`/api/jobs?${parameters.toString()}`, {
      // Connects AbortController object to fetching of url
      signal: controller.signal,
    })
     .then(async (response) => {
       if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`${response.status}`);
       }
       return response.json();
     })
     .then((data) => {
       setJobs(data.jobs || []);
       setPageInfo(data);
     })
     .catch((requestError) => {
       if (requestError.name !== 'AbortError') {
         setJobs([]);
         setError(requestError.message);
       }
     })
     .finally(() => {
       if (!controller.signal.aborted) {
         setLoading(false);
       }
     });
   }, 300);

  // Clean up
   return () => {
    clearTimeout(delay);
    controller.abort();
  };

}, [page, query, selectedTags, sort]);

// Puts user input into query
const handleQueryChange = (event) => {
  setQuery(event.target.value);
  setPage(0);
 };
 
 const handleSortChange = (event) => {
  setSort(event.target.value);
  setPage(0);
}

const toggleTag = (tag) => {
  setSelectedTags((currentTags) => {
    if (currentTags.includes(tag)) {
      // Removes current tag if it's already selected
      return currentTags.filter((currentTag) => currentTag !== tag);
    }
    // Adds tag to currentTags (... is basically currentTags.concat(tag))
    return [...currentTags, tag];
  });
  setPage(0);
};

 const clearFilters = () => {
   setQuery('');
   setSelectedTags([]);
   setPage(0);
 };

 const previousPage = () => {
   if (!pageInfo.first) {
     setPage((currentPage) => currentPage - 1);
   }
 };

 const nextPage = () => {
   if (!pageInfo.last) {
     setPage((currentPage) => currentPage + 1);
   }
 };

 return (
   <div className="jobs-container">
     <nav id="navbar">
       <div className="navbar-links">
         <Link to="/">Home</Link>
         <Link to="/blogs">Blogs</Link>
         <Link to="/jams">Jams</Link>
         <Link to="/jobs">Jobs</Link>
         <Link to="/profile">Profile</Link>
         <Link to="/resources">Resources</Link>
       </div>

       <div className="navbar-search">
         <input
           id="job-search"
           type="text"
           placeholder="Search jobs, companies, or skills..."
           value={query}
           onChange={handleQueryChange}
         />
       </div>
     </nav>

     <header className="jobs-header">
       <div>
         <h1>Game Development Jobs</h1>
         <p> Find jobs and opportunities in game development, programming, art, design, and audio. </p>
       </div>
     </header>

     <div className="jobs-toolbar">
       <button
         type="button"
         className="jobs-filter-toggle"
         onClick={() => setFiltersOpen(!filtersOpen)}
       >
         {filtersOpen ? 'Hide Filters' : 'Show Filters'}
       </button>

       <div className="jobs-sort">
         <label htmlFor="job-sort"> Sort: </label>
         <select
           id="job-sort"
           value={sort}
           onChange={handleSortChange}
         >
           <option value="featured">Featured</option>
           <option value="az">A-Z</option>
           <option value="za">Z-A</option>
         </select>
       </div>
     </div>

     <div className={ filtersOpen ? 'jobs-layout' : 'jobs-layout jobs-layout-collapsed' }>
      {filtersOpen && (
        <aside className="jobs-sidebar">
          <div className="jobs-filter-header">
            <h2>Filters</h2>
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="jobs-clear-filters"
                >
                  Clear
              </button>
             )}
           </div>

           {jobTagGroups.map((group) => (
             <div className="jobs-filter-group" key={group.title}>
               <h3> {group.title}</h3>
               <div className="jobs-filter-tags">
                 {group.tags.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      className={ selected ? 'job-filter-tag selected' : 'job-filter-tag' }
                      aria-pressed={selected}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
         </aside>
       )}
       
       <section className="jobs-results">
        <div className="jobs-results-header">
          <div>
            <h2> Job Listings </h2>
            {!loading && !error && (
               <p>
                 {pageInfo.totalElements} job
                 {/* If 1 listing showing, display "job found", else display "jobs found" */}
                 {pageInfo.totalElements === 1 ? '' : 's'} found
               </p>
             )}
          </div>
        </div>
         
         {loading && (
           <div className="jobs-message">
             <p> Loading jobs... </p>
           </div>
         )}
         
         {!loading && error && (
           <div className="jobs-message jobs-error">
             <p>{error}</p>
             <button
               type="button"
               onClick={() => setPage((currentPage) => currentPage)}
             >
               Try Again
             </button>
           </div>
         )}

         {!loading && !error && jobs.length === 0 && (
           <div className="jobs-message">
             <h3>No jobs found</h3>
             <p> Try changing your search or removing some filters. </p>
             <button
               type="button"
               onClick={clearFilters}
             >
               Clear Filters
             </button>
           </div>
         )}

         {!loading && !error && jobs.length > 0 && (
           <div className="job-list">
             {jobs.map((job) => (
               <article className="job-card" key={job.jobId}>
                 <div className="job-card-content">
                   <h3>{job.jobTitle}</h3>
                   <p className="job-company"> {job.companyName} </p>
                   <p className="job-description"> {job.jobDescription} </p>

                   {job.jobTags && job.jobTags.length > 0 && (
                       <div className="job-tags"> {
                          job.jobTags.map((tag) => (
                          <span className="job-tag" key={tag}> {tag} </span>
                        ))}
                       </div>
                     )}
                 </div>

                 <div className="job-card-footer">
                   {job.siteLink && (
                     <a
                       href={job.siteLink}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="job-apply-button"
                     >
                       View Job
                     </a>
                   )}
                 </div>
               </article>
             ))}
           </div>
         )}
         
         {!loading && !error && pageInfo.totalPages > 1 && (
             <div className="jobs-pagination">
               <button
                 type="button"
                 onClick={previousPage}
                 disabled={pageInfo.first}
               >
                 Previous
               </button>

               <span>
                 Page {pageInfo.page + 1} of{' '}
                 {pageInfo.totalPages}
               </span>

               <button
                 type="button"
                 onClick={nextPage}
                 disabled={pageInfo.last}
               >
                 Next
               </button>
             </div>
           )}
       </section>
     </div>
   </div>
 );
}

export default Jobs;