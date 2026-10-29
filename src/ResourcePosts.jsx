import useResourceTags from './useResourceTags';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './resources.css';

// for the markdown-to-react preview
function ResourceMarkdown({ body = '' }) {
  return (
    <div className="resource-body">
      <ReactMarkdown>{body}</ReactMarkdown>
    </div>
  );
}


async function resourceRequest(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || error?.message || (response.status === 401 ? 'Please log in again.' : 'Unable to complete the request.'));
  }
  return response.status === 204 ? null : response.json();
}

function DeleteResourceButton({ post, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function deleteResource() {
    if (deleting || !window.confirm(`Delete "${post.siteName}"? This permanently deletes the resource and cannot be undone.`)) return;
    setDeleting(true);
    setError('');
    try {
      await resourceRequest(`/api/resources/${post.resourceId}`, { method: 'DELETE' });
      onDeleted(post.resourceId);
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  }

  return <div className="resource-delete-control">
    <button className="resources-button resources-button-danger" type="button" disabled={deleting}
      onClick={deleteResource}>{deleting ? 'Deleting…' : 'Delete resource'}</button>
    {error && <p role="alert">{error}</p>}
  </div>;
}

// for quickly setting up the base structure of the page
function Shell({ children }) {
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  return <><nav id="navbar" aria-label="Main navigation">
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
    </nav><main className="resources-container">{children}</main></>;
}

// The resource manager page
export function ResourceManager() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { resourceRequest('/api/resources/mine').then(setPosts).catch(e => setError(e.message)); }, []);
  return <Shell>
    <h1>My resources</h1>
    <p>Create and manage the resources you share with the community.</p>
    <div className="resource-manager-actions">
      <Link className="resources-button" to="/resources/new">
        Create a new resource
      </Link>
    </div>
    
    {/* if error is returned let user know */}
    {error && <p role="alert">{error}</p>}

    {/* if no posts and no error has been returned render a loading text until resources are loaded*/}
    {!posts && !error && <p role="status">Loading resources…</p>}

    {/* if the user hasn't created any resources yet display that in writing*/}
    {posts?.length === 0 && <p>You haven’t posted any resources yet.</p>}
    
    {/* if the user does have resources iterate over the returned information and display them*/}
    {posts?.map(post => (
      <article className="profile-section resource-card resource-manager-card" key={post.resourceId}>
        <div className="resource-manager-card-heading">
          <h2><Link to={post.siteLink}>{post.siteName}</Link></h2>
          <div className="resource-owner-actions">
          <Link className="resources-button resources-button-secondary" to={`${post.siteLink}/edit`} state={{ returnTo: "/resources/manage" }}>Edit resource</Link>
            <DeleteResourceButton post={post} onDeleted={id => setPosts(current => current.filter(item => item.resourceId !== id))} />
          </div>
        </div>
        <p>{post.overview}</p>
        <div className="tag-container">
          {post.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
        </div>
      </article>
    ))}
  </Shell>;
}

// code for the ui behind a resource page
export function ResourcePage() {
  const { id } = useParams();
  
  const navigate = useNavigate();
  {/* if the user clicks the back button site should return them to the page they were in previously */}
  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/resources');
  }

  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    let active = true;
    {/* gettint the resource by its id*/}
    resourceRequest(`/api/resources/${id}`).then(p => { if (active) setPost(p); }).catch(e => { if (active) setError(e.message); });

    {/* Getting user auth, if the user is the creator of the resource it'll display an edit button*/}
    resourceRequest('/api/auth/me').then(u => { if (active) setUser(u); }).catch(() => {});
    return () => { active = false; };
  }, [id]);
  return <Shell>

    <div className="resource-page-actions">
      {/* back button */}
      <button className="resources-button resources-button-secondary" type="button" onClick={goBack}>← Back</button>
      {/* logic for displaying button that allows for resource editing if the user if the creator*/}
      {post && String(post.resourceId) === id && user && post.ownerUserId === user.userId && (
        <div className="resource-owner-actions">
        <Link className="resources-button" to={`/resources/${id}/edit`} state={{ returnTo: `/resources/${id}` }}>Edit resource</Link>
          <DeleteResourceButton key={id} post={post} onDeleted={() => navigate('/resources/manage', { replace: true })} />
        </div>
      )}
    </div>
    {/* if there is an error its displayed, if there is no error and we haven't heard back from the request we display a loading sequence, else display the resource */}
    {error ? <p role="alert">{error}</p> : (!post || String(post.resourceId) !== id) ? <p role="status">Loading resource…</p> : (
      <article className="profile-section">
        <h1>{post.siteName}</h1><p>{post.overview}</p>
        <div className="tag-container">{post.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
        <ResourceMarkdown body={post.body || ''} />
      </article>
    )}
  </Shell>;
}

// if we want to edit an existing resource, feed id to the resource editor, else we start from scratch and create a new resource
export function ResourceEditor() {
  const { id } = useParams();
  return <ResourceEditorForm key={id || 'new'} id={id} />;
}

