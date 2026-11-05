import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Shell } from './ResourcePosts';
import { formatDate, formatSpan, getStatus, toJam } from './Jams';
import './style.css';

// Detailed page for a single game jam, opened from the title on the Jams page
function JamPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jam, setJam] = useState(null);
  const [error, setError] = useState('');
  // Refreshed every second so the countdown ticks, like on the jam cards
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setJam(null);
    setError('');
    fetch(`/api/jams/${id}`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 404) throw new Error('This jam does not exist.');
        if (!res.ok) throw new Error('Could not load this jam. Please try again later.');
        return res.json();
      })
      .then((data) => { if (!cancelled) setJam(toJam(data)); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [id]);

  // Go back to wherever the user came from, or to the jam list if they landed here directly
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/jams');
  };

  const status = jam ? getStatus(jam, now) : null;

  return (
    <Shell>
      <div className="jam-detail-actions">
        <button type="button" className="filter-button" onClick={goBack}>← Back</button>
      </div>

      {error && <p className="job-form-error" role="alert">{error}</p>}
      {!error && !jam && <p className="jobs-count" role="status">Loading jam...</p>}

      {jam && (
        <article className="job-card">
          {jam.coverImageUrl && (
            <img
              className="jam-cover"
              src={jam.coverImageUrl}
              alt={`Cover for ${jam.title}`}
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          )}
          <h1 className="jam-detail-title">{jam.title}</h1>
          {status && <span className={`jam-status ${status.live ? 'live' : ''}`}>{status.label}</span>}
          {jam.tags.length > 0 && <h3>{jam.tags.join(' · ')}</h3>}
          <p>{jam.description}</p>

          <dl className="jam-meta">
            {jam.start && jam.end ? (
              <>
                <div><dt>Starts</dt><dd>{formatDate(jam.start)}</dd></div>
                <div><dt>Ends</dt><dd>{formatDate(jam.end)}</dd></div>
                <div><dt>Duration</dt><dd>{formatSpan(jam.end.getTime() - jam.start.getTime())}</dd></div>
              </>
            ) : (
              <div><dt>When</dt><dd>Dates not set</dd></div>
            )}
            <div><dt>Participants</dt><dd>{jam.entrants}</dd></div>
          </dl>

          {jam.detailedDescription ? (
            <div className="jam-body">
              <ReactMarkdown>{jam.detailedDescription}</ReactMarkdown>
            </div>
          ) : (
            <p className="jobs-count jam-body">The organizer has not added a detailed description yet.</p>
          )}
        </article>
      )}
    </Shell>
  );
}

export default JamPage;