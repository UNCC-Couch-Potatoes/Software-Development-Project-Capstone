import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Shell } from './ResourcePosts';
import { toCollab } from './Collabs';
import './style.css';

function CollabPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collab, setCollab] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setCollab(null);
    setError('');
    fetch(`/api/collabs/${id}`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 404) throw new Error('This collab does not exist.');
        if (!res.ok) throw new Error('Could not load this collab. Please try again later.');
        return res.json();
      })
      .then((data) => { if (!cancelled) setCollab(toCollab(data)); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [id]);

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/jams');
  };

  return (
    <Shell>
      <div className="jam-detail-actions">
        <button type="button" className="filter-button" onClick={goBack}>← Back</button>
      </div>

      {error && <p className="job-form-error" role="alert">{error}</p>}
      {!error && !collab && <p className="jobs-count" role="status">Loading collab...</p>}

      {collab && (
        <article className="job-card">
          <h1 className="jam-detail-title">{collab.title}</h1>
          <span className="job-domain">{collab.location}</span>
          <p>{collab.description}</p>

          {collab.detailedDescription ? (
            <div className="jam-body">
              <ReactMarkdown>{collab.detailedDescription}</ReactMarkdown>
            </div>
          ) : (
            <p className="jobs-count jam-body">No long description was added.</p>
          )}
        </article>
      )}
    </Shell>
  );
}

export default CollabPage;