import { useState } from 'react';
import './style.css';
import { Link } from 'react-router-dom';

function Profile() {

  // Load the saved profile from localStorage
  const [savedProfile, setSavedProfile] = useState(() => {
    const storedProfile = localStorage.getItem('profileData');

    if (storedProfile) {
      return JSON.parse(storedProfile);
    }

    return {
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
      profilePicture: null
    };
  });

  // Editable profile information
  const [name, setName] = useState(savedProfile.name);
  const [bio, setBio] = useState(savedProfile.bio);
  const [skills, setSkills] = useState(savedProfile.skills);
  const [interests, setInterests] = useState(savedProfile.interests);
  const [profilePicture, setProfilePicture] = useState(
    savedProfile.profilePicture
  );

  const [isEditing, setIsEditing] = useState(false);

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [dateJoined] = useState('September 2026');

  // Previous Posts
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


  // Profile Picture
  function handlePictureChange(event) {
    const file = event.target.files[0];

    if (file) {

      // Optional file size limit: 5 MB
      const maxSize = 5 * 1024 * 1024;

      if (file.size > maxSize) {
        alert('Profile picture must be smaller than 5 MB.');
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };

      reader.readAsDataURL(file);
    }
  }


  function removePicture() {
    setProfilePicture(null);
  }


  // Skills
  function addSkill() {
    if (newSkill.trim() !== '') {

      setSkills([
        ...skills,
        newSkill.trim()
      ]);

      setNewSkill('');
    }
  }


  function removeSkill(skillToRemove) {
    setSkills(
      skills.filter(
        (skill) => skill !== skillToRemove
      )
    );
  }


  // Interests
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


  // SAVE PROFILE
  function saveProfile() {

    const updatedProfile = {
      name: name,
      bio: bio,
      skills: skills,
      interests: interests,
      profilePicture: profilePicture
    };

    // Save profile to browser storage
    localStorage.setItem(
      'profileData',
      JSON.stringify(updatedProfile)
    );

    // Update the saved version
    setSavedProfile(updatedProfile);

    // Exit editing mode
    setIsEditing(false);

    // Clear temporary inputs
    setNewSkill('');
    setNewInterest('');
  }


  // CANCEL EDITING
  function cancelEditing() {

    // Restore the last saved information
    setName(savedProfile.name);
    setBio(savedProfile.bio);
    setSkills(savedProfile.skills);
    setInterests(savedProfile.interests);
    setProfilePicture(savedProfile.profilePicture);

    // Clear temporary inputs
    setNewSkill('');
    setNewInterest('');

    // Exit editing mode
    setIsEditing(false);
  }


  return (
    <>
      {/* Navigation Bar */}
      <div id="navbar">

        <Link to="/">Home</Link>

        <Link to="/Blogs">
          Blogs
        </Link>

        <Link to="/Jams">
          Jams
        </Link>

        <Link to="/Jobs">
          Jobs
        </Link>

        <Link to="/Profile">
          Profile
        </Link>

        <Link to="/Resources">
          Resources
        </Link>

      </div>


      <main className="profile-container">

        {/* PROFILE HEADER */}
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


          <h1>
            {name}
          </h1>


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

            <h2>
              Edit Profile
            </h2>


            {/* NAME */}
            <div className="form-section">

              <label>
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />

            </div>


            {/* PROFILE PICTURE */}
            <div className="form-section">

              <label>
                Profile Picture
              </label>

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


            {/* BIO */}
            <div className="form-section">

              <label>
                Bio
              </label>

              <textarea
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                rows="5"
              />

            </div>


            {/* SKILLS */}
            <div className="form-section">

              <label>
                Skills / Expertise
              </label>


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


            {/* INTERESTS */}
            <div className="form-section">

              <label>
                Interests
              </label>


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


            {/* SAVE / CANCEL */}
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

            {/* BIO */}
            <div className="profile-section">

              <h2>
                Bio
              </h2>

              <p>
                {bio}
              </p>

            </div>


            {/* SKILLS */}
            <div className="profile-section">

              <h2>
                Skills / Expertise
              </h2>


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


            {/* interests */}
            <div className="profile-section">

              <h2>
                Interests
              </h2>


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


            {/* previous posts */}
            <div className="profile-section">

              <h2>
                Previous Posts
              </h2>


              {posts.map((post) => (

                <article
                  className="previous-post"
                  key={post.id}
                >

                  <h3>
                    {post.title}
                  </h3>

                  <p>
                    {post.content}
                  </p>

                </article>

              ))}

            </div>


            {/* DATE JOINED */}
            <div className="profile-section">

              <h2>
                Date Joined
              </h2>

              <p>
                {dateJoined}
              </p>

            </div>

          </section>

        )}

      </main>
    </>
  );
}

export default Profile;