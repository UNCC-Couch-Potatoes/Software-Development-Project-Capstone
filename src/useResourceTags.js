import { useEffect, useState } from 'react';


// logic for getting resource tags so that we can have a list of tags to choose from when tagging user made resources.
export default function useResourceTags() {
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/resource-tags', { credentials: 'include', signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Unable to load resource tags.');
        return response.json();
      })
      .then(data => {
        if (!data.some(group => group.tags.includes('User Made'))) {
          throw new Error('The resource tag catalog has not been loaded.');
        }
        setGroups(data);
        setStatus('ready');
      })
      .catch(requestError => {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message);
          setStatus('error');
        }
      });
    return () => controller.abort();
  }, []);
  return { groups, status, error };
}
