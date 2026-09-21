import { useState } from 'react';
import './style.css';
import './resources.css';
import { Link } from 'react-router-dom';

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

  return (
    <>
      {/* Navigation Bar */}
      <div id="navbar">
        <Link to="/">Home</Link>
        <Link to="/Blogs">Blogs</Link>
        <Link to="/Jams">Jams</Link>
        <Link to="/Jobs">Jobs</Link>
        <Link to="/Profile">Profile</Link>
        <Link to="/Resources">Resources</Link>
      </div>

      <main className="profile-container">

        {/* Profile Header */}
        <section className="profile-header">

          <div className="profile-image-container">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="profile-picture"
              />
            ) : (
              <div className="profile-placeholder">
                Profile Picture
              </div>
            )}
          </div>

          <h1>{name}</h1>

          <p>
            Member since {dateJoined}
          </p>

          {!isEditing && (
            <button
              className="edit-profile-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}

        </section>


        {/* EDIT PROFILE */}
        {isEditing ? (

          <section className="edit-profile">

            <h2>Edit Profile</h2>

            {/* Name */}
            <div className="form-section">

              <label>Name</label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />

            </div>


            {/* Profile Picture */}
            <div className="form-section">

              <label>Profile Picture</label>

              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
              />

              {profilePicture && (
                <button
                  type="button"
                  onClick={removePicture}
                  className="remove-button"
                >
                  Remove Picture
                </button>
              )}

            </div>


            {/* Bio */}
            <div className="form-section">

              <label>Bio</label>

              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                rows="5"
              />

            </div>


            {/* Skills */}
            <div className="form-section">

              <label>Skills / Expertise</label>

              <div className="tag-container">

                {skills.map((skill, index) => (
                  <span
                    className="tag"
                    key={`${skill}-${index}`}
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(skill)
                      }
                    >
                      ×
                    </button>

                  </span>
                ))}

              </div>

              <div className="add-item">

                <input
                  type="text"
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(event) =>
                    setNewSkill(event.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={addSkill}
                >
                  Add Skill
                </button>

              </div>

            </div>


            {/* Interests */}
            <div className="form-section">

              <label>Interests</label>

              <div className="tag-container">

                {interests.map((interest, index) => (
                  <span
                    className="tag"
                    key={`${interest}-${index}`}
                  >
                    {interest}

                    <button
                      type="button"
                      onClick={() =>
                        removeInterest(interest)
                      }
                    >
                      ×
                    </button>

                  </span>
                ))}

              </div>

              <div className="add-item">

                <input
                  type="text"
                  placeholder="Add an interest"
                  value={newInterest}
                  onChange={(event) =>
                    setNewInterest(event.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={addInterest}
                >
                  Add Interest
                </button>

              </div>

            </div>


            {/* Save / Cancel */}
            <div className="profile-buttons">

              <button
                type="button"
                onClick={cancelEditing}
                className="cancel-button"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                className="save-button"
              >
                Save Changes
              </button>

            </div>

          </section>

        ) : (

          /* VIEW PROFILE */
          <section className="profile-information">

            {/* Bio */}
            <div className="profile-section">

              <h2>Bio</h2>

              <p>{bio}</p>

            </div>


            {/* Skills */}
            <div className="profile-section">

              <h2>Skills / Expertise</h2>

              <div className="tag-container">

                {skills.map((skill, index) => (
                  <span
                    className="tag"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </div>


            {/* Interests */}
            <div className="profile-section">

              <h2>Interests</h2>

              <div className="tag-container">

                {interests.map((interest, index) => (
                  <span
                    className="tag"
                    key={`${interest}-${index}`}
                  >
                    {interest}
                  </span>
                ))}

              </div>

            </div>


            {/* Previous Posts */}
            <div className="profile-section">

              <h2>Previous Posts</h2>

              {posts.map((post) => (
                <article
                  className="previous-post"
                  key={post.id}
                >
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </article>
              ))}

            </div>


            {/* Date Joined */}
            <div className="profile-section">

              <h2>Date Joined</h2>

              <p>{dateJoined}</p>

            </div>


            {/* Clear Profile */}
            <div className="clear-profile-section">

              <button
                type="button"
                className="clear-profile-button"
                onClick={clearProfile}
              >
                Clear Profile
              </button>

            </div>

          </section>

        )}

      </main>
    </>
  );
}

export default Profile;