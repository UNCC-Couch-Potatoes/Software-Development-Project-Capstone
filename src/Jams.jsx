import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import useFollowing from './useFollowing';
import React, { useEffect, useState } from 'react';
import { useCollabs, CollabPostForm, CollabList } from './Collabs';
import './style.css';
import './listings.css';


const PAGE_SIZE = 20;


function getPageNumbers(currentPage, totalPages) {
   const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
   const lastPage = Math.min(totalPages, firstPage + 5);

   return Array.from(
       { length: Math.max(0, lastPage - firstPage) },
       (_, index) => firstPage + index
   );
}


export function formatSpan(ms) {
   const totalMinutes = Math.max(0, Math.floor(ms / 60000));
   const days = Math.floor(totalMinutes / 1440);
   const hours = Math.floor((totalMinutes % 1440) / 60);
   const minutes = totalMinutes % 60;

   const parts = [];
   if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
   if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
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


export const formatDate = (date) => date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });


export function getStatus(jam, now) {
   if (!jam.start || !jam.end) return null;
   if (now < jam.start.getTime()) {
       return { label: `Starts in ${formatCountdown(jam.start.getTime() - now)}`, live: false, ended: false };
   }
   if (now < jam.end.getTime()) {
       return { label: `Live now · ends in ${formatCountdown(jam.end.getTime() - now)}`, live: true, ended: false };
   }
   return { label: 'Ended', live: false, ended: true };
}


