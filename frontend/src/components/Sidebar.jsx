import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Route,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  Award,
  BarChart3,
  User,
  Users,
  Briefcase,
  Target
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recommendations', label: 'AI Recommendations', icon: Sparkles },
    { to: '/skill-gap', label: 'Skill Gap Analysis', icon: Target },
    { to: '/roadmap', label: 'Personalized Roadmap', icon: Route },
    { to: '/roles', label: 'Explore Career Roles', icon: Briefcase },
    { to: '/assistant', label: 'AI Career Assistant', icon: Sparkles },
    { to: '/resources', label: 'Learning Resources', icon: BookOpen },
    { to: '/projects', label: 'Projects & Portfolio', icon: Award },
    { to: '/profile', label: 'Profile & Skills', icon: User }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/careers', label: 'Careers', icon: Briefcase },
    { to: '/admin/skills', label: 'Skills', icon: Award },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/assessments', label: 'Assessments', icon: ClipboardCheck },
    { to: '/admin/analytics', label: 'System Analytics', icon: BarChart3 }
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
            {user.role === 'admin' ? 'Management Center' : 'Learning Portal'}
          </p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/80 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
        <div className="flex items-center space-x-2 text-indigo-700 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Engine Active</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Dynamic TF-IDF & hybrid rank scoring powered by MySQL backend.
        </p>
      </div>
    </aside>
  );
}
