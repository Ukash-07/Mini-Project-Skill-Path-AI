import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { BarChart3, TrendingUp, Award, CheckCircle2, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics() {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/students/progress');
        if (res.success) setProgressData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const lineData = [
    { week: 'Wk 1', SkillLevel: 25 },
    { week: 'Wk 2', SkillLevel: 35 },
    { week: 'Wk 3', SkillLevel: 50 },
    { week: 'Wk 4', SkillLevel: 68 },
    { week: 'Wk 5', SkillLevel: 82 }
  ];

  const quizPerformanceData = [
    { quiz: 'Python Mod 1', Score: 90 },
    { quiz: 'Python Mod 2', Score: 85 },
    { quiz: 'ML Mod 1', Score: 70 },
    { quiz: 'ML Mod 2', Score: 60 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Learning Analytics</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Student Growth & Progression Metrics</h1>
            <p className="text-xs text-slate-500">Tracking skill gap reduction, assessment performance, and learning velocity</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Progression Over Time */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Skill Growth Velocity (5 Weeks)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="SkillLevel" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#0284c7', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quiz Performance Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Quiz Attempt Scores (%)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quizPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="quiz" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="Score" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