function toLocalInput(date) {
   if (!date) return '';
   const pad = (n) => String(n).padStart(2, '0');
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


export const toJam = (jam) => ({
   id: jam.jamId,
   title: jam.jamTitle,
   description: jam.jamDescription,
   detailedDescription: jam.jamDetailedDescription || '',
   ownerUserId: jam.ownerUserId,
   tags: jam.jamTags || [],
   coverImageUrl: jam.coverImageUrl || '',
   start: jam.startTime ? new Date(jam.startTime) : null,
   end: jam.endTime ? new Date(jam.endTime) : null,
   entrants: jam.entrantCount ?? 0
});


const EMPTY_FORM = { title: '', description: '', detailedDescription: '', tags: '', coverImageUrl: '', start: '', end: '' };


const jamToForm = (jam) => ({
   title: jam.title,
   description: jam.description,
   detailedDescription: jam.detailedDescription,
   tags: jam.tags.join(', '),
   coverImageUrl: jam.coverImageUrl,
   start: toLocalInput(jam.start),
   end: toLocalInput(jam.end)
});


const formToBody = (form) => ({
   jamTitle: form.title.trim(),
   jamDescription: form.description.trim(),
   jamDetailedDescription: form.detailedDescription.trim() || null,
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


function JamForm({ heading, initial, submitLabel, saving, error, onSave, onCancel }) {
 const [form, setForm] = useState(initial);
 const [localError, setLocalError] = useState('');
 const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

 const handleSubmit = (event) => {
     event.preventDefault();
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
             Short description (shown on the jam card)
             <textarea value={form.description} onChange={update('description')} rows={3} required />
         </label>
         <label>
             Detailed description (optional, shown on the jam's own page, Markdown supported)
             <textarea value={form.detailedDescription} onChange={update('detailedDescription')} rows={10} maxLength={20000} placeholder={'## Rules\n- Teams of up to 4\n\n## Prizes\n...'} />
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


// "Nov 22"
const shortDate = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });


// How far through a live jam we are, from 0 to 100
function getProgress(jam, now) {
   if (!jam.start || !jam.end) return 0;
   const total = jam.end.getTime() - jam.start.getTime();
   if (total <= 0) return 100;
   return Math.min(100, Math.max(0, ((now - jam.start.getTime()) / total) * 100));
}


// Badge shown on the jam's cover
function getBadge(status) {
   if (!status) return null;
   if (status.live) return { label: 'Live', className: 'listing-badge-live' };
   if (status.ended) return { label: 'Ended', className: 'listing-badge-ended' };
   return { label: 'Upcoming', className: 'listing-badge-upcoming' };
}


// Short countdown line on each card
function getCountdown(jam, status, now) {
   if (!status) return '';
   if (status.live) return `Ends in ${formatCountdown(jam.end.getTime() - now)}`;
   if (status.ended) return `Ended ${shortDate(jam.end)}`;
   return `Starts in ${formatCountdown(jam.start.getTime() - now)}`;
}


const JAM_TABS = [
   { id: 'all', label: 'All' },
   { id: 'live', label: 'Live now' },
   { id: 'upcoming', label: 'Upcoming' },
   { id: 'past', label: 'Past' }
];


// Cover image with a status badge. Shows the first letter of the title if there is no image.
function JamCover({ jam, status }) {
 const [failed, setFailed] = useState(false);
 const badge = getBadge(status);

 return (
     <div className="listing-cover">
         {jam.coverImageUrl && !failed ? (
             <img src={jam.coverImageUrl} alt={`Cover for ${jam.title}`} onError={() => setFailed(true)} />
         ) : (
             <div className="listing-cover-fallback" aria-hidden="true">
                 {(jam.title || '?').trim().charAt(0).toUpperCase()}
             </div>
         )}
         {badge && <span className={`listing-badge ${badge.className}`}>{badge.label}</span>}
     </div>
 );
}


function Jams() {
 const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
 const [query, setQuery] = useState('');
 const [filterOpen, setFilterOpen] = useState(false);
 const [selectedTags, setSelectedTags] = useState([]);

 const [page, setPage] = useState(0);
 // Which tab is open: all, live, upcoming, or past
 const [tab, setTab] = useState('all');

 const [jams, setJams] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 const [editingId, setEditingId] = useState(null);
 const [saving, setSaving] = useState(false);
 const [formError, setFormError] = useState('');
 const [deletingId, setDeletingId] = useState(null);
 const [actionError, setActionError] = useState('');

 const [userId, setUserId] = useState(null);

 const collab = useCollabs('JAM', userId);

 const { followingIds, busyId: followBusyId, followError, toggleFollow } = useFollowing(userId);
 const [joinedIds, setJoinedIds] = useState([]);
 const [joiningId, setJoiningId] = useState(null);

 const [now, setNow] = useState(Date.now());


 useEffect(() => {
     const timer = setInterval(() => setNow(Date.now()), 1000);
     return () => clearInterval(timer);
 }, []);


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


 useEffect(() => {
     let cancelled = false;
     fetch('/api/auth/me', { credentials: 'include' })
         .then((res) => (res.ok ? res.json() : null))
         .then((user) => { if (!cancelled && user) setUserId(user.userId); })
         .catch(() => {});
     return () => { cancelled = true; };
 }, []);


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


 useEffect(() => {
     setPage(0);
 }, [query, selectedTags, tab]);


 const openForm = (id) => {
     setFormError('');
     setActionError('');
     setEditingId(id);
 };


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


 const toggleTag = (tag) => {
     setSelectedTags((current) =>
         current.includes(tag)
             ? current.filter((t) => t !== tag)
             : [...current, tag]
     );
 };


 const allTags = [...new Set(jams.flatMap((jam) => jam.tags))].sort((a, b) => a.localeCompare(b));


 const matchesTab = (jam) => {
     if (tab === 'all') return true;
     const status = getStatus(jam, now);
     if (!status) return false;
     if (tab === 'live') return status.live;
     if (tab === 'upcoming') return !status.live && !status.ended;
     return status.ended;
 };


 const visibleJams = jams.filter((jam) => {
     const searchable = `${jam.title} ${jam.tags.join(' ')} ${jam.description}`.toLowerCase();
     const matchesQuery = searchable.includes(query.toLowerCase());
     const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => jam.tags.includes(tag));
     return matchesQuery && matchesTags && matchesTab(jam);
 });


 // Featured jam: the live jam with the most participants (shown on All and Live now)
 const featuredJam = (tab === 'all' || tab === 'live')
     ? visibleJams
         .filter((jam) => jam.id !== editingId && getStatus(jam, now)?.live)
         .sort((a, b) => b.entrants - a.entrants)[0] || null
     : null;
 const listJams = featuredJam ? visibleJams.filter((jam) => jam.id !== featuredJam.id) : visibleJams;


 const totalPages = Math.ceil(listJams.length / PAGE_SIZE);
 const currentPage = Math.min(page, Math.max(0, totalPages - 1));
 const pagedJams = listJams.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
 const pageNumbers = getPageNumbers(currentPage, totalPages);

 const goToPage = (nextPage) => {
     setPage(nextPage);
     window.scrollTo({ top: 0, behavior: 'smooth' });
 };


 // Buttons at the bottom of a jam card (join, follow, edit, delete)
 const renderActions = (jam, status) => {
     const isOwner = userId !== null && jam.ownerUserId === userId;
     const hasJoined = joinedIds.includes(jam.id);
     const canJoin = !(status && status.ended);
     const canFollow = userId !== null && jam.ownerUserId != null && !isOwner;

     return (
         <>
             {canJoin && (
                 <button
                     type="button"
                     className={`listing-btn ${hasJoined ? '' : 'listing-btn-primary'}`}
                     onClick={() => toggleEntry(jam)}
                     disabled={joiningId === jam.id}
                 >
                     {joiningId === jam.id ? 'Saving...' : hasJoined ? 'Leave jam' : 'Join jam'}
                 </button>
             )}
             {canFollow && (
                 <button
                     type="button"
                     className="listing-btn"
                     onClick={() => toggleFollow(jam.ownerUserId)}
                     disabled={followBusyId === jam.ownerUserId}
                 >
                     {followingIds.includes(jam.ownerUserId) ? 'Unfollow host' : 'Follow host'}
                 </button>
             )}
             {isOwner && (
                 <>
                     <button type="button" className="listing-btn" onClick={() => openForm(jam.id)}>
                         Edit
                     </button>
                     <button
                         type="button"
                         className="listing-btn listing-btn-danger"
                         onClick={() => deleteJam(jam)}
                         disabled={deletingId === jam.id}
                     >
                         {deletingId === jam.id ? 'Deleting...' : 'Delete'}
                     </button>
                 </>
             )}
         </>
     );
 };

 const renderTags = (jam) => jam.tags.length > 0 && (
     <div className="listing-tags">
         {jam.tags.map((tag) => <span className="listing-tag" key={tag}>{tag}</span>)}
     </div>
 );

 const featuredStatus = featuredJam ? getStatus(featuredJam, now) : null;
 const showFeatured = featuredJam && currentPage === 0;


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
                     <span className="listing-kicker">Ctrl+F · Game Jams</span>
                     <h1>Make a game. Fast.</h1>
                     <p>Find game jams to join, or post your own and bring other developers together.</p>
                 </div>
                 <div className="listing-hero-actions">
                     <button
                         type="button"
                         className="listing-btn listing-btn-primary"
                         onClick={() => openForm('new')}
                         disabled={editingId === 'new'}
                     >
                         Post a jam
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
                     <label htmlFor="jams-search">Search jams</label>
                     <input
                         id="jams-search"
                         type="search"
                         placeholder="Title, theme, or tag"
                         value={query}
                         onChange={(event) => setQuery(event.target.value)}
                     />
                 </div>
                 <button
                     type="button"
                     className="listing-btn"
                     aria-expanded={filterOpen}
                     aria-controls="jams-filter-panel"
                     onClick={() => setFilterOpen((value) => !value)}
                 >
                     Filter by tag{selectedTags.length > 0 && ` (${selectedTags.length})`}
                 </button>
                 {selectedTags.length > 0 && (
                     <button
                         type="button"
                         className="listing-btn"
                         onClick={() => setSelectedTags([])}
                     >
                         Clear filters
                     </button>
                 )}
             </section>

             <div id="jams-filter-panel" className="filter-panel" hidden={!filterOpen}>
                 {allTags.length === 0 && <span className="listing-count">No tags yet.</span>}
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

             {/* All / Live / Upcoming / Past */}
             <div className="listing-tabs" role="tablist" aria-label="Show jams">
                 {JAM_TABS.map((item) => (
                     <button
                         type="button"
                         role="tab"
                         key={item.id}
                         className="listing-tab"
                         aria-selected={tab === item.id}
                         onClick={() => setTab(item.id)}
                     >
                         {item.label}
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
             <CollabPostForm collab={collab} />
             {(actionError || followError) && <p className="listing-error" role="alert">{actionError || followError}</p>}

             {!loading && !error && (
                 <p className="listing-count">
                     {visibleJams.length}{' '}
                     {visibleJams.length === 1 ? 'jam' : 'jams'} found
                 </p>
             )}
             {loading && <p className="listing-count">Loading jams...</p>}

             {/* Featured jam: the live jam with the most participants */}
             {showFeatured && (
                 <article className="listing-card listing-card-jam listing-featured">
                     <JamCover key={featuredJam.coverImageUrl} jam={featuredJam} status={featuredStatus} />
                     <div className="listing-body">
                         <span className="listing-kicker">Featured jam</span>
                         <h2><Link to={`/jams/${featuredJam.id}`}>{featuredJam.title}</Link></h2>
                         <p className="listing-description">{featuredJam.description}</p>
                         <span className="listing-countdown">{getCountdown(featuredJam, featuredStatus, now)}</span>
                         <div
                             className="listing-progress"
                             role="progressbar"
                             aria-label="Jam progress"
                             aria-valuemin={0}
                             aria-valuemax={100}
                             aria-valuenow={Math.round(getProgress(featuredJam, now))}
                         >
                             <span style={{ width: `${getProgress(featuredJam, now)}%` }} />
                         </div>
                         <dl className="listing-stats">
                             <div><dt>Participants</dt><dd>{featuredJam.entrants}</dd></div>
                             <div><dt>Started</dt><dd>{shortDate(featuredJam.start)}</dd></div>
                             <div><dt>Ends</dt><dd>{shortDate(featuredJam.end)}</dd></div>
                         </dl>
                         {renderTags(featuredJam)}
                         <div className="listing-footer">
                             {renderActions(featuredJam, featuredStatus)}
                             <Link className="listing-btn" to={`/jams/${featuredJam.id}`}>View details</Link>
                         </div>
                     </div>
                 </article>
             )}

             {showFeatured && pagedJams.length > 0 && <h2 className="listing-section-title">More jams</h2>}

             {/* Jam cards */}
             <div className="listing-grid listing-grid-jams">
                 {error && (
                     <div className="listing-card listing-full">
                         <h2>Something went wrong</h2>
                         <p className="listing-description">{error}</p>
                     </div>
                 )}

                 {pagedJams.map((jam) => {
                     if (editingId === jam.id) {
                         return (
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
                         );
                     }

                     const status = getStatus(jam, now);
                     const progress = getProgress(jam, now);

                     return (
                         <article className="listing-card listing-card-jam" key={jam.id}>
                             <JamCover key={jam.coverImageUrl} jam={jam} status={status} />
                             <div className="listing-body">
                                 <h2><Link to={`/jams/${jam.id}`}>{jam.title}</Link></h2>
                                 <span className="listing-dates">
                                     {jam.start && jam.end ? `${shortDate(jam.start)} – ${shortDate(jam.end)}` : 'Dates not set'}
                                 </span>
                                 {status && <span className="listing-countdown">{getCountdown(jam, status, now)}</span>}
                                 {status && status.live && (
                                     <div
                                         className="listing-progress"
                                         role="progressbar"
                                         aria-label="Jam progress"
                                         aria-valuemin={0}
                                         aria-valuemax={100}
                                         aria-valuenow={Math.round(progress)}
                                     >
                                         <span style={{ width: `${progress}%` }} />
                                     </div>
                                 )}
                                 <p className="listing-description">{jam.description}</p>
                                 {renderTags(jam)}
                                 <div className="listing-footer">
                                     <span className="listing-footer-note">
                                         {jam.entrants} {jam.entrants === 1 ? 'participant' : 'participants'}
                                     </span>
                                     {renderActions(jam, status)}
                                 </div>
                             </div>
                         </article>
                     );
                 })}

                 {!loading && !error && visibleJams.length === 0 && (
                     <div className="listing-card listing-full">
                         <h2>No jams found</h2>
                         <p className="listing-description">
                             Try another tab, search for something else, clear your filters, or post the first one.
                         </p>
                     </div>
                 )}
             </div>

             {!loading && !error && totalPages > 1 && (
                 <nav className="jobs-pagination" aria-label="Jam pages">
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

export default Jams;