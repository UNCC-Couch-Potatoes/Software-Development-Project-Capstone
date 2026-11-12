import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import './home.css';

const userActivity = [
  {
    title: 'Posted blogs', route: '/blogs',
    items: [
      { title: 'Building responsive enemy AI', meta: 'Draft · Updated today' },
      { title: 'What I learned from my first game jam', meta: 'Published · 248 views' },
    ],
  },

];

const trendingBlogs = [
  {
    title: 'Making combat feel good without adding complexity', creator: 'Maya Chen',
    description: 'A practical breakdown of hit pause, anticipation, sound, and readable feedback.',
    tags: ['Game Design', 'Combat'], stat: '1.8k views', accent: 'violet',
  },
  {
    title: 'A beginner-friendly guide to procedural rooms', creator: 'Theo Ramirez',
    description: 'Build varied dungeon layouts from reusable room templates and simple rules.',
    tags: ['Programming', 'Tutorial'], stat: '946 views', accent: 'blue',
  },
  {
    title: 'How we found the visual language for Starling', creator: 'North Loop Games',
    description: 'From early sketches to a color system that supports both mood and gameplay.',
    tags: ['Art', 'Devlog'], stat: '723 views', accent: 'coral',
  },
  {
    title: 'Writing music that reacts to the player', creator: 'Nia Brooks',
    description: 'Layer stems and transitions to make a soundtrack respond naturally to action.',
    tags: ['Audio', 'Music'], stat: '611 views', accent: 'green',
  },
];

const newBlogs = [
  {
    title: 'Day 14: our first playable build', creator: 'Pocket Arcade',
    description: 'The movement, camera, and first enemy encounter finally work together.',
    tags: ['Devlog', 'Indie'], stat: '12 min ago', accent: 'green',
  },
  {
    title: 'Choosing a color palette for readable levels', creator: 'Elena Park',
    description: 'A small set of constraints that keeps environments attractive and easy to read.',
    tags: ['Art', 'Level Design'], stat: '38 min ago', accent: 'coral',
  },
  {
    title: 'My first week switching from Unity to Godot', creator: 'Jordan Bell',
    description: 'The surprises, shortcuts, and rough edges I found while rebuilding a prototype.',
    tags: ['Godot', 'Programming'], stat: '1 hr ago', accent: 'blue',
  },
  {
    title: 'Designing quests that respect player time', creator: 'Sam Rivera',
    description: 'How clearer goals and meaningful choices can replace filler objectives.',
    tags: ['Narrative', 'Game Design'], stat: '2 hrs ago', accent: 'violet',
  },
];

