import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { Toaster } from "react-hot-toast";

// Page Views
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import Contests from "./pages/Contests.jsx";
import ContestArena from "./pages/ContestArena.jsx";
import AiInterview from "./pages/AiInterview.jsx";
import AiInterviewSession from "./pages/AiInterviewSession.jsx";
import AiInterviewReport from "./pages/AiInterviewReport.jsx";
import AiTests from "./pages/AiTests.jsx";
import AiTestTake from "./pages/AiTestTake.jsx";
import AiTestResults from "./pages/AiTestResults.jsx";
import ResumeLab from "./pages/ResumeLab.jsx";
import Hackathons from "./pages/Hackathons.jsx";
import Messages from "./pages/Messages.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Profile from "./pages/Profile.jsx";

// Core Layout primitives
import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import MobileTabBar from "./components/layout/MobileTabBar.jsx";

// Route guards
function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-gray-500 text-xs">
        Initializing user session...
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Layout wrapper
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col relative text-gray-200">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex pt-16">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className="flex-1 min-h-[calc(100vh-64px)] pb-20 md:pb-6 relative overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {isAuthenticated && <MobileTabBar />}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <Router>
            <Toaster position="top-center" toastOptions={{
              style: {
                background: "#081528",
                color: "#F1F5F9",
                border: "1px solid rgba(14, 165, 233, 0.2)"
              }
            }} />
            <Routes>
              {/* Public Views */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Dashboard Views */}
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/contests" element={<Contests />} />
                  <Route path="/hackathons" element={<Hackathons />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ai-interview" element={<AiInterview />} />
                  <Route path="/ai-interview/report/:id" element={<AiInterviewReport />} />
                  <Route path="/ai-tests" element={<AiTests />} />
                  <Route path="/ai-tests/results/:id" element={<AiTestResults />} />
                  <Route path="/resume" element={<ResumeLab />} />
                </Route>
                
                {/* Fullscreen Arenas (No layouts) */}
                <Route path="/contests/:id/arena" element={<ContestArena />} />
                <Route path="/ai-interview/session/:id" element={<AiInterviewSession />} />
                <Route path="/ai-tests/take/:id" element={<AiTestTake />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
