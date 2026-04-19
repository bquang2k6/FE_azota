import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, BookOpen, ShieldCheck, Home } from 'lucide-react';

// Components
import Login from './components/Login';
import ExamList from './components/ExamList';
import ExamRoom from './components/ExamRoom';
import AdminDashboard from './components/AdminDashboard';

const App = () => {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const isAdmin = userName === 'wantech';

  const handleLogin = (name) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setUserName('');
    localStorage.removeItem('userName');
  };

  return (
    <Router>
      <div className="min-h-screen bg-base-200">
        {/* Navbar */}
        {userName && (
          <div className="navbar bg-base-100 shadow-lg px-4 lg:px-20">
            <div className="flex-1">
              <Link to="/" className="btn btn-ghost text-xl font-bold gap-2">
                <BookOpen className="text-primary" />
                Azota Mini
              </Link>
            </div>
            <div className="flex-none gap-4">
              <div className="hidden sm:block">
                <span className="text-sm opacity-70">Xin chào,</span>
                <span className="ml-1 font-semibold">{userName}</span>
              </div>
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary btn-sm gap-2 shadow-sm">
                  <ShieldCheck size={18} />
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-outline btn-error btn-sm gap-2">
                <LogOut size={18} />
                Thoát
              </button>
            </div>
          </div>
        )}

        <main className="container mx-auto p-4 lg:py-8 max-w-6xl">
          {!userName ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Routes>
              <Route path="/" element={<ExamList />} />
              <Route path="/exam/:id" element={<ExamRoom userName={userName} />} />
              {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
};

export default App;
