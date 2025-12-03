import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import GuestAccess from "./pages/GuestAccess";
import ProtectedRoute from "./components/ProtectedRoute";
import Learning from "./pages/Learning";
import TryGesture from "./pages/TryGesture";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      {/* Optional Top Nav (you can remove if not needed) */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link to="/" style={{ marginRight: "20px" }}>
          Login
        </Link>
        <Link to="/signup" style={{ marginRight: "20px" }}>
          Signup
        </Link>
        <Link to="/dashboard" style={{ marginRight: "20px" }}>
          Dashboard
        </Link>
      </div>

      {/* Define routes */}
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/guest" element={<GuestAccess />} />

        {/* Public gesture testing page */}
        <Route path="/try-gesture" element={<TryGesture />} />

        {/* Protected user routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/learning" element={<Learning />} />

        {/* Redirect invalid routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
