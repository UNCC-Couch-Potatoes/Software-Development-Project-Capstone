import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import useFollowing from './useFollowing';
// useState imported so the words being searched gets updated
// useEffect imported so jobs are loaded from the API when the page opens
import React, { useEffect, useState } from 'react';
import { useCollabs, CollabPostForm, CollabList } from './Collabs';
import './style.css';
// Link imported so website isn't reloaded between pages
import './listings.css';

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


const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const JOB_LOCATIONS = ['Remote', 'On-site'];

const PAGE_SIZE = 20;


const hasKeyword = (text, keyword) => {
   const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
};


function getDomain(siteLink) {
 try {
   return new URL(siteLink).hostname.replace(/^www\./, '');
 } catch {
   return siteLink;
 }
}


function getPageNumbers(currentPage, totalPages) {
   const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
   const lastPage = Math.min(totalPages, firstPage + 5);

   return Array.from(
       { length: Math.max(0, lastPage - firstPage) },
       (_, index) => firstPage + index
   );
}


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


const EMPTY_FORM = { title: '', type: '', location: '', description: '', link: '', extraTags: '' };


const jobToForm = (job) => ({
   title: job.title,
   type: job.type,
   location: job.location,
   description: job.description,
   link: job.link,
   extraTags: job.tags.filter((t) => t !== job.type && t !== job.location).join(', ')
});


const formToBody = (form) => ({
   jobTitle: form.title.trim(),
   jobDescription: form.description.trim(),
   siteLink: form.link.trim(),
   jobTags: [form.type, form.location, ...form.extraTags.split(',')]
       .map((tag) => tag.trim())
       .filter(Boolean)
});


