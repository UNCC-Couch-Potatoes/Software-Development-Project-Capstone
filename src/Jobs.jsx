import { Link } from 'react-router-dom';
// useState imported so the words being searched gets updated
// useEffect imported so jobs are loaded from the API when the page opens
import React, { useEffect, useState } from 'react';
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


// Type and location are stored in the job's tags, so pull them back out for the card
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const JOB_LOCATIONS = ['Remote', 'On-site'];

// How many jobs show on each page
const PAGE_SIZE = 20;


// Whole-word match so "art" doesn't match "start" or "party"
const hasKeyword = (text, keyword) => {
   const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
};


// Shortens the listing link to just the site name, e.g. "example.com"
function getDomain(siteLink) {
 try {
   return new URL(siteLink).hostname.replace(/^www\./, '');
 } catch {
   return siteLink;
 }
}


// Logic for displaying page numbers (max 5 at a time)
function getPageNumbers(currentPage, totalPages) {
   const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
   const lastPage = Math.min(totalPages, firstPage + 5);

   return Array.from(
       { length: Math.max(0, lastPage - firstPage) },
       (_, index) => firstPage + index
   );
}


// Turns a job from the API into the shape the page uses
const toJob = (job) => ({
   id: job.jobId,
   title: job.jobTitle,
   description: job.jobDescription,
   link: job.siteLink,
   ownerUserId: job.ownerUserId,
   tags: job.jobTags,
   type: job.jobTags.find((t) => JOB_TYPES.includes(t)) || '',
   location: job.jobTags.find((t) => JOB_LOCATIONS.includes(t)) || ''
});


// Blank form used when posting a new job
const EMPTY_FORM = { title: '', type: '', location: '', description: '', link: '', extraTags: '' };


// Fills the form from an existing job; anything that isn't the type or location stays in "other tags"
const jobToForm = (job) => ({
   title: job.title,
   type: job.type,
   location: job.location,
   description: job.description,
   link: job.link,
   extraTags: job.tags.filter((t) => t !== job.type && t !== job.location).join(', ')
});


// Turns the form back into the body the API expects (type and location are saved as tags)
const formToBody = (form) => ({
   jobTitle: form.title.trim(),
   jobDescription: form.description.trim(),
   siteLink: form.link.trim(),
   jobTags: [form.type, form.location, ...form.extraTags.split(',')]
       .map((tag) => tag.trim())
       .filter(Boolean)
});


// Friendly messages for the errors the API can send back
const errorMessage = (status) => {
   if (status === 401) return 'Please log in again.';
   if (status === 400) return 'Please check the fields. The title can be up to 50 characters and the link must start with http:// or https://.';
   if (status === 403) return 'Only the person who posted this job can change it.';
   if (status === 404) return 'This job no longer exists. Refresh the page.';
   if (status === 409) return 'This job has applications, so it cannot be deleted.';
   return 'Unable to complete the request.';
};


