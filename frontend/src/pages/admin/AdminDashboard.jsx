import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Users, BookOpen, Briefcase, Award, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-slate-500">Loading admin analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-6xl">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-extrabold text-slate-900">Admin System Overview</h1>
            <p className="text-xs text-slate-500">Portal management metrics, student enrollments, and global skill gap statistics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Students</span>
              <div className="text-3xl font-black text-indigo-600">{analytics?.total_students || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Courses</span>
              <div className="text-3xl font-black text-cyan-600">{analytics?.total_courses || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Careers Configured</span>
              <div className="text-3xl font-black text-amber-600">{analytics?.total_careers || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Assessments Taken</span>
              <div className="text-3xl font-black text-emerald-600">{analytics?.assessments_completed || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Most Popular Courses</h3>
              <div className="space-y-3">
                {analytics?.popular_courses && analytics.popular_courses.map((pc, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{pc.title}</span>
                    <span className="text-indigo-600 font-bold">{pc.enrollments} Enrollments</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Common Student Skill Gaps</h3>
              <div className="space-y-3">
                {analytics?.common_skill_gaps && analytics.common_skill_gaps.map((sg, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{sg.skill_name}</span>
                    <span className="text-rose-600 font-bold">Avg Level: {sg.avg_level ? Math.round(sg.avg_level) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
