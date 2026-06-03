import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Relatorios from './pages/Reports';
import Roadmap from './pages/Roadmap';
import Integrations from './pages/Integrations';
import Achievements from './pages/Achievements';


import FutureTwin from './modules/simulator_room/FutureTwin';
import Trackers from './modules/trackers/Trackers';
import GoalTracker from './modules/trackers/goal_tracker/GoalTracker';
import ProjectTracker from './modules/trackers/project_tracker/ProjectTracker';
import SoloTaskTracker from './modules/trackers/solo_task_tracker/SoloTaskTracker';
import HabitTracker from './modules/trackers/habit_tracker/HabitTracker';
import DailyTaskTracker from './modules/trackers/daily_task_tracker/DailyTaskTracker';
import FocusRoom from './modules/focus_room/FocusRoom';
import Library from './modules/library_room/Library';

import { useAuth } from './hooks/useAuth';
import { ToastContainer } from 'react-toastify';

  function App() {
    const { token } = useAuth();
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/report" element={<Relatorios />} />
          <Route path="/roadmap" element={<Roadmap />} />

          {/* Protected Routes with AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trackers" element={<Trackers />} />
            <Route path="/trackers/goals" element={<GoalTracker />} />
            <Route path="/trackers/projects" element={<ProjectTracker />} />
            <Route path="/trackers/tasks" element={<SoloTaskTracker />} />
            <Route path="/trackers/habits" element={<HabitTracker />} />
            <Route path="/trackers/daily-tasks" element={<DailyTaskTracker />} />
            <Route path="/focus-room" element={<FocusRoom />} />
            <Route path="/future-twin" element={<FutureTwin />} />
            <Route path="/future" element={<FutureTwin />} />
            <Route path="/library" element={<Library />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/achievements" element={<Achievements />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }

export default App;