// Each feed loads independently so a failed request does not hide the other feed.
function useListings(path, label) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(`Loading ${label}…`);

  useEffect(() => {
    const controller = new AbortController();
    fetch(path, { credentials: 'include', signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Unable to load ${label}.`);
        return res.json();
      })
      .then((data) => { setItems(data); setStatus(''); })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus(`Unable to load ${label}.`);
      });
    return () => controller.abort();
  }, [path, label]);

  return { items, status };
}

const jamCard = (jam) => ({
  id: jam.jamId,
  title: jam.jamTitle,
  route: `/jams/${jam.jamId}`,
  description: jam.jamDescription,
  tags: jam.jamTags || [],
  stat: `${jam.entrantCount ?? 0} joined`,
  date: jam.startTime && jam.endTime
    ? `${new Date(jam.startTime).toLocaleDateString()}–${new Date(jam.endTime).toLocaleDateString()}`
    : 'Dates not set',
});

const jobCard = (job) => ({
  id: job.jobId,
  title: job.jobTitle,
  route: '/jobs',
  externalUrl: job.siteLink,
  description: job.jobDescription,
  tags: job.jobTags || [],
});

function ItemTitle({ item }) {
  if (item.externalUrl && /^https?:\/\//i.test(item.externalUrl)) {
    return <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">{item.title}</a>;
  }
  return item.route ? <Link to={item.route}>{item.title}</Link> : item.title;
}

function ActivityGroup({ group, status }) {
  return (
    <section className="home-activity-group">
      <div className="home-activity-heading">
        <h3>{group.title}</h3>
        <Link to={group.route}>View all</Link>
      </div>
      {status && <p role="status">{status}</p>}
      <div className="home-activity-items">
        {group.items.map((item) => (
          <article className="home-activity-item" key={item.id ?? item.title}>
            <strong><ItemTitle item={item} /></strong>
            <span>{item.meta}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function DiscoveryCard({ item}) {
  return (
    <article className="home-discovery-card">
      
      <div className="home-card-content">
        <div className="home-card-meta">
          <span>{item.creator}</span>
          <span>{item.stat}</span>
        </div>
        <h3><ItemTitle item={item} /></h3>
        {item.date && <p className="home-card-date">{item.date}</p>}
        <p>{item.description}</p>
        <div className="home-card-tags">
          {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
    </article>
  );
}

function DiscoveryRow({ eyebrow, title, route, items, type, status }) {
  return (
    <section className="home-feed-section">
      <div className="home-section-heading">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <Link to={route}>Explore all <span aria-hidden="true">→</span></Link>
      </div>
      {status && <p role="status">{status}</p>}
      <div className="home-card-row">
        {items.map((item) => <DiscoveryCard item={item} type={type} key={item.id ?? item.title} />)}
      </div>
    </section>
  );
}

function Home() {
  const { items: jobs, status: jobsStatus } = useListings('/api/jobs', 'jobs');
  const { items: jams, status: jamsStatus } = useListings('/api/jams', 'jams');
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsStatus, setPostsStatus] = useState('Loading resources…');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/resources/mine', { credentials: 'include', signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('Unable to load your resources.'); return res.json(); })
      .then(data => { setPosts(data); setPostsStatus(data.length ? '' : 'You haven’t posted any resources yet.'); })
      .catch(e => { if (e.name !== 'AbortError') setPostsStatus(e.message); });
    return () => controller.abort();
  }, []);

  // Ask the backend who is logged in
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  // IDs reflect posting order; neither API exposes a creation timestamp.
  const newestJobs = [...jobs].sort((a, b) => b.jobId - a.jobId);
  const newestJams = [...jams].sort((a, b) => b.jamId - a.jamId);
  const popularJams = [...newestJams].sort((a, b) => (b.entrantCount ?? 0) - (a.entrantCount ?? 0));
  const hostedJams = user ? newestJams.filter((jam) => jam.ownerUserId === user.userId) : [];
  const postedJobs = user ? newestJobs.filter((job) => job.ownerUserId === user.userId) : [];

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '';

  return (
    <>
      <nav id="navbar" aria-label="Main navigation">
      <Link to="/">Home</Link>
      <Link to="/blogs">Blogs</Link>
      <Link to="/jams">Jams</Link>
      <Link to="/jobs">Jobs</Link>
      <Link to="/profile">Profile</Link>
      {/* Dropdown feature for resources navbar */}
      {/* Dropdown will appear on hover */}
      <div className="navbar-resources" onMouseEnter={() => setResourceMenuOpen(true)} onMouseLeave={() => setResourceMenuOpen(false)}
      onFocus={
        event => {
          if (event.target.tagName === 'A')
            setResourceMenuOpen(true);
          }
        }
      onBlur={
        event => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setResourceMenuOpen(false);
          }
        }
      onKeyDown={
        event => {
          if (event.key === 'Escape'){
              setResourceMenuOpen(false); event.stopPropagation();
            }
          }
        }>

      {/* React elements for the resource tab and its dropdown*/}
      <div className="navbar-resources-heading">
        <Link to="/resources" onClick={() => setResourceMenuOpen(false)}>Resources</Link>
        {/* For mobile users who can't "hover" over the taskbar there is a physical button that can be pressed instead*/}
        <button type="button" className="navbar-dropdown-toggle" aria-label="Resource navigation" aria-expanded={resourceMenuOpen}
          aria-controls="navbar-resource-links" onClick={() => setResourceMenuOpen(value => !value)}>▾</button>
      </div>

      {/* The Dropdown elements */}
      <div id="navbar-resource-links" className="navbar-dropdown" hidden={!resourceMenuOpen}>
        <Link to="/resources" onClick={() => setResourceMenuOpen(false)}>All resources</Link>
        <Link to="/resources/manage" onClick={() => setResourceMenuOpen(false)}>My resources</Link>
        <Link to="/resources/new" onClick={() => setResourceMenuOpen(false)}>Create a post</Link>
      </div>
    </div>
    </nav>

      <div className="home-shell">
        <aside className="home-sidebar" aria-label="Your activity">
          <div className="home-user-summary">
            <div className="home-avatar" aria-hidden="true">
              {user?.profilePicture ? <img src={user.profilePicture} alt="" /> : initials}
            </div>
            <div>
              <p>Welcome back</p>
              <h2>{fullName || 'Loading...'}</h2>
            </div>
          </div>
          <h2 className="home-sidebar-intro">Your Work</h2>
          {userActivity.map((group) => <ActivityGroup group={group} key={group.title} />)}
          <ActivityGroup status={jamsStatus || (!user ? 'Loading your activity…' : hostedJams.length ? '' : 'You haven’t hosted any jams yet.')}
            group={{ title: 'Hosted jams', route: '/jams', items: hostedJams.map((jam) => ({
              id: jam.jamId, title: jam.jamTitle, route: `/jams/${jam.jamId}`, meta: `${jam.entrantCount ?? 0} joined`,
            })) }} />
          <ActivityGroup status={jobsStatus || (!user ? 'Loading your activity…' : postedJobs.length ? '' : 'You haven’t posted any jobs yet.')}
            group={{ title: 'Posted jobs', route: '/jobs', items: postedJobs.map((job) => ({
              id: job.jobId, title: job.jobTitle, route: '/jobs', externalUrl: job.siteLink, meta: (job.jobTags || []).join(' · '),
            })) }} />
          <ActivityGroup group={{ title: 'Posted resources', route: '/resources/manage', items: posts.map(post => ({ title: post.siteName, route: post.siteLink, meta: post.overview })) }} />
          {postsStatus && <p role="status">{postsStatus}</p>}
        </aside>

        <main className="home-main">
          

          <DiscoveryRow eyebrow="Popular this week" title="Trending blogs" route="/blogs"
            items={trendingBlogs} type="blog" />
          <DiscoveryRow eyebrow="New community posts" title="New blogs" route="/blogs"
            items={newBlogs} type="blog" />
          <DiscoveryRow eyebrow="Most participants" title="Popular jams" route="/jams"
            items={popularJams.slice(0, 4).map(jamCard)} type="jam" status={jamsStatus || (!jams.length ? 'No jams posted yet.' : '')} />
          <DiscoveryRow eyebrow="Recently posted" title="New jams" route="/jams"
            items={newestJams.slice(0, 4).map(jamCard)} type="jam" status={jamsStatus || (!jams.length ? 'No jams posted yet.' : '')} />
          <DiscoveryRow eyebrow="Recently posted" title="New jobs" route="/jobs"
            items={newestJobs.slice(0, 4).map(jobCard)} type="job" status={jobsStatus || (!jobs.length ? 'No jobs posted yet.' : '')} />
        </main>
      </div>
    </>
  );
}

export default Home;
