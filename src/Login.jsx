import { useState } from 'react';
import './style.css';
import './login.css';
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || 'Incorrect username/email or password.');
        return;
      }

      navigate('/');
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">Ctrl+F</div>
        <span className="login-kicker">Welcome</span>
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue to Ctrl+F</p>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="usernameOrEmail">Username or Email</label>
            <input
              id="usernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;