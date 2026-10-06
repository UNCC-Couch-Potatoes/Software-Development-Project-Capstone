import { useState } from 'react';
import './profile.css';
import './resources.css';
import { Link, useNavigate } from 'react-router-dom';

const defaultProfile = {
  name: 'Your Name',
  bio: 'Welcome to my profile! Tell other users a little about yourself here.',
  skills: [
    'JavaScript',
    'React',
    'Web Development'
  ],
  interests: [
    'Gaming',
    'Technology'
  ],
  profilePicture: null,
  dateJoined: 'September 2026'
};

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

function getStoredProfile() {
  const storedProfile = localStorage.getItem('profileData');

  if (!storedProfile) {
    return defaultProfile;
  }

  try {
    return {
      ...defaultProfile,
      ...JSON.parse(storedProfile)
    };
  } catch {
    return defaultProfile;
  }
}

function getStoredPosts() {
  const storedPosts = localStorage.getItem('posts');

  if (!storedPosts) {
    return defaultPosts;
  }

  try {
    return JSON.parse(storedPosts);
  } catch {
    return defaultPosts;
  }
}

function Profile() {
  const navigate = useNavigate();

  const [savedProfile, setSavedProfile] = useState(
    getStoredProfile
  );

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(savedProfile.name);
  const [bio, setBio] = useState(savedProfile.bio);

  const [skills, setSkills] = useState(
    savedProfile.skills
  );

  const [interests, setInterests] = useState(
    savedProfile.interests
  );

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [profilePicture, setProfilePicture] = useState(
    savedProfile.profilePicture
  );

  const [dateJoined, setDateJoined] = useState(
    savedProfile.dateJoined
  );

  const [posts] = useState(getStoredPosts);

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

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert('Profile picture must be smaller than 5 MB.');
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

    if (skill !== '') {
      setSkills((currentSkills) => [
        ...currentSkills,
        skill
      ]);

      setNewSkill('');
    }
  }

  function removeSkill(skillToRemove) {
    setSkills((currentSkills) =>
      currentSkills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  }

  function addInterest() {
    const interest = newInterest.trim();

    if (interest !== '') {
      setInterests((currentInterests) => [
        ...currentInterests,
        interest
      ]);

      setNewInterest('');
    }
  }

  function removeInterest(interestToRemove) {
    setInterests((currentInterests) =>
      currentInterests.filter(
        (interest) => interest !== interestToRemove
      )
    );
  }

  function saveProfile() {
    const updatedProfile = {
      name: name.trim(),
      bio: bio.trim(),
      skills,
      interests,
      profilePicture,
      dateJoined
    };

    localStorage.setItem(
      'profileData',
      JSON.stringify(updatedProfile)
    );

    setSavedProfile(updatedProfile);
    setIsEditing(false);
  }

  function cancelEditing() {
    setName(savedProfile.name);
    setBio(savedProfile.bio);

    setSkills([
      ...savedProfile.skills
    ]);

    setInterests([
      ...savedProfile.interests
    ]);

    setProfilePicture(
      savedProfile.profilePicture
    );

    setDateJoined(
      savedProfile.dateJoined
    );

    setNewSkill('');
    setNewInterest('');

    setIsEditing(false);
  }

  function clearProfile() {
    const confirmed = window.confirm(
      'Are you sure you want to reset your profile to the default profile?'
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem('profileData');

    setSavedProfile({
      ...defaultProfile,
      skills: [...defaultProfile.skills],
      interests: [...defaultProfile.interests]
    });

    setName(defaultProfile.name);
    setBio(defaultProfile.bio);

    setSkills([
      ...defaultProfile.skills
    ]);

    setInterests([
      ...defaultProfile.interests
    ]);

    setProfilePicture(
      defaultProfile.profilePicture
    );

    setDateJoined(
      defaultProfile.dateJoined
    );

    setNewSkill('');
    setNewInterest('');

    setIsEditing(false);
  }
    function getInitials(fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

    return (
    <div className="profile-page-bg">
      {/* Navigation Bar */}
      <div id="navbar">
        <Link to="/">Home</Link>
        <Link to="/Blogs">Blogs</Link>
        <Link to="/Jams">Jams</Link>
        <Link to="/Jobs">Jobs</Link>
        <Link to="/Profile">Profile</Link>
        <Link to="/Resources">Resources</Link>
      </div>

      <main className="profile-page">

        {/* Profile Header */}
        <section className="profile-header">
          <div className="profile-avatar">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" />
            ) : (
              <span aria-hidden="true">{getInitials(name)}</span>
            )}
          </div>

          <span className="profile-kicker">Profile</span>
          <h1>{name || 'Your Name'}</h1>
          <p className="profile-joined">Member since {dateJoined}</p>

          {!isEditing && (
            <div className="profile-actions">
              <button
                type="button"
                className="profile-btn profile-btn-primary"
                onClick={() => setIsEditing(true)}
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

        {isEditing ? (

          /* EDIT PROFILE */
          <section className="profile-card">
            <span className="profile-kicker">Edit</span>
            <h2>Edit Profile</h2>

            {/* Name */}
            <div className="profile-field">
              <label htmlFor="profileName">Name</label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
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
                placeholder="Tell people about yourself"
              />
            </div>

            {/* Skills */}
            <div className="profile-field">
              <label htmlFor="newSkill">Skills / Expertise</label>

              <div className="profile-tags">
                {skills.map((skill, index) => (
                  <span className="profile-tag" key={`${skill}-${index}`}>
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
                {interests.map((interest, index) => (
                  <span className="profile-tag" key={`${interest}-${index}`}>
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

            {/* Save / Cancel */}
            <div className="profile-form-actions">
              <button
                type="button"
                onClick={cancelEditing}
                className="profile-btn profile-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProfile}
                className="profile-btn profile-btn-primary"
              >
                Save Changes
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
                {bio ? (
                  <p>{bio}</p>
                ) : (
                  <p className="profile-empty">Tell people about yourself.</p>
                )}
              </section>

              {/* Skills */}
              <section className="profile-card">
                <span className="profile-kicker">What I do</span>
                <h2>Skills / Expertise</h2>
                {skills.length > 0 ? (
                  <div className="profile-tags">
                    {skills.map((skill, index) => (
                      <span className="profile-tag" key={`${skill}-${index}`}>
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
                {interests.length > 0 ? (
                  <div className="profile-tags">
                    {interests.map((interest, index) => (
                      <span className="profile-tag" key={`${interest}-${index}`}>
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