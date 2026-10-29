import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import './style.css';


const PAGE_SIZE = 20;


function getPageNumbers(currentPage, totalPages) {
   const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
   const lastPage = Math.min(totalPages, firstPage + 5);

   return Array.from(
       { length: Math.max(0, lastPage - firstPage) },
       (_, index) => firstPage + index
   );
}


function formatSpan(ms) {
   const totalMinutes = Math.max(0, Math.floor(ms / 60000));
   const days = Math.floor(totalMinutes / 1440);
   const hours = Math.floor((totalMinutes % 1440) / 60);
   const minutes = totalMinutes % 60;

   const parts = [];
   if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
   if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
   // Minutes are only worth showing when the span is under a day
   if (minutes && !days) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);

   return parts.length > 0 ? parts.join(' ') : 'less than a minute';
}


function formatCountdown(ms) {
   const total = Math.max(0, Math.floor(ms / 1000));
   const days = Math.floor(total / 86400);
   const hours = Math.floor((total % 86400) / 3600);
   const minutes = Math.floor((total % 3600) / 60);
   const seconds = total % 60;
   const pad = (n) => String(n).padStart(2, '0');

   if (days) return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
   if (hours) return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
   return `${minutes}m ${pad(seconds)}s`;
}


// Shows date in viewer's time zone
const formatDate = (date) => date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });


// Jam is upcoming, running, or over
function getStatus(jam, now) {
   if (!jam.start || !jam.end) return null;
   if (now < jam.start.getTime()) {
       return { label: `Starts in ${formatCountdown(jam.start.getTime() - now)}`, live: false, ended: false };
   }
   if (now < jam.end.getTime()) {
       return { label: `Live now · ends in ${formatCountdown(jam.end.getTime() - now)}`, live: true, ended: false };
   }
   return { label: 'Ended', live: false, ended: true };
}


