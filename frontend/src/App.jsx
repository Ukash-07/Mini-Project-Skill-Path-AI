import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LearningPathPage from './pages/LearningPathPage';
import Recommendations from './pages/Recommendations';
import SkillGap from './pages/SkillGap';
import ExploreRoles from './pages/ExploreRoles';
import RoleDetails from './pages/RoleDetails';
import AiAssistant from './pages/AiAssistant';
import LearningResources from './pages/LearningResources';
import ProjectsAssessments from './pages/ProjectsAssessments';
import ResumeAnalyser from './pages/ResumeAnalyser';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import Assessment from './pages/Assessment';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCareers from './pages/admin/AdminCareers';
import AdminSkills from './pages/admin/AdminSkills';
import AdminCourses from './pages/admin/AdminCourses';
import AdminAssessments from './pages/admin/AdminAssessments';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><LearningPathPage /></ProtectedRoute>} />
          <Route path="/learning-path" element={<ProtectedRoute><LearningPathPage /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute><ExploreRoles /></ProtectedRoute>} />
          <Route path="/roles/:id" element={<ProtectedRoute><RoleDetails /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><LearningResources /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsAssessments /></ProtectedRoute>} />
          <Route path="/resume-analyser" element={<ProtectedRoute><ResumeAnalyser /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Navigate to="/resume-analyser" replace /></ProtectedRoute>} />

          {/* Additional Course & Assessment Routes */}
          <Route path="/my-courses" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
          <Route path="/courses/:id/learn" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/assessments/:id" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/quizzes/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><AdminStudents /></ProtectedRoute>} />
          <Route path="/admin/careers" element={<ProtectedRoute requiredRole="admin"><AdminCareers /></ProtectedRoute>} />
          <Route path="/admin/skills" element={<ProtectedRoute requiredRole="admin"><AdminSkills /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><AdminCourses /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/assessments" element={<ProtectedRoute requiredRole="admin"><AdminAssessments /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
