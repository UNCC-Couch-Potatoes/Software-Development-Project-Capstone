import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import './style.css';
import './resources.css';
import './profile.css';
import { Link, useNavigate } from 'react-router-dom';
import useResourceTags from './useResourceTags';
import useFollowing from './useFollowing';
import { getStatus, toJam } from './Jams';
import './profile-bento.css';


// "2026-10-05" -> "October 2026"
function formatJoinDate(joinDate) {
  if (!joinDate) return '';
  const [year, month] = joinDate.split('-').map(Number);
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

function getInitials(firstName, lastName) {
  const first = (firstName || '').trim()[0] || '';
  const last = (lastName || '').trim()[0] || '';
  return (first + last).toUpperCase() || '?';
}

// "Nov 22"
const shortDate = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });

// Badge text and "when" line for a jam card on the profile
function jamStatus(jam, now) {
  const status = getStatus(jam, now);
  if (!status) return { label: '', className: '', when: 'Dates not set' };
  if (status.live) return { label: 'Live', className: 'pb-status-live', when: `Ends ${shortDate(jam.end)}` };
  if (status.ended) return { label: 'Ended', className: 'pb-status-ended', when: `Ended ${shortDate(jam.end)}` };
  return { label: 'Upcoming', className: 'pb-status-upcoming', when: `Starts ${shortDate(jam.start)}` };
}

const isWebLink = (link) => /^https?:\/\//i.test(link || '');

// Colors that skill pills cycle through
const TAG_TONES = ['', 'pb-tag-blue', 'pb-tag-green'];

