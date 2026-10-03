import { useState } from 'react';
import './style.css';
import './resources.css';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || 'Incorrect username/email or password.');
        return;
      }

      const user = await response.json();
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/Profile');
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div id="navbar">
        <Link to="/">Home</Link>
        <Link to="/Blogs">Blogs</Link>
        <Link to="/Jams">Jams</Link>
        <Link to="/Jobs">Jobs</Link>
        <Link to="/Profile">Profile</Link>
        <Link to="/Resources">Resources</Link>
        <Link to="/login">Login</Link>
      </div>

      <main className="profile-container">
        <section className="profile-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Ctrl+F</p>
        </section>

        <section className="profile-section">
          <form className="profile-form" onSubmit={handleLogin}>
            <div className="profile-form-field">
              <label htmlFor="usernameOrEmail">Username or Email</label>
              <input
                id="usernameOrEmail"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="profile-form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="edit-profile-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </section>

        <section className="profile-section auth-footer">
          <p>Don't have an account?</p>
          <Link to="/register" className="edit-profile-button">
            Create Account
          </Link>
        </section>
      </main>
    </>
  );
}

export default Login;