import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Home from './pages/Home';
import Videos from './pages/Videos';
import Files from './pages/Files';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/files" element={<Files />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
