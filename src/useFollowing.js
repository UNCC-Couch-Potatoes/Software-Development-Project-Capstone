import { useCallback, useEffect, useState } from 'react';

// Tracks which users the logged-in user follows, so a page can show Follow / Unfollow buttons.
// Pass the logged-in user's id (null while logged out or still loading).
function useFollowing(userId) {
  const [followingIds, setFollowingIds] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId === null) {
      setFollowingIds([]);
      return undefined;
    }
    let cancelled = false;
    fetch('/api/followers/following', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((ids) => { if (!cancelled) setFollowingIds(ids); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  const toggleFollow = useCallback(async (targetId) => {
    const following = followingIds.includes(targetId);
    setBusyId(targetId);
    setError('');
    try {
      const res = await fetch(`/api/followers/follow/${targetId}`, {
        method: following ? 'DELETE' : 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Please log in to follow people.' : 'Could not update follow. Please try again.');
      }
      setFollowingIds((current) => (following
        ? current.filter((id) => id !== targetId)
        : [...new Set([...current, targetId])]));
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Could not reach the server.' : err.message);
    } finally {
      setBusyId(null);
    }
  }, [followingIds]);

  return { followingIds, busyId, followError: error, toggleFollow };
}

export default useFollowing;