// The date picker wants "YYYY-MM-DDTHH:mm" in the viewer's local time
function toLocalInput(date) {
   if (!date) return '';
   const pad = (n) => String(n).padStart(2, '0');
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


// Turns a jam from the API into the shape the page uses
const toJam = (jam) => ({
   id: jam.jamId,
   title: jam.jamTitle,
   description: jam.jamDescription,
   ownerUserId: jam.ownerUserId,
   tags: jam.jamTags || [],
   coverImageUrl: jam.coverImageUrl || '',
   start: jam.startTime ? new Date(jam.startTime) : null,
   end: jam.endTime ? new Date(jam.endTime) : null,
   entrants: jam.entrantCount ?? 0
});


const EMPTY_FORM = { title: '', description: '', tags: '', coverImageUrl: '', start: '', end: '' };


const jamToForm = (jam) => ({
   title: jam.title,
   description: jam.description,
   tags: jam.tags.join(', '),
   coverImageUrl: jam.coverImageUrl,
   start: toLocalInput(jam.start),
   end: toLocalInput(jam.end)
});


// Turns the form back into the body the API expects (times are sent as UTC)
const formToBody = (form) => ({
   jamTitle: form.title.trim(),
   jamDescription: form.description.trim(),
   jamTags: form.tags
       .split(',')
       .map((tag) => tag.trim())
       .filter(Boolean),
   coverImageUrl: form.coverImageUrl.trim() || null,
   startTime: form.start ? new Date(form.start).toISOString() : null,
   endTime: form.end ? new Date(form.end).toISOString() : null
});


const errorMessage = (status, action = 'save') => {
   if (status === 401) return action === 'join' ? 'Please log in to join a jam.' : 'Please log in again.';
   if (status === 400) return 'Please check the fields. The title can be up to 50 characters, the image link must start with http:// or https://, and the end time must be after the start time.';
   if (status === 403) return 'Only the person who posted this jam can change it.';
   if (status === 404) return 'This jam no longer exists. Refresh the page.';
   if (status === 409) return action === 'delete'
       ? 'This jam has entrants, so it cannot be deleted.'
       : 'This jam has already ended.';
   return 'Unable to complete the request.';
};


// Form used for both posting a new jam and editing an existing one
function JamForm({ heading, initial, submitLabel, saving, error, onSave, onCancel }) {
 const [form, setForm] = useState(initial);
 const [localError, setLocalError] = useState('');
 const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

 const handleSubmit = (event) => {
     event.preventDefault();
     // Check the dates before sending anything to the server
     if (Boolean(form.start) !== Boolean(form.end)) {
         setLocalError('Enter both a start and an end time, or leave both empty.');
         return;
     }
     if (form.start && new Date(form.end) <= new Date(form.start)) {
         setLocalError('The end time must be after the start time.');
         return;
     }
     setLocalError('');
     onSave(form);
 };

 const shownError = localError || error;

 return (
     <form className="job-card job-form" onSubmit={handleSubmit}>
         <h2>{heading}</h2>
         <label>
             Title
             <input type="text" value={form.title} onChange={update('title')} maxLength={50} required />
         </label>
         <label>
             Description
             <textarea value={form.description} onChange={update('description')} rows={5} required />
         </label>
         <label>
             Cover image link (optional)
             <input type="url" value={form.coverImageUrl} onChange={update('coverImageUrl')} pattern="https?://\S+" placeholder="https://example.com/cover.png" maxLength={2048} />
         </label>
         <div className="job-form-row">
             <label>
                 Starts (optional)
                 <input type="datetime-local" value={form.start} onChange={update('start')} />
             </label>
             <label>
                 Ends (optional)
                 <input type="datetime-local" value={form.end} onChange={update('end')} />
             </label>
         </div>
         <label>
             Tags (optional, separated by commas)
             <input type="text" value={form.tags} onChange={update('tags')} placeholder="Pixel Art, Solo, 48 Hours" />
         </label>
         {shownError && <p className="job-form-error" role="alert">{shownError}</p>}
         <div className="job-actions">
             <button type="submit" className="filter-button" disabled={saving}>
                 {saving ? 'Saving...' : submitLabel}
             </button>
             <button type="button" className="filter-clear" onClick={onCancel} disabled={saving}>Cancel</button>
         </div>
     </form>
 );
}


function Jams() {
 const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
 const [query, setQuery] = useState('');
 const [filterOpen, setFilterOpen] = useState(false);
 const [selectedTags, setSelectedTags] = useState([]);

 const [page, setPage] = useState(0);

 // Jams come from the database through the API
 const [jams, setJams] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 const [editingId, setEditingId] = useState(null);
 const [saving, setSaving] = useState(false);
 const [formError, setFormError] = useState('');
 const [deletingId, setDeletingId] = useState(null);
 const [actionError, setActionError] = useState('');

 // Current user, so Edit and Delete only show on jams they posted
 const [userId, setUserId] = useState(null);

 // Ids of the jams the current user has joined, and which jam is mid join/leave request
 const [joinedIds, setJoinedIds] = useState([]);
 const [joiningId, setJoiningId] = useState(null);

 // The current time, refreshed every second so the countdowns tick
 const [now, setNow] = useState(Date.now());


 useEffect(() => {
     const timer = setInterval(() => setNow(Date.now()), 1000);
     return () => clearInterval(timer);
 }, []);


 // Load all jams when the page opens
 useEffect(() => {
     let cancelled = false;
     fetch('/api/jams')
         .then((res) => {
             if (!res.ok) throw new Error('Request failed');
             return res.json();
         })
         .then((data) => {
             if (!cancelled) setJams(data.map(toJam));
         })
         .catch(() => {
             if (!cancelled) setError('Could not load jams. Please try again later.');
         })
         .finally(() => {
             if (!cancelled) setLoading(false);
         });
     return () => { cancelled = true; };
 }, []);


 // Find out who's logged in
 useEffect(() => {
     let cancelled = false;
     fetch('/api/auth/me', { credentials: 'include' })
         .then((res) => (res.ok ? res.json() : null))
         .then((user) => { if (!cancelled && user) setUserId(user.userId); })
         .catch(() => {});
     return () => { cancelled = true; };
 }, []);


 // Find out which jams user joined
 useEffect(() => {
     if (userId === null) {
         setJoinedIds([]);
         return undefined;
     }
     let cancelled = false;
     fetch('/api/jams/entered', { credentials: 'include' })
         .then((res) => (res.ok ? res.json() : []))
         .then((ids) => { if (!cancelled) setJoinedIds(ids); })
         .catch(() => {});
     return () => { cancelled = true; };
 }, [userId]);


 // Go back to first page whenever the search or filters change
 useEffect(() => {
     setPage(0);
 }, [query, selectedTags]);


 const openForm = (id) => {
     setFormError('');
     setActionError('');
     setEditingId(id);
 };


 // Creates a jam (POST) or updates one (PUT), then updates the list on the page
 const saveJam = async (form) => {
     const isNew = editingId === 'new';
     setSaving(true);
     setFormError('');
     try {
         const res = await fetch(isNew ? '/api/jams' : `/api/jams/${editingId}`, {
             method: isNew ? 'POST' : 'PUT',
             credentials: 'include',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(formToBody(form))
         });
         if (!res.ok) throw new Error(errorMessage(res.status));
         const saved = toJam(await res.json());
         setJams((current) => isNew
             ? [saved, ...current]
             : current.map((jam) => (jam.id === saved.id ? saved : jam)));
         setEditingId(null);
     } catch (err) {
         setFormError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
     } finally {
         setSaving(false);
     }
 };


 // Asks first, then deletes the jam and removes its card
 const deleteJam = async (jam) => {
     if (!window.confirm(`Delete "${jam.title}"? This cannot be undone.`)) return;
     setDeletingId(jam.id);
     setActionError('');
     try {
         const res = await fetch(`/api/jams/${jam.id}`, { method: 'DELETE', credentials: 'include' });
         if (!res.ok && res.status !== 404) throw new Error(errorMessage(res.status, 'delete'));
         setJams((current) => current.filter((item) => item.id !== jam.id));
         if (editingId === jam.id) setEditingId(null);
     } catch (err) {
         setActionError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
     } finally {
         setDeletingId(null);
     }
 };


 // Joins the jam (POST) or leaves it (DELETE), then updates the button and the participant count
 const toggleEntry = async (jam) => {
     const joining = !joinedIds.includes(jam.id);
     setJoiningId(jam.id);
     setActionError('');
     try {
         const res = await fetch(`/api/jams/${jam.id}/join`, {
             method: joining ? 'POST' : 'DELETE',
             credentials: 'include'
         });
         if (!res.ok) throw new Error(errorMessage(res.status, 'join'));
         const result = await res.json();
         setJoinedIds((current) => result.joined
             ? [...new Set([...current, jam.id])]
             : current.filter((id) => id !== jam.id));
         setJams((current) => current.map((item) =>
             item.id === jam.id ? { ...item, entrants: result.entrantCount } : item));
     } catch (err) {
         setActionError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
     } finally {
         setJoiningId(null);
     }
 };


 // Adds or removes a tag from the selected list
 const toggleTag = (tag) => {
     setSelectedTags((current) =>
         current.includes(tag)
             ? current.filter((t) => t !== tag)
             : [...current, tag]
     );
 };


 // Filter chips are built from the tags that jams actually have
 const allTags = [...new Set(jams.flatMap((jam) => jam.tags))].sort((a, b) => a.localeCompare(b));


 const visibleJams = jams.filter((jam) => {
     const searchable = `${jam.title} ${jam.tags.join(' ')} ${jam.description}`.toLowerCase();
     const matchesQuery = searchable.includes(query.toLowerCase());
     const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => jam.tags.includes(tag));
     return matchesQuery && matchesTags;
 });


 // Only the jams for the current page get shown
 const totalPages = Math.ceil(visibleJams.length / PAGE_SIZE);
 // Clamp so deleting the last jam on the last page doesn't leave you on an empty page
 const currentPage = Math.min(page, Math.max(0, totalPages - 1));
 const pagedJams = visibleJams.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
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
                     placeholder="Search jams..."
                     value={query}
                     onChange={(event) => setQuery(event.target.value)}
                 />
             </div>
         </nav>

         <main className="jobs-container">
             <header className="jobs-header">
                 <h1>Game Jams</h1>
                 <p>
                     Find game jams to join, or post your own and bring
                     other developers together.
                 </p>
             </header>

             <section className="jobs-results">
                 {/* Filter, post, and clear buttons */}
                 <div className="jobs-toolbar">
                     <button
                         type="button"
                         className="filter-button"
                         aria-expanded={filterOpen}
                         aria-controls="jams-filter-panel"
                         onClick={() => setFilterOpen((value) => !value)}
                     >
                         Filter{selectedTags.length > 0 && ` (${selectedTags.length})`}
                     </button>
                     <button
                         type="button"
                         className="filter-button post-job-button"
                         onClick={() => openForm('new')}
                         disabled={editingId === 'new'}
                     >
                         Post a jam
                     </button>
                     {selectedTags.length > 0 && (
                         <button
                             type="button"
                             className="filter-clear"
                             onClick={() => setSelectedTags([])}
                         >
                             Clear filters
                         </button>
                     )}
                 </div>

                 <div id="jams-filter-panel" className="filter-panel" hidden={!filterOpen}>
                     {allTags.length === 0 && <span className="jobs-count">No tags yet.</span>}
                     {allTags.map((tag) => (
                         <button
                             type="button"
                             key={tag}
                             className={`filter-chip ${selectedTags.includes(tag) ? 'active' : ''}`}
                             aria-pressed={selectedTags.includes(tag)}
                             onClick={() => toggleTag(tag)}
                         >
                             {tag}
                         </button>
                     ))}
                 </div>

                 {editingId === 'new' && (
                     <JamForm
                         heading="Post a jam"
                         initial={EMPTY_FORM}
                         submitLabel="Post jam"
                         saving={saving}
                         error={formError}
                         onSave={saveJam}
                         onCancel={() => setEditingId(null)}
                     />
                 )}
                 {actionError && <p className="job-form-error" role="alert">{actionError}</p>}

                 {/* Shows how many jams are currently being displayed */}
                 {!loading && !error && (
                     <p className="jobs-count">
                         {visibleJams.length}{' '}
                         {visibleJams.length === 1 ? 'jam' : 'jams'} found
                     </p>
                 )}
                 {loading && <p className="jobs-count">Loading jams...</p>}
                 {error && (
                     <div className="job-card">
                         <h2>Something went wrong</h2>
                         <p>{error}</p>
                     </div>
                 )}

                 {/* Cards for each jam on the current page */}
                 {pagedJams.map((jam) => {
                     const status = getStatus(jam, now);
                     const isOwner = userId !== null && jam.ownerUserId === userId;
                     const hasJoined = joinedIds.includes(jam.id);
                     // Joining closes when the jam ends (jams without dates stay open)
                     const canJoin = !(status && status.ended);

                     return editingId === jam.id ? (
                         <JamForm
                             key={jam.id}
                             heading="Edit jam"
                             initial={jamToForm(jam)}
                             submitLabel="Save changes"
                             saving={saving}
                             error={formError}
                             onSave={saveJam}
                             onCancel={() => setEditingId(null)}
                         />
                     ) : (
                         <article className="job-card" key={jam.id}>
                             {/* Cover image hides itself if the link is broken */}
                             {jam.coverImageUrl && (
                                 <img
                                     className="jam-cover"
                                     src={jam.coverImageUrl}
                                     alt={`Cover for ${jam.title}`}
                                     onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                 />
                             )}
                             <h2>{jam.title}</h2>
                             {status && (
                                 <span className={`jam-status ${status.live ? 'live' : ''}`}>{status.label}</span>
                             )}
                             {jam.tags.length > 0 && <h3>{jam.tags.join(' · ')}</h3>}
                             <p>{jam.description}</p>
                             <dl className="jam-meta">
                                 {jam.start && jam.end ? (
                                     <>
                                         <div><dt>Starts</dt><dd>{formatDate(jam.start)}</dd></div>
                                         <div><dt>Ends</dt><dd>{formatDate(jam.end)}</dd></div>
                                         <div><dt>Duration</dt><dd>{formatSpan(jam.end.getTime() - jam.start.getTime())}</dd></div>
                                     </>
                                 ) : (
                                     <div><dt>When</dt><dd>Dates not set</dd></div>
                                 )}
                                 <div><dt>Participants</dt><dd>{jam.entrants}</dd></div>
                             </dl>
                             {(canJoin || isOwner) && (
                                 <div className="job-actions">
                                     {canJoin && (
                                         <button
                                             type="button"
                                             className="filter-button"
                                             onClick={() => toggleEntry(jam)}
                                             disabled={joiningId === jam.id}
                                         >
                                             {joiningId === jam.id ? 'Saving...' : hasJoined ? 'Leave jam' : 'Join jam'}
                                         </button>
                                     )}
                                     {isOwner && (
                                         <>
                                             <button type="button" className="filter-button" onClick={() => openForm(jam.id)}>
                                                 Edit
                                             </button>
                                             <button
                                                 type="button"
                                                 className="filter-button job-delete-button"
                                                 onClick={() => deleteJam(jam)}
                                                 disabled={deletingId === jam.id}
                                             >
                                                 {deletingId === jam.id ? 'Deleting...' : 'Delete'}
                                             </button>
                                         </>
                                     )}
                                 </div>
                             )}
                         </article>
                     );
                 })}

                 {!loading && !error && visibleJams.length === 0 && (
                     <div className="job-card">
                         <h2>No jams found</h2>
                         <p>Try searching for something else, clearing your filters, or post the first one.</p>
                     </div>
                 )}

                 {/* Page controls, only shown when there is more than one page */}
                 {!loading && !error && totalPages > 1 && (
                     <nav className="jobs-pagination" aria-label="Jam pages">
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

export default Jams;