// logic for editing and creating a new resource
function ResourceEditorForm({ id }) {
  const navigate = useNavigate();
  const location = useLocation();
  const origin = location.state?.returnTo;

  // when the user clicks save or cancel it brings the user back to the page they were in previously
  const returnTo = id ? (origin === '/resources/manage' || origin === `/resources/${id}` ? origin : `/resources/${id}`) : '/resources/manage';
  
  // for enforcing the use of tags in our db
  const { groups: tagGroups, status: tagsStatus, error: tagsError } = useResourceTags();

  // base form layout
  const [form, setForm] = useState({ title: '', overview: '', tags: ['User Made'], body: '' });
  
  
  const [tag, setTag] = useState('');
  const [ready, setReady] = useState(!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;

    let active = true;

    {/*Fetching resource id and user auth to make sure that the user is actually the creator to be able to edit the resource 
      If the id returns a resource in the db, we display all the information for that resource, else its blank*/}
    Promise.all([resourceRequest(`/api/resources/${id}`), resourceRequest('/api/auth/me')]).then(([post, user]) => {
      if (!active) return;
      if (post.ownerUserId !== user.userId) throw new Error('Only the creator can edit this resource.');
      setForm({ title: post.siteName, overview: post.overview, tags: ['User Made', ...post.tags.filter(t => t !== 'User Made')], body: post.body || '' }); setReady(true);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [id]);


  // every user created resource has the "User Made" tag to make them easier to find
  const availableTags = tagGroups
    .filter(group => group.title !== 'User Made')
    .flatMap(group => group.tags)
    .filter(value => !form.tags.some(selected => selected.toLowerCase() === value.toLowerCase()));
  const tagQuery = tag.trim().toLowerCase();
  const matchingTags = availableTags.filter(value => value.toLowerCase().includes(tagQuery));
  const tagToAdd = availableTags.find(value => value.toLowerCase() === tagQuery);

  // updating tags
  function addTag() {
    if (!tagToAdd || tagsStatus !== 'ready') return;
    setForm(f => ({ ...f, tags: [...f.tags, tagToAdd] }));
    setTag('');
  }


  // function for the save button
  async function save(event) {
    event.preventDefault();
    if (tagsStatus !== 'ready') return;
    setSaving(true); setError('');
    // tries to save created resource and returns error if any
    try {
      const post = await resourceRequest(id ? `/api/resources/${id}` : '/api/resources', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      navigate(id ? returnTo : post.siteLink, { replace: true });
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  return <Shell>
    {/* title */}
    <h1>
      {id ? 'Edit resource' : 'Create a resource'}
    </h1>

    {/* error handling and loading text*/}
    {error && <p role="alert">{error}</p>}
    {!ready ? !error && <p role="status">Loading editor…</p> : 
      <form className="resource-editor" onSubmit={save}>
        {/* display the editor */}  
        
        {/* three fields for base resource information*/}
        <label htmlFor="post-title">
          Title
        </label>
        <input id="post-title" required maxLength={255} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        
        <label htmlFor="post-overview">
          Overview
        </label>
        <textarea id="post-overview" required maxLength={10000} rows={3} value={form.overview} onChange={e => setForm({ ...form, overview: e.target.value })} />
        
        <label htmlFor="post-tag">
          Tags
        </label>
        
        {/* get valid tags user can use*/}
        {tagsStatus === 'loading' && <p role="status">Loading tags…</p>}
        {tagsError && <p role="alert">{tagsError}</p>}
        
        <div className="resources-toolbar">
          <input id="post-tag" type="text" list="resource-tag-suggestions" autoComplete="off"
            placeholder="Type to search approved tags" maxLength={80} value={tag}
            disabled={tagsStatus !== 'ready'} onChange={e => setTag(e.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                addTag();
              }
            }} />
          <datalist id="resource-tag-suggestions">
            {matchingTags.map(value => <option key={value} value={value} />)}
          </datalist>
          <button className="resources-button" type="button" disabled={!tagToAdd || tagsStatus !== 'ready'} onClick={addTag}>Add tag</button>
        </div>

        {tagQuery && tagsStatus === 'ready' && matchingTags.length === 0 && (
          <p role="status">No available tags match your search.</p>
        )}

        <div className="tag-container">
          <span className="tag resource-mandatory-tag">User Made <span className="resources-sr-only">(required)</span></span>
          {form.tags.filter(t => t !== 'User Made').map(t => (
            <button className="tag" type="button" key={t} aria-label={`Remove ${t}`}
              onClick={() => setForm({ ...form, tags: form.tags.filter(v => v !== t) })}>{t} ×</button>
          ))}
        </div>

        <div className="resource-compose-layout">
          
          <div className="resource-compose-input">
            <label htmlFor="post-body">Body</label>
            <p id="markdown-help">Write with markup.</p>
            <textarea id="post-body" aria-describedby="markdown-help" required maxLength={30000} rows={16} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
          </div>
          
          <section className="profile-section resource-preview" aria-label="Resource preview">
            <h2>Preview</h2><h1>{form.title}</h1><p>{form.overview}</p>
            <ResourceMarkdown body={form.body} />
          </section>

        </div>

        <div className="resource-editor-actions">
          <button className="resources-button" disabled={saving || tagsStatus !== 'ready'} type="submit">{saving ? 'Saving…' : id ? 'Save changes' : 'Finalize and publish'}</button>
          <Link className="resources-button resources-button-secondary" to={returnTo} replace={Boolean(id)}>Cancel</Link>
        </div>

      </form>}

    </Shell>;
}
