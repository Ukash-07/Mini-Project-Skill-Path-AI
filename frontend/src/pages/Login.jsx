import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 space-y-6 relative z-10 shadow-xl">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900">Path<span className="gradient-text">AI</span></span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to access your personalized learning path</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@learningpath.ai"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <span>Authenticating...</span> : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Create Account
            </Link>
          </p>
          <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1.5">
            <p className="font-bold text-slate-800">Demo Quick Login Credentials:</p>
            <p>Student: <span className="text-indigo-600 font-semibold font-mono">student@learningpath.ai</span> / <span className="text-indigo-600 font-semibold font-mono">Student@12345</span></p>
            <p>Admin: <span className="text-amber-700 font-semibold font-mono">admin@learningpath.ai</span> / <span className="text-amber-700 font-semibold font-mono">Admin@12345</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
