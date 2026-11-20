import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';


export const toCollab = (collab) => ({
   id: collab.collabId,
   title: collab.collabTitle,
   description: collab.collabDescription,
   detailedDescription: collab.collabDetailedDescription || '',
   location: collab.collabLocation,
   ownerUserId: collab.ownerUserId
});


const EMPTY_FORM = { title: '', description: '', detailedDescription: '', location: '' };


const collabToForm = (collab) => ({
   title: collab.title,
   description: collab.description,
   detailedDescription: collab.detailedDescription,
   location: collab.location
});


const formToBody = (form, type) => ({
   collabType: type,
   collabTitle: form.title.trim(),
   collabDescription: form.description.trim(),
   collabDetailedDescription: type === 'JAM' ? form.detailedDescription.trim() || null : null,
   collabLocation: form.location.trim()
});


const errorMessage = (status) => {
   if (status === 401) return 'Please log in again.';
   if (status === 400) return 'Please check the fields. The title can be up to 50 characters and the location up to 100.';
   if (status === 403) return 'Only the person who posted this collab can change it.';
   if (status === 404) return 'This collab no longer exists. Refresh the page.';
   return 'Unable to complete the request.';
};


export function useCollabs(type, userId) {
   const [collabs, setCollabs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   const [editingId, setEditingId] = useState(null);
   const [saving, setSaving] = useState(false);
   const [formError, setFormError] = useState('');
   const [deletingId, setDeletingId] = useState(null);
   const [actionError, setActionError] = useState('');


   useEffect(() => {
       let cancelled = false;
       fetch(`/api/collabs?type=${type}`, { credentials: 'include' })
           .then((res) => {
               if (!res.ok) throw new Error('Request failed');
               return res.json();
           })
           .then((data) => { if (!cancelled) setCollabs(data.map(toCollab)); })
           .catch(() => { if (!cancelled) setError('Could not load collabs. Please try again later.'); })
           .finally(() => { if (!cancelled) setLoading(false); });
       return () => { cancelled = true; };
   }, [type]);


   const openForm = (id) => {
       setFormError('');
       setActionError('');
       setEditingId(id);
   };

   const closeForm = () => setEditingId(null);


   const saveCollab = async (form) => {
       const isNew = editingId === 'new';
       setSaving(true);
       setFormError('');
       try {
           const res = await fetch(isNew ? '/api/collabs' : `/api/collabs/${editingId}`, {
               method: isNew ? 'POST' : 'PUT',
               credentials: 'include',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(formToBody(form, type))
           });
           if (!res.ok) throw new Error(errorMessage(res.status));
           const saved = toCollab(await res.json());
           setCollabs((current) => isNew
               ? [saved, ...current]
               : current.map((collab) => (collab.id === saved.id ? saved : collab)));
           setEditingId(null);
       } catch (err) {
           setFormError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
       } finally {
           setSaving(false);
       }
   };


   const deleteCollab = async (collab) => {
       if (!window.confirm(`Delete "${collab.title}"? This cannot be undone.`)) return;
       setDeletingId(collab.id);
       setActionError('');
       try {
           const res = await fetch(`/api/collabs/${collab.id}`, { method: 'DELETE', credentials: 'include' });
           if (!res.ok && res.status !== 404) throw new Error(errorMessage(res.status));
           setCollabs((current) => current.filter((item) => item.id !== collab.id));
           if (editingId === collab.id) setEditingId(null);
       } catch (err) {
           setActionError(err.message === 'Failed to fetch' ? errorMessage() : err.message);
       } finally {
           setDeletingId(null);
       }
   };


   return {
       type, userId, collabs, loading, error,
       editingId, saving, formError, deletingId, actionError,
       openForm, closeForm, saveCollab, deleteCollab
   };
}


export function CollabForm({ type, heading, initial = EMPTY_FORM, submitLabel, saving, error, onSave, onCancel }) {
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
         <label>
             Short description
             <textarea value={form.description} onChange={update('description')} rows={3} required />
         </label>
         {type === 'JAM' && (
             <label>
                 Long description (optional, shown on the collab's own page, Markdown supported)
                 <textarea value={form.detailedDescription} onChange={update('detailedDescription')} rows={8} maxLength={20000} placeholder={'## What we are building\n...\n\n## Who we are looking for\n...'} />
             </label>
         )}
         <label>
             Location
             <input type="text" value={form.location} onChange={update('location')} maxLength={100} placeholder="Charlotte, NC or Remote" required />
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


export function CollabPostForm({ collab }) {
 if (collab.editingId !== 'new') return null;
 return (
     <CollabForm
         type={collab.type}
         heading="Post a collab"
         submitLabel="Post collab"
         saving={collab.saving}
         error={collab.formError}
         onSave={collab.saveCollab}
         onCancel={collab.closeForm}
     />
 );
}


function CollabCard({ collab, item }) {
 const isOwner = collab.userId !== null && item.ownerUserId === collab.userId;

 return (
     <article className="job-card">
         <h2>
             {collab.type === 'JAM' ? <Link to={`/collabs/${item.id}`}>{item.title}</Link> : item.title}
         </h2>
         <span className="job-domain">{item.location}</span>
         <p>{item.description}</p>
         {isOwner && (
             <div className="job-actions">
                 <button type="button" className="filter-button" onClick={() => collab.openForm(item.id)}>
                     Edit
                 </button>
                 <button
                     type="button"
                     className="filter-button job-delete-button"
                     onClick={() => collab.deleteCollab(item)}
                     disabled={collab.deletingId === item.id}
                 >
                     {collab.deletingId === item.id ? 'Deleting...' : 'Delete'}
                 </button>
             </div>
         )}
     </article>
 );
}


export function CollabList({ collab }) {
 return (
     <section className="collabs-section" aria-labelledby={`collabs-heading-${collab.type}`}>
         <h2 id={`collabs-heading-${collab.type}`} className="collabs-heading">Collabs</h2>
         {collab.actionError && <p className="job-form-error" role="alert">{collab.actionError}</p>}
         {collab.loading && <p className="jobs-count">Loading collabs...</p>}
         {collab.error && <p className="job-form-error" role="alert">{collab.error}</p>}
         {!collab.loading && !collab.error && collab.collabs.length === 0 && (
             <p className="jobs-count">No collabs yet. Be the first to post one.</p>
         )}
         {collab.collabs.map((item) => (
             collab.editingId === item.id ? (
                 <CollabForm
                     key={item.id}
                     type={collab.type}
                     heading="Edit collab"
                     initial={collabToForm(item)}
                     submitLabel="Save changes"
                     saving={collab.saving}
                     error={collab.formError}
                     onSave={collab.saveCollab}
                     onCancel={collab.closeForm}
                 />
             ) : (
                 <CollabCard key={item.id} collab={collab} item={item} />
             )
         ))}
     </section>
 );
}