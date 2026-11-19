import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const POLL_MS = 60000;
const TYPE_LABELS = { POST: 'Post', JAM: 'Jam', JOB: 'Job' };

function timeAgo(iso) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
}

function NotificationBell() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');

  const load = useCallback((signal) => {
    fetch('/api/notifications', { credentials: 'include', signal })
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load notifications.');
        return res.json();
      })
      .then((feed) => { setItems(feed.items); setUnread(feed.unreadCount); setError(''); })
      .catch((err) => { if (err.name !== 'AbortError') setError('Unable to load notifications.'); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const timer = setInterval(() => load(controller.signal), POLL_MS);
    const onFocus = () => load(controller.signal);
    window.addEventListener('focus', onFocus);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open) load();
    setOpen((value) => !value);
  };

  const openNotification = (item) => {
    if (!item.read) {
      setItems((list) => list.map((n) => (n.notificationId === item.notificationId ? { ...n, read: true } : n)));
      setUnread((count) => Math.max(0, count - 1));
      fetch(`/api/notifications/${item.notificationId}/read`, { method: 'POST', credentials: 'include' })
        .catch(() => {});
    }
    setOpen(false);
    navigate(item.linkPath);
  };

  const markAllRead = () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnread(0);
    fetch('/api/notifications/read-all', { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  return (
    <div className="notification-bell" ref={wrapperRef}>
      <button type="button" className="notification-bell-button"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open} aria-controls="notification-panel" onClick={toggle}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && <span className="notification-badge" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}
      </button>

      <div id="notification-panel" className="notification-panel" hidden={!open}>
        <div className="notification-panel-header">
          <h2>Notifications</h2>
          <button type="button" className="notification-mark-all" onClick={markAllRead} disabled={unread === 0}>
            Mark all as read
          </button>
        </div>
        {error && <p className="notification-empty" role="status">{error}</p>}
        {!error && items.length === 0 && (
          <p className="notification-empty" role="status">No notifications yet.</p>
        )}
        <ul className="notification-list">
          {items.map((item) => (
            <li key={item.notificationId}>
              <button type="button" className={`notification-item${item.read ? '' : ' unread'}`}
                onClick={() => openNotification(item)}>
                <span className={`notification-type notification-type-${item.type.toLowerCase()}`}>
                  {TYPE_LABELS[item.type] || item.type}
                </span>
                <span className="notification-message">{item.message}</span>
                <span className="notification-time">{timeAgo(item.createdAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NotificationBell;