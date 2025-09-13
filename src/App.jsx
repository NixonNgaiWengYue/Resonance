import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Comments from "./pages/Comments";
import CategorizedComments from "./pages/CategorizedComments"; // 👈 import new page
import logo from "/resonance.svg"; // 👈 your logo

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* Navbar */}
        <nav className="bg-gray-800 px-6 py-3 flex items-center gap-8 shadow-md">
          {/* Logo + App Name */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Resonance Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Resonance</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-lg font-semibold ${
                  isActive ? "text-blue-400 underline" : "hover:text-blue-400"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/comments"
              className={({ isActive }) =>
                `text-lg font-semibold ${
                  isActive ? "text-blue-400 underline" : "hover:text-blue-400"
                }`
              }
            >
              Comments
            </NavLink>
            <NavLink
              to="/categorized"
              className={({ isActive }) =>
                `text-lg font-semibold ${
                  isActive ? "text-blue-400 underline" : "hover:text-blue-400"
                }`
              }
            >
              Categorized
            </NavLink>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 max-w-6xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/categorized" element={<CategorizedComments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
