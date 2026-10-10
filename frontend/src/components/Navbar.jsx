import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, User, Shield, Bell } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            SkillPath <span className="gradient-text">AI</span>
          </span>
          <span className="text-[10px] block font-semibold text-slate-500 tracking-wider uppercase">Recommendation Engine</span>
        </div>
      </Link>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${user.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
              <span className="text-xs font-semibold text-slate-700 capitalize">{user.role} Portal</span>
            </div>

            <button className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user.full_name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
