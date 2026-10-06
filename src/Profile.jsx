import { useEffect, useState } from 'react';
import './style.css';
import './resources.css';
import './profile.css';
import { Link, useNavigate } from 'react-router-dom';

// Example posts until the blog feature is connected to the backend
const defaultPosts = [
  {
    id: 1,
    title: 'My First Post',
    content: 'This is an example of a previous post.'
  },
  {
    id: 2,
    title: 'Welcome!',
    content: 'This is another example post on my profile.'
  }
];

// The picture is stored in this browser, separately for each user
function pictureKey(userId) {
  return `profilePicture:${userId}`;
}

function loadPicture(userId) {
  try {
    return localStorage.getItem(pictureKey(userId));
  } catch {
    return null;
  }
}

function savePicture(userId, picture) {
  try {
    if (picture) {
      localStorage.setItem(pictureKey(userId), picture);
    } else {
      localStorage.removeItem(pictureKey(userId));
    }
  } catch {
    // Storage full or blocked; the picture just won't be remembered
  }
}

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

function Profile() {
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
  const [profilePicture, setProfilePicture] = useState(null);

  // Save feedback
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [posts] = useState(defaultPosts);

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
        setProfilePicture(loadPicture(data.userId));
      } catch {
        setLoadError('Unable to connect to the server. Please try again.');
      }
    }

    loadProfile();
  }, [navigate]);

  function fillFormFrom(source) {
    setFirstName(source.firstName || '');
    setLastName(source.lastName || '');
    setBio(source.bio || '');
    setSkills([...(source.skills || [])]);
    setInterests([...(source.interests || [])]);
    setNewSkill('');
    setNewInterest('');
  }

  function startEditing() {
    fillFormFrom(profile);
    setSaveError('');
    setSaveSuccess('');
    setIsEditing(true);
  }

  function cancelEditing() {
    fillFormFrom(profile);
    setProfilePicture(loadPicture(profile.userId));
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
        interests
      });

      if (saved) {
        savePicture(saved.userId, profilePicture);
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
        interests: []
      });

      if (saved) {
        savePicture(saved.userId, null);
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
    const skill = newSkill.trim();

    if (skill !== '' && !skills.includes(skill)) {
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
    const interest = newInterest.trim();

    if (interest !== '' && !interests.includes(interest)) {
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
    <div id="navbar">
      <Link to="/">Home</Link>
      <Link to="/Blogs">Blogs</Link>
      <Link to="/Jams">Jams</Link>
      <Link to="/Jobs">Jobs</Link>
      <Link to="/Profile">Profile</Link>
      <Link to="/Resources">Resources</Link>
    </div>
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

  return (
    <div className="profile-page-bg">
      {navbar}

      <main className="profile-page">

        {/* Profile Header */}
        <section className="profile-header">
          <div className="profile-avatar">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" />
            ) : (
              <span aria-hidden="true">
                {getInitials(profile.firstName, profile.lastName)}
              </span>
            )}
          </div>

          <span className="profile-kicker">Profile</span>
          <h1>{fullName}</h1>
          <p className="profile-joined">
            @{profile.username} · Member since {formatJoinDate(profile.joinDate)}
          </p>

          {!isEditing && (
            <div className="profile-actions">
              <button
                type="button"
                className="profile-btn profile-btn-primary"
                onClick={startEditing}
              >
                Edit Profile
              </button>

              <button
                type="button"
                className="profile-btn profile-btn-secondary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </section>

        {saveSuccess && !isEditing && (
          <p className="profile-message profile-message-success">{saveSuccess}</p>
        )}
        {saveError && !isEditing && (
          <p className="profile-message profile-message-error">{saveError}</p>
        )}

        {isEditing ? (

          /* EDIT PROFILE */
          <section className="profile-card">
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
                  placeholder="Add a skill"
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

          /* VIEW PROFILE */
          <>
            <div className="profile-grid">

              {/* Bio */}
              <section className="profile-card profile-span-2">
                <span className="profile-kicker">About</span>
                <h2>Bio</h2>
                {profile.bio ? (
                  <p className="profile-bio">{profile.bio}</p>
                ) : (
                  <p className="profile-empty">Tell people about yourself.</p>
                )}
              </section>

              {/* Skills */}
              <section className="profile-card">
                <span className="profile-kicker">What I do</span>
                <h2>Skills / Expertise</h2>
                {profile.skills.length > 0 ? (
                  <div className="profile-tags">
                    {profile.skills.map((skill) => (
                      <span className="profile-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="profile-empty">No skills added yet.</p>
                )}
              </section>

              {/* Interests */}
              <section className="profile-card">
                <span className="profile-kicker">What I like</span>
                <h2>Interests</h2>
                {profile.interests.length > 0 ? (
                  <div className="profile-tags">
                    {profile.interests.map((interest) => (
                      <span className="profile-tag" key={interest}>
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="profile-empty">No interests added yet.</p>
                )}
              </section>

              {/* Previous Posts */}
              <section className="profile-card profile-span-2">
                <span className="profile-kicker">Activity</span>
                <h2>Previous Posts</h2>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <article className="profile-post" key={post.id}>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                    </article>
                  ))
                ) : (
                  <p className="profile-empty">No posts yet.</p>
                )}
              </section>

            </div>

            {/* Clear Profile */}
            <div className="profile-footer">
              <button
                type="button"
                className="profile-btn profile-btn-danger profile-btn-small"
                onClick={clearProfile}
                disabled={saving}
              >
                Clear Profile
              </button>
            </div>
          </>

        )}

      </main>
    </div>
  );
}

export default Profile;