const errorMessage = (status) => {
   if (status === 401) return 'Please log in again.';
   if (status === 400) return 'Please check the fields. The title can be up to 50 characters and the link must start with http:// or https://.';
   if (status === 403) return 'Only the person who posted this job can change it.';
   if (status === 404) return 'This job no longer exists. Refresh the page.';
   if (status === 409) return 'This job has applications, so it cannot be deleted.';
   return 'Unable to complete the request.';
};


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

 const [page, setPage] = useState(0);


 const [jobs, setJobs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 const [editingId, setEditingId] = useState(null);
 const [saving, setSaving] = useState(false);
 const [formError, setFormError] = useState('');
 const [deletingId, setDeletingId] = useState(null);
 const [actionError, setActionError] = useState('');

 const [userId, setUserId] = useState(null);

 const collab = useCollabs('JOB', userId);
 const { followingIds, busyId: followBusyId, followError, toggleFollow } = useFollowing(userId);

 const [appliedIds, setAppliedIds] = useState([]);
 const [applyingId, setApplyingId] = useState(null);

 useEffect(() => {
     if (userId === null) { setAppliedIds([]); return undefined; }
     let cancelled = false;
     fetch('/api/job-applications/mine', { credentials: 'include' })
         .then((res) => (res.ok ? res.json() : []))
         .then((ids) => { if (!cancelled) setAppliedIds(ids); })
         .catch(() => {});
     return () => { cancelled = true; };
 }, [userId]);

 const applyToJob = async (job) => {
     setApplyingId(job.id);
     setActionError('');
     try {
         const res = await fetch(`/api/job-applications/job/${job.id}`, { method: 'POST', credentials: 'include' });
         if (!res.ok) throw new Error(res.status === 401 ? 'Please log in to apply.' : 'Could not submit your application. Please try again.');
         setAppliedIds((current) => [...new Set([...current, job.id])]);
     } catch (err) {
         setActionError(err.message === 'Failed to fetch' ? 'Could not reach the server.' : err.message);
     } finally {
         setApplyingId(null);
     }
 };


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


 useEffect(() => {
     setPage(0);
 }, [query, selectedFilters]);


 const toggleFilter = (label) => {
     setSelectedFilters((current) =>
         current.includes(label)
             ? current.filter((f) => f !== label)
             : [...current, label]
     );
 };


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


 const totalPages = Math.ceil(visibleJobs.length / PAGE_SIZE);
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
             <NotificationBell />
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
                         if (event.key === 'Escape') {
                             setResourceMenuOpen(false); event.stopPropagation();
                         }
                     }
                 }>

                 <div className="navbar-resources-heading">
                     <Link to="/resources" onClick={() => setResourceMenuOpen(false)}>Resources</Link>
                     <button type="button" className="navbar-dropdown-toggle" aria-label="Resource navigation" aria-expanded={resourceMenuOpen}
                         aria-controls="navbar-resource-links" onClick={() => setResourceMenuOpen(value => !value)}>▾</button>
                 </div>

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
                     <span className="listing-kicker">Ctrl+F · Opportunities</span>
                     <h1>Find your next game dev role.</h1>
                     <p>
                         Find jobs and opportunities in game development,
                         art, design, audio, and more.
                     </p>
                 </div>
                 <div className="listing-hero-actions">
                     <button
                         type="button"
                         className="listing-btn listing-btn-primary"
                         onClick={() => openForm('new')}
                         disabled={editingId === 'new'}
                     >
                         Post a job
                     </button>
                     <button
                         type="button"
                         className="listing-btn"
                         onClick={() => collab.openForm('new')}
                         disabled={collab.editingId === 'new'}
                     >
                         Post a collab
                     </button>
                 </div>
             </header>

             {/* Search and filters */}
             <section className="listing-toolbar" aria-label="Search and filters">
                 <div className="listing-search">
                     <label htmlFor="jobs-search">Search jobs</label>
                     <input
                         id="jobs-search"
                         type="search"
                         placeholder="Title, skill, or tag"
                         value={query}
                         onChange={(event) => setQuery(event.target.value)}
                     />
                 </div>
                 <button
                     type="button"
                     className="listing-btn"
                     aria-expanded={filterOpen}
                     aria-controls="jobs-filter-panel"
                     onClick={() => setFilterOpen((value) => !value)}
                 >
                     Filter{selectedFilters.length > 0 && ` (${selectedFilters.length})`}
                 </button>
                 {selectedFilters.length > 0 && (
                     <button
                         type="button"
                         className="listing-btn"
                         onClick={() => setSelectedFilters([])}
                     >
                         Clear filters
                     </button>
                 )}
             </section>

             <div id="jobs-filter-panel" className="filter-panel" hidden={!filterOpen}>
                 {FILTER_GROUPS.map((group) => (
                     <div className="listing-filter-group" key={group.name}>
                         <span className="listing-filter-label">{group.name}</span>
                         <div className="listing-filter-chips">
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
             <CollabPostForm collab={collab} />
             {(actionError || followError) && <p className="listing-error" role="alert">{actionError || followError}</p>}

             {!loading && !error && (
                 <p className="listing-count">
                     {visibleJobs.length}{' '}
                     {visibleJobs.length === 1 ? 'job' : 'jobs'} found
                     {selectedFilters.length > 0 && ` · ${selectedFilters.join(', ')}`}
                 </p>
             )}
             {loading && <p className="listing-count">Loading jobs...</p>}

             {/* Job cards */}
             <div className="listing-grid">
                 {error && (
                     <div className="listing-card listing-full">
                         <h2>Something went wrong</h2>
                         <p className="listing-description">{error}</p>
                     </div>
                 )}

                 {pagedJobs.map((job) => {
                     if (editingId === job.id) {
                         return (
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
                         );
                     }

                     const meta = [job.link ? getDomain(job.link) : '', job.type, job.location]
                         .filter(Boolean)
                         .join(' · ');
                     const otherTags = job.tags.filter((tag) => tag !== job.type && tag !== job.location);
                     const isOwner = userId !== null && job.ownerUserId === userId;
                     const canApply = userId !== null && job.ownerUserId !== null && job.ownerUserId !== undefined && !isOwner;

                     return (
                         <article className="listing-card" key={job.id}>
                             <h2>
                                 {job.link ? (
                                     <a href={job.link} target="_blank" rel="noopener noreferrer">
                                         {job.title}
                                         <span className="jobs-sr-only"> (opens in a new tab)</span>{' '}
                                         <span aria-hidden="true">↗</span>
                                     </a>
                                 ) : job.title}
                             </h2>
                             {meta && <p className="listing-meta">{meta}</p>}
                             <p className="listing-description">{job.description}</p>
                             {otherTags.length > 0 && (
                                 <div className="listing-tags">
                                     {otherTags.map((tag) => (
                                         <span className="listing-tag" key={tag}>{tag}</span>
                                     ))}
                                 </div>
                             )}

                             {canApply && (
                                 <div className="listing-footer">
                                     <button
                                         type="button"
                                         className="listing-btn listing-btn-primary"
                                         onClick={() => applyToJob(job)}
                                         disabled={applyingId === job.id || appliedIds.includes(job.id)}
                                     >
                                         {applyingId === job.id ? 'Applying...' : appliedIds.includes(job.id) ? 'Applied' : 'Apply'}
                                     </button>
                                     <button
                                         type="button"
                                         className="listing-btn"
                                         onClick={() => toggleFollow(job.ownerUserId)}
                                         disabled={followBusyId === job.ownerUserId}
                                     >
                                         {followingIds.includes(job.ownerUserId) ? 'Unfollow poster' : 'Follow poster'}
                                     </button>
                                 </div>
                             )}

                             {isOwner && (
                                 <div className="listing-footer">
                                     <span className="listing-footer-note">You posted this</span>
                                     <button type="button" className="listing-btn" onClick={() => openForm(job.id)}>
                                         Edit
                                     </button>
                                     <button
                                         type="button"
                                         className="listing-btn listing-btn-danger"
                                         onClick={() => deleteJob(job)}
                                         disabled={deletingId === job.id}
                                     >
                                         {deletingId === job.id ? 'Deleting...' : 'Delete'}
                                     </button>
                                 </div>
                             )}
                         </article>
                     );
                 })}

                 {!loading && !error && visibleJobs.length === 0 && (
                     <div className="listing-card listing-full">
                         <h2>No jobs found</h2>
                         <p className="listing-description">Try searching for another position or clearing your filters.</p>
                         {selectedFilters.length > 0 && (
                             <div>
                                 <button type="button" className="listing-btn" onClick={() => setSelectedFilters([])}>
                                     Clear filters
                                 </button>
                             </div>
                         )}
                     </div>
                 )}
             </div>

             {!loading && !error && totalPages > 1 && (
                 <nav className="jobs-pagination" aria-label="Job pages">
                     <button
                         type="button"
                         className="listing-btn"
                         disabled={currentPage === 0}
                         onClick={() => goToPage(currentPage - 1)}
                     >
                         ← Previous
                     </button>

                     {pageNumbers.map((pageNumber) => (
                         <button
                             type="button"
                             className={`listing-btn ${pageNumber === currentPage ? 'listing-btn-primary' : ''}`}
                             aria-current={pageNumber === currentPage ? 'page' : undefined}
                             key={pageNumber}
                             onClick={() => goToPage(pageNumber)}
                         >
                             {pageNumber + 1}
                         </button>
                     ))}

                     <button
                         type="button"
                         className="listing-btn"
                         disabled={currentPage >= totalPages - 1}
                         onClick={() => goToPage(currentPage + 1)}
                     >
                         Next →
                     </button>
                 </nav>
             )}

             <CollabList collab={collab} />
         </main>
     </>
 );
}
export default Jobs;