function Profile() {
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  const navigate = useNavigate();

  // The profile as it is saved in the database
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState('');

  // Edit form fields
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [tagError, setTagError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  // Save feedback
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Blog posts this user wrote on the Blogs page
  const [myBlogs, setMyBlogs] = useState(null);
  const [blogsError, setBlogsError] = useState('');

  // Delete Account
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");


    // Resources this user created on the Resources page
  const [myResources, setMyResources] = useState(null);
  const [resourcesError, setResourcesError] = useState('');

  // Jams and jobs, used for the stats, "Jams I've joined", and "Posted by me" cards
  const [allJams, setAllJams] = useState([]);
  const [enteredIds, setEnteredIds] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  // People this user follows (for the Following count)
  const { followingIds } = useFollowing(profile ? profile.userId : null);

  // Official tags from the database (same list the Resources page uses).
  // "User Made" is only for resource posts, so it's left out here.
  const { groups: tagGroups, status: tagsStatus } = useResourceTags();
  const profileTags = tagGroups
    .filter((group) => group.title !== 'User Made')
    .flatMap((group) => group.tags);

  // Turns "unity" into "Unity", or returns undefined if it isn't an official tag
  function findTag(value) {
    const wanted = value.trim().toLowerCase();
    return profileTags.find((tag) => tag.toLowerCase() === wanted);
  }

  // Load the logged-in user's profile from the backend
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });

        if (response.status === 401) {
          navigate('/login');
          return;
        }
        if (!response.ok) {
          setLoadError('Could not load your profile. Please refresh the page.');
          return;
        }

        const data = await response.json();
        setProfile(data);
        setProfilePicture(data.profilePicture || null);
      } catch {
        setLoadError('Unable to connect to the server. Please try again.');
      }
    }

    loadProfile();
  }, [navigate]);

    // Load the blog posts this user has written
  useEffect(() => {
    async function loadMyBlogs() {
      try {
        const response = await fetch('/api/blogs/mine', { credentials: 'include' });

        if (!response.ok) {
          setBlogsError('Could not load your posts.');
          return;
        }

        setMyBlogs(await response.json());
      } catch {
        setBlogsError('Unable to connect to the server.');
      }
    }

    loadMyBlogs();
  }, []);

    // Load the resources this user has created
  useEffect(() => {

    async function loadMyResources() {
      try {
        const response = await fetch('/api/resources/mine', { credentials: 'include' });

        if (!response.ok) {
          setResourcesError('Could not load your resources.');
          return;
        }

        setMyResources(await response.json());
      } catch {
        setResourcesError('Unable to connect to the server.');
      }
    }

    loadMyResources();
  }, []);

  // Load jams, the jams this user joined, and jobs
  useEffect(() => {
    let cancelled = false;

    fetch('/api/jams')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (!cancelled) setAllJams(data.map(toJam)); })
      .catch(() => {});

    fetch('/api/jams/entered', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((ids) => { if (!cancelled) setEnteredIds(ids); })
      .catch(() => {});

    fetch('/api/jobs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (!cancelled) setAllJobs(data); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  function fillFormFrom(source) {
    setFirstName(source.firstName || '');
    setLastName(source.lastName || '');
    setBio(source.bio || '');
    setSkills([...(source.skills || [])]);
    setInterests([...(source.interests || [])]);
    setNewSkill('');
    setNewInterest('');
    setTagError('');
  }

  function startEditing() {
    fillFormFrom(profile);
    setSaveError('');
    setSaveSuccess('');
    setIsEditing(true);
  }

  function cancelEditing() {
    fillFormFrom(profile);
    setProfilePicture(profile.profilePicture || null);
    setSaveError('');
    setIsEditing(false);
  }

  // Sends the profile to the backend and updates the page with what was saved
  async function sendProfile(updates) {
    const response = await fetch('/api/auth/me', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (response.status === 401) {
      navigate('/login');
      return null;
    }
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Could not save your profile. Please try again.');
    }

    const saved = await response.json();
    setProfile(saved);
    return saved;
  }

  async function saveProfile() {
    setSaveError('');
    setSaveSuccess('');

    if (!firstName.trim() || !lastName.trim()) {
      setSaveError('First and last name are required.');
      return;
    }

    setSaving(true);
    try {
      const saved = await sendProfile({
        firstName,
        lastName,
        bio,
        skills,
        interests,
        profilePicture
      });

      if (saved) {
        setProfilePicture(saved.profilePicture || null);
        setIsEditing(false);
        setSaveSuccess('Profile saved.');
      }
    } catch (error) {
      setSaveError(
        error.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please try again.'
          : error.message
      );
    } finally {
      setSaving(false);
    }
  }

  async function clearProfile() {
    const confirmed = window.confirm(
      'Are you sure you want to clear your bio, skills, interests, and picture?'
    );

    if (!confirmed) {
      return;
    }

    setSaveError('');
    setSaveSuccess('');
    setSaving(true);
    try {
      const saved = await sendProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: '',
        skills: [],
        interests: [],
        profilePicture: null
      });

      if (saved) {
        setProfilePicture(null);
        setSaveSuccess('Profile cleared.');
      }
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      navigate('/login');
    }
  }
  async function deleteAccount() {
    const confirmed = window.confirm(
      'Are you sure? This permanently deletes your account and cannot be undone.'
    );
    if (!confirmed) return;

    setDeleteError('');
    try {
      const response = await fetch(`/api/user-profiles/${profile.userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword })
      });

      if (response.ok) {
        navigate('/login');
        return;
      }

      const data = await response.json().catch(() => ({}));
      setDeleteError(data.error || 'Could not delete your account.');
    } catch {
      setDeleteError('Unable to connect to the server. Please try again.');
    }
  }

  function handlePictureChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      alert('Profile picture must be smaller than 2 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfilePicture(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function removePicture() {
    setProfilePicture(null);
  }

  function addSkill() {
    if (newSkill.trim() === '') return;

    const skill = findTag(newSkill);
    if (!skill) {
      setTagError(`"${newSkill.trim()}" isn't one of the site's tags. Pick one from the suggestions.`);
      return;
    }

    setTagError('');
    if (!skills.includes(skill)) {
      setSkills((currentSkills) => [...currentSkills, skill]);
    }
    setNewSkill('');
  }

  function removeSkill(skillToRemove) {
    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  }

  function addInterest() {
    if (newInterest.trim() === '') return;

  const interest = findTag(newInterest);
    if (!interest) {
      setTagError(`"${newInterest.trim()}" isn't one of the site's tags. Pick one from the suggestions.`);
      return;
  }

    setTagError('');
    if (!interests.includes(interest)) {
      setInterests((currentInterests) => [...currentInterests, interest]);
    }
    setNewInterest('');
  }

  function removeInterest(interestToRemove) {
    setInterests((currentInterests) =>
      currentInterests.filter((interest) => interest !== interestToRemove)
    );
  }

  // Let Enter add a tag instead of doing nothing
  function onEnter(action) {
    return (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        action();
      }
    };
  }

  const navbar = (
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
  );

  if (!profile) {
    return (
      <div className="profile-page-bg">
        {navbar}
        <main className="profile-page">
          <section className="profile-card profile-status">
            {loadError ? (
              <p className="profile-message profile-message-error">{loadError}</p>
            ) : (
              <p>Loading your profile...</p>
            )}
          </section>
        </main>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  // ---------- Numbers for the bento cards ----------
  const now = Date.now();
  const joinedJams = allJams.filter((jam) => enteredIds.includes(jam.id));
  const hostedJams = allJams.filter((jam) => jam.ownerUserId === profile.userId);
  const postedJobs = allJobs.filter((job) => job.ownerUserId === profile.userId);
  const postCount = myBlogs?.length ?? 0;
  const resourceCount = myResources?.length ?? 0;

  const stats = [
    { label: 'Posts', value: postCount },
    { label: 'Resources', value: resourceCount },
    { label: 'Jams joined', value: joinedJams.length },
    { label: 'Jams hosted', value: hostedJams.length },
    { label: 'Jobs posted', value: postedJobs.length },
    { label: 'Following', value: (followingIds || []).length }
  ];

  // Profile completeness: bio, picture, skills, interests
  const checklist = [
    { done: Boolean(profile.bio), label: 'a bio' },
    { done: Boolean(profile.profilePicture), label: 'a picture' },
    { done: profile.skills.length > 0, label: 'skills' },
    { done: profile.interests.length > 0, label: 'interests' }
  ];
  const completeness = Math.round(
    (checklist.filter((item) => item.done).length / checklist.length) * 100
  );
  const missing = checklist.filter((item) => !item.done).map((item) => item.label);

  // Badges earned from activity (locked ones are shown faded)
  const badges = [
    { name: 'Writer', detail: 'Wrote a blog post', earned: postCount >= 1, tone: '' },
    { name: 'First resource', detail: 'Shared a resource', earned: resourceCount >= 1, tone: '' },
    { name: 'Community helper', detail: 'Shared 5+ resources', earned: resourceCount >= 5, tone: 'amber' },
    { name: 'Jam participant', detail: 'Joined a jam', earned: joinedJams.length >= 1, tone: 'green' },
    { name: 'Jam host', detail: 'Hosted a jam', earned: hostedJams.length >= 1, tone: 'blue' },
    { name: 'Job poster', detail: 'Posted a job', earned: postedJobs.length >= 1, tone: 'blue' }
  ].sort((a, b) => Number(b.earned) - Number(a.earned));

  // Most-used tags across this user's resources
  const tagCounts = {};
  (myResources || []).forEach((resource) => {
    (resource.tags || []).forEach((tag) => {
      if (tag !== 'User Made') tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);

  // Jams this user hosts and jobs they posted, in one list
  const postedItems = [
    ...hostedJams.map((jam) => ({
      key: `jam-${jam.id}`,
      title: jam.title,
      detail: jam.start
        ? `Starts ${shortDate(jam.start)} · ${jam.entrants} joined`
        : `${jam.entrants} joined`,
      kind: 'Jam',
      to: `/jams/${jam.id}`
    })),
    ...postedJobs.map((job) => ({
      key: `job-${job.jobId}`,
      title: job.jobTitle,
      detail: (job.jobTags || []).slice(0, 3).join(' · ') || 'Job posting',
      kind: 'Job',
      to: '/jobs'
    }))
  ];

  return (
    <div className="profile-page-bg">
      {navbar}

      <main className="profile-page pb-page">

        {/* ---------- Identity card ---------- */}
        <section className="pb-card pb-identity">
          <div className="pb-cover" aria-hidden="true"></div>

          <div className="pb-identity-row">
            <div className="pb-avatar">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" />
              ) : (
                <span aria-hidden="true">
                  {getInitials(profile.firstName, profile.lastName)}
                </span>
              )}
            </div>

            <div className="pb-name">
              <span className="pb-kicker">CtrlF · Profile</span>
              <h1>{fullName}</h1>
              <span className="pb-handle">
                @{profile.username} · Member since {formatJoinDate(profile.joinDate)}
              </span>
            </div>

            {!isEditing && (
              <div className="pb-actions">
                <button type="button" className="pb-btn pb-btn-primary" onClick={startEditing}>
                  Edit profile
                </button>
                <button type="button" className="pb-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="pb-stats">
            {stats.map((stat) => (
              <div className="pb-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="pb-complete">
            <div className="pb-complete-text">
              <strong>Profile {completeness}% complete</strong>
              {missing.length > 0 ? (
                <span>Add {missing.join(', ')} to finish your profile</span>
              ) : (
                <span>Nice, your profile is all set</span>
              )}
            </div>
            <div
              className="pb-progress"
              role="progressbar"
              aria-label="Profile completeness"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completeness}
            >
              <span style={{ width: `${completeness}%` }} />
            </div>
          </div>
        </section>

        {saveSuccess && !isEditing && (
          <p className="profile-message profile-message-success pb-message">{saveSuccess}</p>
        )}
        {saveError && !isEditing && (
          <p className="profile-message profile-message-error pb-message">{saveError}</p>
        )}

        {isEditing ? (

          /* EDIT PROFILE */
          <section className="profile-card" style={{ marginTop: '18px' }}>
            <span className="profile-kicker">Edit</span>
            <h2>Edit Profile</h2>

            {/* Name */}
            <div className="profile-field-row">
              <div className="profile-field">
                <label htmlFor="profileFirstName">First Name</label>
                <input
                  id="profileFirstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="First name"
                  maxLength={30}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profileLastName">Last Name</label>
                <input
                  id="profileLastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Last name"
                  maxLength={30}
                />
              </div>
            </div>

            {/* Profile Picture */}
            <div className="profile-field">
              <label htmlFor="profilePicture">Profile Picture</label>
              <div className="profile-picture-row">
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                />

                {profilePicture && (
                  <button
                    type="button"
                    onClick={removePicture}
                    className="profile-btn profile-btn-secondary profile-btn-small"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="profile-field">
              <label htmlFor="profileBio">Bio</label>
              <textarea
                id="profileBio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows="5"
                maxLength={1000}
                placeholder="Tell people about yourself"
              />
              <span className="profile-hint">{bio.length}/1000</span>
            </div>

            {/* Skills */}
            <div className="profile-field">
              <label htmlFor="newSkill">Skills / Expertise</label>

              <div className="profile-tags">
                {skills.map((skill) => (
                  <span className="profile-tag" key={skill}>
                    {skill}
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="profile-add-row">
                <input
                  id="newSkill"
                  type="text"
                  list="profile-tag-options"
                  placeholder="Start typing, e.g. Unity"
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  onKeyDown={onEnter(addSkill)}
                />
                <button
                  type="button"
                  className="profile-btn profile-btn-secondary profile-btn-small"
                  onClick={addSkill}
                >
                  Add Skill
                </button>
              </div>
            </div>

            {/* Interests */}
            <div className="profile-field">
              <label htmlFor="newInterest">Interests</label>

              <div className="profile-tags">
                {interests.map((interest) => (
                  <span className="profile-tag" key={interest}>
                    {interest}
                    <button
                      type="button"
                      aria-label={`Remove ${interest}`}
                      onClick={() => removeInterest(interest)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="profile-add-row">
                <input
                  id="newInterest"
                  type="text"
                  list="profile-tag-options"
                  placeholder="Add an interest"
                  value={newInterest}
                  onChange={(event) => setNewInterest(event.target.value)}
                  onKeyDown={onEnter(addInterest)}
                />
                <button
                  type="button"
                  className="profile-btn profile-btn-secondary profile-btn-small"
                  onClick={addInterest}
                >
                  Add Interest
                </button>
              </div>
            </div>

            {/* Suggestions for both boxes above */}
            <datalist id="profile-tag-options">
              {profileTags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>

            {tagsStatus === 'error' && (
              <p className="profile-message profile-message-error">
                Couldn't load the tag list. Refresh the page and try again.
              </p>
            )}
            {tagError && (
              <p className="profile-message profile-message-error">{tagError}</p>
            )}

            {saveError && (
              <p className="profile-message profile-message-error">{saveError}</p>
            )}

            {/* Save / Cancel */}
            <div className="profile-form-actions">
              <button
                type="button"
                onClick={cancelEditing}
                className="profile-btn profile-btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className="profile-btn profile-btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </section>

        ) : (

          /* VIEW PROFILE: bento grid */
          <div className="pb-grid">

            {/* About */}
            <section className="pb-card pb-span2">
              <div>
                <span className="pb-kicker">About</span>
                <h2 className="pb-title">Bio</h2>
              </div>
              {profile.bio ? (
                <p className="pb-text">{profile.bio}</p>
              ) : (
                <p className="pb-empty">Tell people about yourself. Click Edit profile to add a bio.</p>
              )}
            </section>

            {/* Skills */}
            <section className="pb-card pb-span1">
              <div>
                <span className="pb-kicker">What I do</span>
                <h2 className="pb-title">Skills</h2>
              </div>
              {profile.skills.length > 0 ? (
                <div className="pb-tags">
                  {profile.skills.map((skill, index) => (
                    <span className={`pb-tag ${TAG_TONES[index % TAG_TONES.length]}`} key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="pb-empty">No skills added yet.</p>
              )}
            </section>

            {/* Interests */}
            <section className="pb-card pb-span1">
              <div>
                <span className="pb-kicker">What I like</span>
                <h2 className="pb-title">Interests</h2>
              </div>
              {profile.interests.length > 0 ? (
                <div className="pb-tags">
                  {profile.interests.map((interest) => (
                    <span className="pb-tag" key={interest}>{interest}</span>
                  ))}
                </div>
              ) : (
                <p className="pb-empty">No interests added yet.</p>
              )}
            </section>

            {/* Jams joined */}
            <section className="pb-card pb-span2">
              <div className="pb-card-head">
                <div>
                  <span className="pb-kicker">Jams</span>
                  <h2 className="pb-title">Jams I've joined</h2>
                </div>
                <Link className="pb-link" to="/jams">Find jams →</Link>
              </div>
              {joinedJams.length > 0 ? (
                <div className="pb-jams">
                  {joinedJams.slice(0, 4).map((jam) => {
                    const status = jamStatus(jam, now);
                    return (
                      <Link className="pb-jam" to={`/jams/${jam.id}`} key={jam.id}>
                        <div className="pb-jam-cover">
                          <span aria-hidden="true">{(jam.title || '?').trim().charAt(0).toUpperCase()}</span>
                          {jam.coverImageUrl && (
                            <img
                              src={jam.coverImageUrl}
                              alt=""
                              onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          {status.label && (
                            <span className={`pb-status ${status.className}`}>{status.label}</span>
                          )}
                        </div>
                        <div className="pb-jam-body">
                          <strong>{jam.title}</strong>
                          <span>{status.when}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="pb-empty">You haven't joined any jams yet.</p>
              )}
            </section>

            {/* Badges */}
            <section className="pb-card pb-span1">
              <div>
                <span className="pb-kicker">Achievements</span>
                <h2 className="pb-title">Badges</h2>
              </div>
              <div className="pb-badges">
                {badges.map((badge) => (
                  <div className={`pb-badge ${badge.earned ? '' : 'pb-badge-locked'}`} key={badge.name}>
                    <span className={`pb-badge-icon ${badge.tone}`} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="9" r="6" />
                        <path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" />
                      </svg>
                    </span>
                    <div className="pb-badge-text">
                      <strong>{badge.name}</strong>
                      <span>{badge.earned ? badge.detail : `Locked · ${badge.detail}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top tags */}
            <section className="pb-card pb-span1">
              <div>
                <span className="pb-kicker">Most used</span>
                <h2 className="pb-title">Top tags</h2>
              </div>
              {topTags.length > 0 ? (
                <div className="pb-tags">
                  {topTags.map((tag, index) => (
                    <span
                      className={`pb-tag ${index === 0 ? 'pb-tag-big' : index === 1 ? 'pb-tag-medium' : ''}`}
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="pb-empty">Share resources to see your top tags here.</p>
              )}
            </section>

            {/* Blog posts */}
            <section className="pb-card pb-span2">
              <div className="pb-card-head">
                <div>
                  <span className="pb-kicker">Activity</span>
                  <h2 className="pb-title">My posts</h2>
                </div>
                <Link className="pb-link" to="/blogs">Write a post →</Link>
              </div>

              {blogsError && <p className="pb-empty">{blogsError}</p>}
              {!myBlogs && !blogsError && <p className="pb-empty">Loading your posts...</p>}
              {myBlogs?.length === 0 && <p className="pb-empty">You haven't written any posts yet.</p>}

              {myBlogs?.length > 0 && (
                <div className="pb-list">
                  {myBlogs.slice(0, 4).map((blog) => (
                    <Link className="pb-item" to={`/blogs/${blog.blogId}`} key={blog.blogId}>
                      <span className="pb-icon" aria-hidden="true">
                        {(blog.blogTitle || '?').trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="pb-item-text">
                        <strong>{blog.blogTitle}</strong>
                        <span>
                          {blog.blogContent.length > 110
                            ? blog.blogContent.slice(0, 110) + '...'
                            : blog.blogContent}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Resources */}
            <section className="pb-card pb-span2">
              <div className="pb-card-head">
                <div>
                  <span className="pb-kicker">Contributions</span>
                  <h2 className="pb-title">My resources</h2>
                </div>
                <Link className="pb-link" to="/resources/manage">Manage →</Link>
              </div>

              {resourcesError && <p className="pb-empty">{resourcesError}</p>}
              {!myResources && !resourcesError && <p className="pb-empty">Loading your resources...</p>}
              {myResources?.length === 0 && (
                <p className="pb-empty">
                  You haven't shared any resources yet.{' '}
                  <Link className="pb-link" to="/resources/new">Share one</Link>
                </p>
              )}

              {myResources?.length > 0 && (
                <div className="pb-list">
                  {myResources.slice(0, 4).map((resource) => {
                    const content = (
                      <>
                        <span className="pb-icon" aria-hidden="true">
                          {(resource.siteName || '?').trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="pb-item-text">
                          <strong>{resource.siteName}</strong>
                          <span>{(resource.tags || []).filter((tag) => tag !== 'User Made').slice(0, 3).join(' · ')}</span>
                        </span>
                      </>
                    );
                    return isWebLink(resource.siteLink) ? (
                      <a
                        className="pb-item"
                        href={resource.siteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={resource.resourceId}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link className="pb-item" to={resource.siteLink || '/resources'} key={resource.resourceId}>
                        {content}
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Hosting and posting */}
            <section className="pb-card pb-span4">
              <div>
                <span className="pb-kicker">Posted by me</span>
                <h2 className="pb-title">Jams I'm hosting &amp; jobs I've posted</h2>
              </div>
              {postedItems.length > 0 ? (
                <div className="pb-list-grid">
                  {postedItems.map((item) => (
                    <Link className="pb-item" to={item.to} key={item.key}>
                      <span className="pb-item-text">
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                      </span>
                      <span className="pb-kind">{item.kind}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="pb-empty">
                  You haven't hosted a jam or posted a job yet.{' '}
                  <Link className="pb-link" to="/jams">Host a jam</Link>{' '}
                  or <Link className="pb-link" to="/jobs">post a job</Link>.
                </p>
              )}
            </section>

            {/* Clear Profile / Delete Account */}
            <div className="pb-footer pb-span4">
              <button
                type="button"
                className="pb-btn pb-btn-danger"
                onClick={clearProfile}
                disabled={saving}
              >
                Clear profile
              </button>

              {!showDelete && (
                <button
                  type="button"
                  className="pb-btn pb-btn-danger"
                  onClick={() => setShowDelete(true)}
                >
                  Delete account
                </button>
              )}
            </div>

            {showDelete && (
              <section className="profile-card pb-span4">
                <span className="profile-kicker">Danger zone</span>
                <h2>Delete Account</h2>
                <p>Enter your password to permanently delete your account.</p>

                <div className="profile-field">
                  <label htmlFor="deletePassword">Password</label>
                  <input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                  />
                </div>

                {deleteError && (
                  <p className="profile-message profile-message-error">{deleteError}</p>
                )}

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-btn profile-btn-secondary"
                    onClick={() => {
                      setShowDelete(false);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn-danger"
                    onClick={deleteAccount}
                  >
                    Permanently Delete
                  </button>
                </div>
              </section>
            )}
          </div>

        )}

      </main>
    </div>
  );
}

export default Profile;