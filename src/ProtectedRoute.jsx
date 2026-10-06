import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => setStatus(res.ok ? 'in' : 'out'))
      .catch(() => setStatus('out'));
  }, []);

  if (status === 'loading') return <p>Loading...</p>;
  return status === 'in' ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;