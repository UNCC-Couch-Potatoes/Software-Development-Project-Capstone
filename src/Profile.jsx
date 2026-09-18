import { useState } from 'react';
import './style.css';
import './resources.css';
import { Link } from 'react-router-dom';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('Your Name');
  const [bio, setBio] = useState(
    'Welcome to my profile! Tell other users a little about yourself here.'
  );

  const [skills, setSkills] = useState([
    'JavaScript',
    'React',
    'Web Development'
  ]);

  const [interests, setInterests] = useState([
    'Gaming',
    'Technology'
  ]);

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [profilePicture, setProfilePicture] = useState(null);

  const [dateJoined] = useState('September 2026');

  const [posts] = useState([
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
  ]);

  function handlePictureChange(event) {
    const file = event.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfilePicture(imageURL);
    }
  }

  function removePicture() {
    setProfilePicture(null);
  }

  function addSkill() {
    if (newSkill.trim() !== '') {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  }

  function removeSkill(skillToRemove) {
    setSkills(
      skills.filter((skill) => skill !== skillToRemove)
    );
  }

  function addInterest() {
    if (newInterest.trim() !== '') {
      setInterests([
        ...interests,
        newInterest.trim()
      ]);

      setNewInterest('');
    }
  }

  function removeInterest(interestToRemove) {
    setInterests(
      interests.filter(
        (interest) => interest !== interestToRemove
      )
    );
  }

  function saveProfile() {
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

                {skills.map((skill) => (
                  <span
                    className="tag"
                    key={skill}
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

                {interests.map((interest) => (
                  <span
                    className="tag"
                    key={interest}
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
                onClick={() => setIsEditing(false)}
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

                {skills.map((skill) => (
                  <span
                    className="tag"
                    key={skill}
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

                {interests.map((interest) => (
                  <span
                    className="tag"
                    key={interest}
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

          </section>
        )}

      </main>
    </>
  );
}

export default Profile;