// Form used for both posting a new job and editing an existing one
function JobForm({ heading, initial, submitLabel, saving, error, onSave, onCancel }) {
 const [form, setForm] = useState(initial);
 const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

 return (
     <form
         className="job-card job-form"
         onSubmit={(event) => {
             event.preventDefault();
             onSave(form);
         }}
     >
         <h2>{heading}</h2>
         <label>
             Title
             <input type="text" value={form.title} onChange={update('title')} maxLength={50} required />
         </label>
         <div className="job-form-row">
             <label>
                 Job type
                 <select value={form.type} onChange={update('type')}>
                     <option value="">Not specified</option>
                     {JOB_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                 </select>
             </label>
             <label>
                 Location
                 <select value={form.location} onChange={update('location')}>
                     <option value="">Not specified</option>
                     {JOB_LOCATIONS.map((place) => <option key={place} value={place}>{place}</option>)}
                 </select>
             </label>
         </div>
         <label>
             Description
             <textarea value={form.description} onChange={update('description')} rows={5} required />
         </label>
         <label>
             Link to listing (optional)
             <input type="url" value={form.link} onChange={update('link')} pattern="https?://\S+" placeholder="https://example.com/jobs/..." maxLength={2048} />
         </label>
         <label>
             Other tags (optional, separated by commas)
             <input type="text" value={form.extraTags} onChange={update('extraTags')} placeholder="Programming, Unity" />
         </label>
         {error && <p className="job-form-error" role="alert">{error}</p>}
         <div className="job-actions">
             <button type="submit" className="filter-button" disabled={saving}>
                 {saving ? 'Saving...' : submitLabel}
             </button>
             <button type="button" className="filter-clear" onClick={onCancel} disabled={saving}>Cancel</button>
         </div>
     </form>
 );
}


function Jobs() {
 const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
 const [query, setQuery] = useState('');
 const [filterOpen, setFilterOpen] = useState(false);
 const [selectedFilters, setSelectedFilters] = useState([]);

 // Current page (starts at 0)
 const [page, setPage] = useState(0);


 // Jobs come from the database through the API
 const [jobs, setJobs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 // editingId is null (no form open), 'new' (posting a job), or the id of the job being edited
 const [editingId, setEditingId] = useState(null);
 const [saving, setSaving] = useState(false);
 const [formError, setFormError] = useState('');
 const [deletingId, setDeletingId] = useState(null);
 const [actionError, setActionError] = useState('');

 // Current user, so Edit and Delete only show on jobs they posted
 const [userId, setUserId] = useState(null);


 useEffect(() => {
     let cancelled = false;
     fetch('/api/jobs')
         .then((res) => {
             if (!res.ok) throw new Error('Request failed');
             return res.json();
         })
         .then((data) => {
             if (cancelled) return;
             setJobs(data.map(toJob));
         })
         .catch(() => {
             if (!cancelled) setError('Could not load jobs. Please try again later.');
         })
         .finally(() => {
             if (!cancelled) setLoading(false);
         });
     return () => { cancelled = true; };
 }, []);


 const openForm = (id) => {
     setFormError('');
     setActionError('');
     setEditingId(id);
 };


 // Creates a job (POST) or updates one (PUT), then updates the list on the page
 const saveJob = async (form) => {
     const isNew = editingId === 'new';
     setSaving(true);
     setFormError('');
     try {
         const res = await fetch(isNew ? '/api/jobs' : `/api/jobs/${editingId}`, {
             method: isNew ? 'POST' : 'PUT',
             credentials: 'include',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(formToBody(form))
         });
         if (!res.ok) throw new Error(errorMessage(res.status));
         const saved = toJob(await res.json());
         setJobs((current) => isNew
             ? [saved, ...current]
             : current.map((job) => (job.id === saved.id ? saved : job)));
         setEditingId(null);
     } catch (err) {
         setFormError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
     } finally {
         setSaving(false);
     }
 };


 // Asks first, then deletes the job (DELETE) and removes its card
 const deleteJob = async (job) => {
     if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
     setDeletingId(job.id);
     setActionError('');
     try {
         const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE', credentials: 'include' });
         // 404 means it was already deleted, so just remove it from the page
         if (!res.ok && res.status !== 404) throw new Error(errorMessage(res.status));
         setJobs((current) => current.filter((item) => item.id !== job.id));
         if (editingId === job.id) setEditingId(null);
     } catch (err) {
         setActionError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
     } finally {
         setDeletingId(null);
     }
 };


 useEffect(() => {
     let cancelled = false;
     fetch('/api/auth/me', { credentials: 'include' })
         .then((res) => (res.ok ? res.json() : null))
         .then((user) => { if (!cancelled && user) setUserId(user.userId); })
         .catch(() => {});
     return () => { cancelled = true; };
 }, []);


 // Go back to the first page whenever the search or filters change
 useEffect(() => {
     setPage(0);
 }, [query, selectedFilters]);


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
     const searchable = `${job.title} ${job.tags.join(' ')} ${job.description}`;
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


 // Only the jobs for the current page get shown
 const totalPages = Math.ceil(visibleJobs.length / PAGE_SIZE);
 // Clamp so deleting the last job on the last page doesn't leave you on an empty page
 const currentPage = Math.min(page, Math.max(0, totalPages - 1));
 const pagedJobs = visibleJobs.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
 const pageNumbers = getPageNumbers(currentPage, totalPages);

 const goToPage = (nextPage) => {
     setPage(nextPage);
     window.scrollTo({ top: 0, behavior: 'smooth' });
 };


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
                     <button
                         type="button"
                         className="filter-button post-job-button"
                         onClick={() => openForm('new')}
                         disabled={editingId === 'new'}
                     >
                         Post a job
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


                 {/* Form for posting a new job */}
                 {editingId === 'new' && (
                     <JobForm
                         heading="Post a job"
                         initial={EMPTY_FORM}
                         submitLabel="Post job"
                         saving={saving}
                         error={formError}
                         onSave={saveJob}
                         onCancel={() => setEditingId(null)}
                     />
                 )}
                 {actionError && <p className="job-form-error" role="alert">{actionError}</p>}


                 {/* Shows how many jobs are currently being displayed */}
                 {!loading && !error && (
                     <p className="jobs-count">
                         {visibleJobs.length}{' '}
                         {visibleJobs.length === 1 ? 'job' : 'jobs'} found
                     </p>
                 )}
                 {loading && <p className="jobs-count">Loading jobs...</p>}
                 {error && (
                     <div className="job-card">
                         <h2>Something went wrong</h2>
                         <p>{error}</p>
                     </div>
                 )}
                 {/* Creates cards for each job listing on the current page */}
                 {pagedJobs.map((job) => (
                     editingId === job.id ? (
                         <JobForm
                             key={job.id}
                             heading="Edit job"
                             initial={jobToForm(job)}
                             submitLabel="Save changes"
                             saving={saving}
                             error={formError}
                             onSave={saveJob}
                             onCancel={() => setEditingId(null)}
                         />
                     ) : (
                         <article className="job-card" key={job.id}>
                             <h2>
                                 {job.link ? (
                                     <a href={job.link} target="_blank" rel="noopener noreferrer">
                                         {job.title}
                                         <span className="jobs-sr-only"> (opens in a new tab)</span>{' '}
                                         <span aria-hidden="true">↗</span>
                                     </a>
                                 ) : job.title}
                             </h2>
                             {job.link && <span className="job-domain">{getDomain(job.link)}</span>}
                             <h3>{[job.type, job.location].filter(Boolean).join(' · ')}</h3>
                             <p>{job.description}</p>
                             {userId !== null && job.ownerUserId === userId && (
                                 <div className="job-actions">
                                     <button type="button" className="filter-button" onClick={() => openForm(job.id)}>
                                         Edit
                                     </button>
                                     <button
                                         type="button"
                                         className="filter-button job-delete-button"
                                         onClick={() => deleteJob(job)}
                                         disabled={deletingId === job.id}
                                     >
                                         {deletingId === job.id ? 'Deleting...' : 'Delete'}
                                     </button>
                                 </div>
                             )}
                         </article>
                     )
                 ))}
                 {!loading && !error && visibleJobs.length === 0 && (
                     <div className="job-card">
                         <h2>No jobs found</h2>
                         <p>Try searching for another position or clearing your filters.</p>
                     </div>
                 )}

                 {/* Page controls, only shown when there is more than one page */}
                 {!loading && !error && totalPages > 1 && (
                     <nav className="jobs-pagination" aria-label="Job pages">
                         <button
                             type="button"
                             className="filter-button"
                             disabled={currentPage === 0}
                             onClick={() => goToPage(currentPage - 1)}
                         >
                             Previous
                         </button>

                         {pageNumbers.map((pageNumber) => (
                             <button
                                 type="button"
                                 className="filter-button jobs-page-button"
                                 aria-current={pageNumber === currentPage ? 'page' : undefined}
                                 key={pageNumber}
                                 onClick={() => goToPage(pageNumber)}
                             >
                                 {pageNumber + 1}
                             </button>
                         ))}

                         <button
                             type="button"
                             className="filter-button"
                             disabled={currentPage >= totalPages - 1}
                             onClick={() => goToPage(currentPage + 1)}
                         >
                             Next
                         </button>
                     </nav>
                 )}
             </section>
         </main>
     </>
 );
}
export default Jobs;