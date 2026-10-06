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
  {
    title: 'Hosted jams', route: '/jams',
    items: [{ title: 'One Button Weekend', meta: 'Starts October 4 · 38 joined' }],
  },
  {
    title: 'Jam entries', route: '/jams',
    items: [
      { title: 'Signal Lost', meta: 'Cozy Fall Jam · Submitted' },
      { title: 'Tiny Terraformer', meta: 'Eco Game Jam · 12th place' },
    ],
  },
  {
    title: 'Posted jobs', route: '/jobs',
    items: [{ title: '2D Pixel Artist', meta: 'Contract · 7 applicants' }],
  },
  {
    title: 'Job applications', route: '/jobs',
    items: [
      { title: 'Gameplay Programmer', meta: 'Moonwake Studio · In review' },
      { title: 'Junior Level Designer', meta: 'Fern Games · Applied Sep 18' },
    ],
  },
  {
    title: 'Posted resources', route: '/resources',
    items: [
      { title: 'Godot Dialogue Toolkit', meta: 'Programming · 31 saves' },
      { title: 'Free Forest Sound Pack', meta: 'Audio · 18 saves' },
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

const trendingJams = [
  {
    title: 'Midnight Transmission', creator: 'Hosted by Lantern Collective',
    description: 'Make a game about a message that was never meant to be received.',
    tags: ['10 days', 'Any engine'], stat: '842 joined', date: 'Sep 27–Oct 7', accent: 'blue',
  },
  {
    title: 'Tiny Worlds Jam', creator: 'Hosted by Mossy Rock',
    description: 'Build an entire world inside the smallest space you can imagine.',
    tags: ['7 days', 'Beginner friendly'], stat: '591 joined', date: 'Oct 2–9', accent: 'green',
  },
  {
    title: 'Boss Rush 2026', creator: 'Hosted by Action Guild',
    description: 'Skip the filler and create your most memorable boss encounter.',
    tags: ['2 weeks', 'Teams allowed'], stat: '419 joined', date: 'Oct 10–24', accent: 'coral',
  },
  {
    title: 'No Dialogue Jam', creator: 'Hosted by Quiet Games',
    description: 'Tell a complete story without using written or spoken dialogue.',
    tags: ['72 hours', 'Narrative'], stat: '306 joined', date: 'Oct 16–19', accent: 'violet',
  },
];

const newJams = [
  {
    title: 'One Button Weekend', creator: 'Hosted by You',
    description: 'Design a complete game around a single input and a surprising outcome.',
    tags: ['48 hours', 'All skill levels'], stat: '38 joined', date: 'Oct 4–6', accent: 'violet',
  },
  {
    title: 'Autumn Cozy Jam', creator: 'Hosted by Warm Mug Studio',
    description: 'Create something small, comforting, and full of autumn atmosphere.',
    tags: ['9 days', 'Cozy'], stat: '24 joined', date: 'Oct 8–17', accent: 'coral',
  },
  {
    title: 'Low Poly Legends', creator: 'Hosted by Vertex Club',
    description: 'Celebrate bold silhouettes and expressive worlds with limited geometry.',
    tags: ['1 week', '3D'], stat: '19 joined', date: 'Oct 12–19', accent: 'green',
  },
  {
    title: 'Friendly Rivalry Jam', creator: 'Hosted by Couch Co-op',
    description: 'Build a local multiplayer game where competition creates good stories.',
    tags: ['5 days', 'Multiplayer'], stat: '11 joined', date: 'Oct 20–25', accent: 'blue',
  },
];

function ActivityGroup({ group }) {
  return (
    <section className="home-activity-group">
      <div className="home-activity-heading">
        <h3>{group.title}</h3>
        <Link to={group.route}>View all</Link>
      </div>
      <div className="home-activity-items">
        {group.items.map((item) => (
          <article className="home-activity-item" key={item.title}>
            <strong>{item.title}</strong>
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
        <h3>{item.title}</h3>
        {item.date && <p className="home-card-date">{item.date}</p>}
        <p>{item.description}</p>
        <div className="home-card-tags">
          {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
    </article>
  );
}

function DiscoveryRow({ eyebrow, title, route, items, type }) {
  return (
    <section className="home-feed-section">
      <div className="home-section-heading">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <Link to={route}>Explore all <span aria-hidden="true">→</span></Link>
      </div>
      <div className="home-card-row">
        {items.map((item) => <DiscoveryCard item={item} type={type} key={item.title} />)}
      </div>
    </section>
  );
}

function Home() {
  const [user, setUser] = useState(null);

  // Ask the backend who is logged in
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '';

  return (
    <>
      <div id="navbar">
        <Link to="/">Home</Link>
        <Link to="/Blogs">Blogs</Link>
        <Link to="/Jams">Jams</Link>
        <Link to="/Jobs">Jobs</Link>
        <Link to="/Profile">Profile</Link>
        <Link to="/Resources">Resources</Link>
      </div>

      <div className="home-shell">
        <aside className="home-sidebar" aria-label="Your activity">
          <div className="home-user-summary">
            <div className="home-avatar" aria-hidden="true">{initials}</div>
            <div>
              <p>Welcome back</p>
              <h2>{fullName || 'Loading...'}</h2>
            </div>
          </div>
          <h2 className="home-sidebar-intro">Your Work</h2>
          {userActivity.map((group) => <ActivityGroup group={group} key={group.title} />)}
        </aside>

        <main className="home-main">
          

          <DiscoveryRow eyebrow="Popular this week" title="Trending blogs" route="/blogs"
            items={trendingBlogs} type="blog" />
          <DiscoveryRow eyebrow="New community posts" title="New blogs" route="/blogs"
            items={newBlogs} type="blog" />
          <DiscoveryRow eyebrow="Top Jams" title="Trending jams" route="/jams"
            items={trendingJams} type="jam" />
          <DiscoveryRow eyebrow="Open for entries" title="New jams" route="/jams"
            items={newJams} type="jam" />
        </main>
      </div>
    </>
  );
}

export default Home;
