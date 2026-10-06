import { useState } from 'react';
import './style.css';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError('');

    // Same rules the backend enforces, checked here so users get instant feedback
    if (form.password.length < 8 || form.password.length > 72) {
      setError('Password must be 8 to 72 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || 'Could not create your account. Please try again.');
        return;
      }

      // The backend logs the new user in automatically, so go straight home
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
        <span className="login-kicker">Get Started</span>
        <h1>Create Account</h1>
        <p className="login-subtitle">Join Ctrl+F in a few seconds</p>

        <form onSubmit={handleRegister}>
          <div className="login-row">
            <div className="login-field">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={updateField}
                placeholder="First name"
                autoComplete="given-name"
                maxLength={30}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={updateField}
                placeholder="Last name"
                autoComplete="family-name"
                maxLength={30}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={updateField}
              placeholder="Choose a username"
              autoComplete="username"
              maxLength={30}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={100}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account?</p>
          <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;