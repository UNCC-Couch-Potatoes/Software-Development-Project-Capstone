import React from 'react';
import './style.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Blogs from './Blogs';
import Jams from './Jams';
import Jobs from './Jobs';
import Profile from './Profile';
import Resources from './Resources';
function App() {
  return (
    <Router>
      <Routes>
        {/* path="/" represents your landing/index page */}
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/jams" element={<Jams />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </Router>
  );
}

export default App;
